/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'node:path';
import { Storage } from '../config/storage.js';
import { resolveToRealPath } from '../utils/paths.js';

export const DEFAULT_CONTEXT_FILENAME = 'onyx.md';
export const PROJECT_MEMORY_INDEX_FILENAME = 'MEMORY.md';

// This variable will hold the currently configured filenames for onyx.md context files.
// It defaults to DEFAULT_CONTEXT_FILENAME but can be extended by setOnyxMdFilename.
let currentOnyxMdFilename: string | string[] = DEFAULT_CONTEXT_FILENAME;

/**
 * Adds one or more filenames to the current context filenames.
 * Ensures uniqueness and maintains order.
 */
export function setOnyxMdFilename(newFilename: string | string[]): void {
  const filenames = Array.isArray(newFilename) ? newFilename : [newFilename];
  const current = getAllOnyxMdFilenames();
  const next = new Set<string>();

  for (const filename of filenames) {
    const trimmed = filename.trim();
    if (trimmed !== '') {
      const normalized = path.normalize(trimmed);
      // Sanitize to prevent path traversal while allowing subdirectories
      const validatedPath = resolveToRealPath(normalized);
      if (validatedPath) {
        next.add(normalized);
      }
    }
  }

  for (const filename of current) {
    next.add(filename);
  }

  const result = Array.from(next);
  if (result.length > 1) {
    currentOnyxMdFilename = result;
  } else if (result.length === 1) {
    currentOnyxMdFilename = result[0];
  }
}

/**
 * Resets the context filenames to the provided value, or the default if none provided.
 * This replaces all current filenames.
 */
export function resetOnyxMdFilename(
  filename: string | string[] = DEFAULT_CONTEXT_FILENAME,
): void {
  const filenames = Array.isArray(filename) ? filename : [filename];
  const cleaned = Array.from(
    new Set(
      filenames
        .map((f) => path.normalize(f.trim()))
        .filter((f) => !!resolveToRealPath(f)),
    ),
  );

  if (cleaned.length === 0) {
    currentOnyxMdFilename = DEFAULT_CONTEXT_FILENAME;
  } else if (cleaned.length === 1) {
    currentOnyxMdFilename = cleaned[0];
  } else {
    currentOnyxMdFilename = cleaned;
  }
}

export function getCurrentOnyxMdFilename(): string {
  if (Array.isArray(currentOnyxMdFilename)) {
    return currentOnyxMdFilename[0];
  }
  return currentOnyxMdFilename;
}

export function getAllOnyxMdFilenames(): string[] {
  if (Array.isArray(currentOnyxMdFilename)) {
    return currentOnyxMdFilename;
  }
  return [currentOnyxMdFilename];
}

export function getGlobalMemoryFilePath(): string {
  return path.join(Storage.getGlobalOnyxDir(), getCurrentOnyxMdFilename());
}

export function getProjectMemoryIndexFilePath(storage: Storage): string {
  return path.join(
    storage.getProjectMemoryDir(),
    PROJECT_MEMORY_INDEX_FILENAME,
  );
}

