/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../../test-utils/render.js';
import { useAuthCommand, validateAuthMethodWithSettings } from './useAuth.js';
import { AuthType, type Config, ProjectIdRequiredError } from '@onyx/core';
import { AuthState } from '../types.js';
import type { LoadedSettings } from '../../config/settings.js';

// Mock dependencies
const mockLoadApiKey = vi.fn();
const mockValidateAuthMethod = vi.fn();

vi.mock('@onyx/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@onyx/core')>();
  return {
    ...actual,
    loadApiKey: () => mockLoadApiKey(),
  };
});

vi.mock('../../config/auth.js', () => ({
  validateAuthMethod: (authType: AuthType) => mockValidateAuthMethod(authType),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env['ONYX_API_KEY'];
    delete process.env['ONYX_DEFAULT_AUTH_TYPE'];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateAuthMethodWithSettings', () => {
    it('should return error if auth type is enforced and does not match', async () => {
      const settings = {
        merged: {
          security: {
            auth: {
              enforcedType: AuthType.LOGIN_WITH_GOOGLE,
            },
          },
        },
      } as LoadedSettings;

      const error = await validateAuthMethodWithSettings(
        AuthType.USE_ONYX,
        settings,
      );
      expect(error).toContain('Authentication is enforced to be oauth');
    });

    it('should return null if useExternal is true', async () => {
      const settings = {
        merged: {
          security: {
            auth: {
              useExternal: true,
            },
          },
        },
      } as LoadedSettings;

      const error = await validateAuthMethodWithSettings(
        AuthType.LOGIN_WITH_GOOGLE,
        settings,
      );
      expect(error).toBeNull();
    });

    it('should return null if authType is USE_ONYX', async () => {
      const settings = {
        merged: {
          security: {
            auth: {},
          },
        },
      } as LoadedSettings;

      const error = await validateAuthMethodWithSettings(
        AuthType.USE_ONYX,
        settings,
      );
      expect(error).toBeNull();
    });

    it('should call validateAuthMethod for other auth types', async () => {
      const settings = {
        merged: {
          security: {
            auth: {},
          },
        },
      } as LoadedSettings;

      mockValidateAuthMethod.mockResolvedValue('Validation Error');
      const error = await validateAuthMethodWithSettings(
        AuthType.LOGIN_WITH_GOOGLE,
        settings,
      );
      expect(error).toBe('Validation Error');
      expect(mockValidateAuthMethod).toHaveBeenCalledWith(
        AuthType.LOGIN_WITH_GOOGLE,
      );
    });
  });

  describe('useAuthCommand', () => {
    const mockConfig = {
      refreshAuth: vi.fn(),
    } as unknown as Config;

    const createSettings = (selectedType?: AuthType) =>
      ({
        merged: {
          security: {
            auth: {
              selectedType,
            },
          },
        },
      }) as LoadedSettings;

    let deferredRefreshAuth: {
      resolve: () => void;
      reject: (e: Error) => void;
    };

    beforeEach(() => {
      vi.mocked(mockConfig.refreshAuth).mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            deferredRefreshAuth = { resolve, reject };
          }),
      );
    });

    it('should initialize with Unauthenticated state', async () => {
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );
      // Because we defer refreshAuth, the initial state is safely caught here
      expect(result.current.authState).toBe(AuthState.Unauthenticated);

      await act(async () => {
        deferredRefreshAuth.resolve();
      });

      expect(result.current.authState).toBe(AuthState.Authenticated);
    });

    it('should set error if no auth type is selected and no env key', async () => {
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(undefined), mockConfig),
      );

      // This happens synchronously, no deferred promise
      expect(result.current.authError).toBe(
        'No authentication method selected.',
      );
      expect(result.current.authState).toBe(AuthState.Updating);
    });

    it('should set error if no auth type is selected but env key exists', async () => {
      process.env['ONYX_API_KEY'] = 'env-key';
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(undefined), mockConfig),
      );

      expect(result.current.authError).toContain(
        'Existing API key detected (ONYX_API_KEY)',
      );
      expect(result.current.authState).toBe(AuthState.Updating);
    });

    it('should transition to AwaitingApiKeyInput if USE_ONYX and no key found', async () => {
      let deferredLoadKey: { resolve: (k: string | null) => void };
      mockLoadApiKey.mockImplementation(
        () =>
          new Promise((resolve) => {
            deferredLoadKey = { resolve };
          }),
      );

      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.USE_ONYX), mockConfig),
      );

      await act(async () => {
        deferredLoadKey.resolve(null);
      });

      expect(result.current.authState).toBe(AuthState.AwaitingApiKeyInput);
    });

    it('should authenticate if USE_ONYX and key is found', async () => {
      let deferredLoadKey: { resolve: (k: string | null) => void };
      mockLoadApiKey.mockImplementation(
        () =>
          new Promise((resolve) => {
            deferredLoadKey = { resolve };
          }),
      );

      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.USE_ONYX), mockConfig),
      );

      await act(async () => {
        deferredLoadKey.resolve('stored-key');
      });

      await act(async () => {
        deferredRefreshAuth.resolve();
      });

      expect(mockConfig.refreshAuth).toHaveBeenCalledWith(AuthType.USE_ONYX);
      expect(result.current.authState).toBe(AuthState.Authenticated);
      expect(result.current.apiKeyDefaultValue).toBe('stored-key');
    });

    it('should authenticate if USE_ONYX and env key is found', async () => {
      process.env['ONYX_API_KEY'] = 'env-key';

      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.USE_ONYX), mockConfig),
      );

      await act(async () => {
        deferredRefreshAuth.resolve();
      });

      expect(mockConfig.refreshAuth).toHaveBeenCalledWith(AuthType.USE_ONYX);
      expect(result.current.authState).toBe(AuthState.Authenticated);
      expect(result.current.apiKeyDefaultValue).toBe('env-key');
    });

    it('should prioritize env key over stored key when both are present', async () => {
      process.env['ONYX_API_KEY'] = 'env-key';

      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.USE_ONYX), mockConfig),
      );

      await act(async () => {
        deferredRefreshAuth.resolve();
      });

      expect(mockConfig.refreshAuth).toHaveBeenCalledWith(AuthType.USE_ONYX);
      expect(result.current.authState).toBe(AuthState.Authenticated);
      expect(result.current.apiKeyDefaultValue).toBe('env-key');
    });

    it('should set error if validation fails', async () => {
      mockValidateAuthMethod.mockResolvedValue('Validation Failed');
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );

      expect(result.current.authError).toBe('Validation Failed');
      expect(result.current.authState).toBe(AuthState.Updating);
    });

    it('should set error if ONYX_DEFAULT_AUTH_TYPE is invalid', async () => {
      process.env['ONYX_DEFAULT_AUTH_TYPE'] = 'INVALID_TYPE';
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );

      expect(result.current.authError).toContain(
        'Invalid value for ONYX_DEFAULT_AUTH_TYPE',
      );
      expect(result.current.authState).toBe(AuthState.Updating);
    });

    it('should authenticate successfully for valid auth type', async () => {
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );

      await act(async () => {
        deferredRefreshAuth.resolve();
      });

      expect(mockConfig.refreshAuth).toHaveBeenCalledWith(
        AuthType.LOGIN_WITH_GOOGLE,
      );
      expect(result.current.authState).toBe(AuthState.Authenticated);
      expect(result.current.authError).toBeNull();
    });

    it('should handle refreshAuth failure', async () => {
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );

      await act(async () => {
        deferredRefreshAuth.reject(new Error('Auth Failed'));
      });

      expect(result.current.authError).toContain('Failed to sign in');
      expect(result.current.authState).toBe(AuthState.Updating);
    });

    it('should handle ProjectIdRequiredError without "Failed to login" prefix', async () => {
      const projectIdError = new ProjectIdRequiredError();
      const { result } = await renderHook(() =>
        useAuthCommand(createSettings(AuthType.LOGIN_WITH_GOOGLE), mockConfig),
      );

      await act(async () => {
        deferredRefreshAuth.reject(projectIdError);
      });

      expect(result.current.authError).toBe(
        'This account requires setting the GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_PROJECT_ID env var. See https://goo.gle/onyx-cli-auth-docs#workspace-gca',
      );
      expect(result.current.authError).not.toContain('Failed to login');
      expect(result.current.authState).toBe(AuthState.Updating);
    });
  });
});
