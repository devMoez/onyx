/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { render } from '../../test-utils/render.js';
import { Tips } from './Tips.js';
import { describe, it, expect, vi } from 'vitest';
import type { Config } from '@onyx/core';

describe('Tips', () => {
  it.each([
    { fileCount: 0, description: 'renders all tips including onyx.md tip' },
    { fileCount: 5, description: 'renders fewer tips when onyx.md exists' },
  ])('$description', async ({ fileCount }) => {
    const config = {
      getOnyxMdFileCount: vi.fn().mockReturnValue(fileCount),
    } as unknown as Config;

    const { lastFrame, unmount } = await render(<Tips config={config} />);
    expect(lastFrame()).toMatchSnapshot();
    unmount();
  });
});

