/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Experiments } from './types.js';

export type { Experiments };

/**
 * Gets the experiments from the server.
 *
 * The experiments are cached so that they are only fetched once.
 */
export async function getExperiments(
  _server?: any,
): Promise<Experiments> {
  // Onyx modification: Disable remote experiments to avoid phoning home.
  return { flags: {}, experimentIds: [] };
}
