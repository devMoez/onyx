/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_CONTEXT_FILENAME,
  getAllOnyxMdFilenames,
  resetOnyxMdFilename,
  setOnyxMdFilename,
} from './memoryTool.js';

describe('memoryTool filename helpers', () => {
  afterEach(() => {
    resetOnyxMdFilename(DEFAULT_CONTEXT_FILENAME);
  });

  describe('setOnyxMdFilename', () => {
    it('appends to currentOnyxMdFilename when a valid new name is provided', () => {
      const newName = 'CUSTOM_CONTEXT.md';
      setOnyxMdFilename(newName);
      expect(getAllOnyxMdFilenames()).toEqual([
        newName,
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });

    it('does not update currentOnyxMdFilename if the new name is empty or whitespace', () => {
      const initialNames = getAllOnyxMdFilenames();
      setOnyxMdFilename('  ');
      expect(getAllOnyxMdFilenames()).toEqual(initialNames);

      setOnyxMdFilename('');
      expect(getAllOnyxMdFilenames()).toEqual(initialNames);
    });

    it('handles adding an array of filenames', () => {
      const newNames = ['CUSTOM_CONTEXT.md', 'ANOTHER_CONTEXT.md'];
      setOnyxMdFilename(newNames);
      expect(getAllOnyxMdFilenames()).toEqual([
        ...newNames,
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });

    it('ensures uniqueness when adding names', () => {
      setOnyxMdFilename(DEFAULT_CONTEXT_FILENAME);
      expect(getAllOnyxMdFilenames()).toEqual([DEFAULT_CONTEXT_FILENAME]);

      setOnyxMdFilename(['NEW.md', 'NEW.md']);
      expect(getAllOnyxMdFilenames()).toEqual([
        'NEW.md',
        DEFAULT_CONTEXT_FILENAME,
      ]);
    });
  });

  describe('resetOnyxMdFilename', () => {
    it('replaces all filenames with the provided one', () => {
      setOnyxMdFilename('OTHER.md');
      resetOnyxMdFilename('RESET.md');
      expect(getAllOnyxMdFilenames()).toEqual(['RESET.md']);
    });

    it('resets to default if no argument provided', () => {
      resetOnyxMdFilename('OTHER.md');
      resetOnyxMdFilename(DEFAULT_CONTEXT_FILENAME);
      expect(getAllOnyxMdFilenames()).toEqual([DEFAULT_CONTEXT_FILENAME]);
    });

    it('handles array reset', () => {
      resetOnyxMdFilename(['A.md', 'B.md']);
      expect(getAllOnyxMdFilenames()).toEqual(['A.md', 'B.md']);
    });
  });
});
