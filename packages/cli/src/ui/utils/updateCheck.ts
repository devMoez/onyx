/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export async function checkForUpdates(
  _settings: any,
): Promise<any | null> {
  // Onyx modification: Disable update checks to avoid phoning home.
  return null;
}
