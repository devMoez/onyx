/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import type * as osActual from 'node:os';

vi.mock('node:os', async (importOriginal) => {
  const actualOs = await importOriginal<typeof osActual>();
  return {
    ...actualOs,
    homedir: vi.fn(() => path.resolve('/mock/home')),
    platform: vi.fn(() => 'linux'),
  };
});

vi.mock('@onyx/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@onyx/core')>();
  return {
    ...actual,
    homedir: vi.fn(() => path.resolve('/mock/home')),
  };
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { loadEnvironment, type Settings } from './settings.js';
import { ONYX_DIR, homedir as coreHomedir } from '@onyx/core';

vi.mock('node:fs');

describe('Environment Isolation', () => {
  const mockHome = path.resolve('/mock/home');
  const mockWorkspace = path.resolve('/mock/workspace');
  const originalArgv = process.argv;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(os.homedir).mockReturnValue(mockHome);
    vi.mocked(coreHomedir).mockReturnValue(mockHome);
    // Default to no files existing
    vi.mocked(fs.existsSync).mockReturnValue(false);
    process.argv = ['node', 'onyx'];

    // Clear env vars that might leak from the host environment
    delete process.env['ONYX_API_KEY'];
    delete process.env['OTHER_VAR'];
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.env = { ...originalEnv };
  });

  it('should load local .env by default', () => {
    const workspaceEnv = path.join(mockWorkspace, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === workspaceEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=local');

    const settings = { advanced: { ignoreLocalEnv: false } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBe('local');
    delete process.env['ONYX_API_KEY'];
  });

  it('should ignore local .env when ignoreLocalEnv is true', () => {
    const workspaceEnv = path.join(mockWorkspace, '.env');
    const homeEnv = path.join(mockHome, '.env');

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = p.toString();
      return ps === workspaceEnv || ps === homeEnv;
    });
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const ps = p.toString();
      if (ps === workspaceEnv) return 'ONYX_API_KEY=local';
      if (ps === homeEnv) return 'ONYX_API_KEY=home';
      return '';
    });

    const settings = { advanced: { ignoreLocalEnv: true } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    // Should skip local and find home
    expect(process.env['ONYX_API_KEY']).toBe('home');
    delete process.env['ONYX_API_KEY'];
  });

  it('should still load .onyx/.env even if ignoreLocalEnv is true', () => {
    const workspaceOnyxEnv = path.join(mockWorkspace, ONYX_DIR, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === workspaceOnyxEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=onyx-local');

    const settings = { advanced: { ignoreLocalEnv: true } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBe('onyx-local');
    delete process.env['ONYX_API_KEY'];
  });

  it('should respect --ignore-env flag', () => {
    const workspaceEnv = path.join(mockWorkspace, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === workspaceEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=local');

    process.argv = ['node', 'onyx', '--ignore-env'];
    const settings = { advanced: { ignoreLocalEnv: false } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBeUndefined();
  });

  it('should allow home .env even with ignoreLocalEnv true', () => {
    const homeEnv = path.join(mockHome, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === homeEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=home');

    const settings = { advanced: { ignoreLocalEnv: true } } as Settings;
    // Running from home dir
    loadEnvironment(settings, mockHome, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBe('home');
    delete process.env['ONYX_API_KEY'];
  });

  it('should skip local .env and its parents until home when ignoreLocalEnv is true', () => {
    const deepProject = path.join(mockWorkspace, 'deep', 'dir');
    const deepEnv = path.join(deepProject, '.env');
    const parentEnv = path.join(mockWorkspace, '.env');
    const homeEnv = path.join(mockHome, '.env');

    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const ps = p.toString();
      return ps === deepEnv || ps === parentEnv || ps === homeEnv;
    });
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const ps = p.toString();
      if (ps === deepEnv) return 'ONYX_API_KEY=deep';
      if (ps === parentEnv) return 'ONYX_API_KEY=parent';
      if (ps === homeEnv) return 'ONYX_API_KEY=home';
      return '';
    });

    const settings = { advanced: { ignoreLocalEnv: true } } as Settings;
    loadEnvironment(settings, deepProject, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBe('home');
    delete process.env['ONYX_API_KEY'];
  });

  it('should respect trust whitelist even when loading from home .env', () => {
    const homeEnv = path.join(mockHome, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === homeEnv,
    );
    // Include one whitelisted and one non-whitelisted variable
    vi.mocked(fs.readFileSync).mockReturnValue(
      'ONYX_API_KEY=home\nOTHER_VAR=secret',
    );

    const settings = { advanced: { ignoreLocalEnv: true } } as Settings;
    // Running from an UNTRUSTED workspace
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: false,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBe('home');
    expect(process.env['OTHER_VAR']).toBeUndefined();
    delete process.env['ONYX_API_KEY'];
  });

  it('should prioritize --ignore-env flag even if setting is false', () => {
    const workspaceEnv = path.join(mockWorkspace, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === workspaceEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=local');

    process.argv = ['node', 'onyx', '--ignore-env'];
    const settings = { advanced: { ignoreLocalEnv: false } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBeUndefined();
  });

  it('should respect both -s and --ignore-env flags simultaneously', () => {
    const workspaceEnv = path.join(mockWorkspace, '.env');
    vi.mocked(fs.existsSync).mockImplementation(
      (p) => p.toString() === workspaceEnv,
    );
    vi.mocked(fs.readFileSync).mockReturnValue('ONYX_API_KEY=local');

    process.argv = ['node', 'onyx', '-s', '--ignore-env'];
    const settings = { advanced: { ignoreLocalEnv: false } } as Settings;
    loadEnvironment(settings, mockWorkspace, () => ({
      isTrusted: true,
      source: 'file',
    }));

    expect(process.env['ONYX_API_KEY']).toBeUndefined();
  });
});

