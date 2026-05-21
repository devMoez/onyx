/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { normalizeModelId } from './modelUtils.js';

describe('modelUtils', () => {
  describe('normalizeModelId', () => {
    it('should strip "models/" prefix if present', () => {
      expect(normalizeModelId('models/onyx-3.1-pro-preview')).toBe(
        'onyx-3.1-pro-preview',
      );
      expect(normalizeModelId('models/onyx-1.5-flash')).toBe(
        'onyx-1.5-flash',
      );
    });

    it('should leave model ID untouched if prefix is not present', () => {
      expect(normalizeModelId('onyx-3.1-pro-preview')).toBe(
        'onyx-3.1-pro-preview',
      );
      expect(normalizeModelId('auto')).toBe('auto');
    });

    it('should handle empty string', () => {
      expect(normalizeModelId('')).toBe('');
    });
  });
});
