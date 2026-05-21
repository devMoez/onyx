/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThinkingLevel } from '@google/genai';
import type { ModelConfigServiceConfig } from '../services/modelConfigService.js';
import { DEFAULT_THINKING_MODE } from './models.js';

// The default model configs. We use `base` as the parent for all of our model
// configs, while `chat-base`, a child of `base`, is the parent of the models
// we use in the "chat" experience.
export const DEFAULT_MODEL_CONFIGS: ModelConfigServiceConfig = {
  aliases: {
    base: {
      modelConfig: {
        generateContentConfig: {
          temperature: 0,
          topP: 1,
        },
      },
    },
    'chat-base': {
      extends: 'base',
      modelConfig: {
        generateContentConfig: {
          thinkingConfig: {
            includeThoughts: true,
          },
          temperature: 1,
          topP: 0.95,
          topK: 64,
        },
      },
    },
    'chat-base-2.5': {
      extends: 'chat-base',
      modelConfig: {
        generateContentConfig: {
          thinkingConfig: {
            thinkingBudget: DEFAULT_THINKING_MODE,
          },
        },
      },
    },
    'chat-base-3': {
      extends: 'chat-base',
      modelConfig: {
        generateContentConfig: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      },
    },
    // Because `onyx-2.5-pro` and related model configs are "user-facing"
    // today, i.e. they could be passed via `--model`, we have to be careful to
    // ensure these model configs can be used interactively.
    // TODO(joshualitt): Introduce internal base configs for the various models,
    // note: we will have to think carefully about names.
    'onyx-3-pro-preview': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'onyx-3-pro-preview',
      },
    },
    'onyx-3-flash-preview': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'onyx-3-flash-preview',
      },
    },
    'onyx-3.1-pro-preview': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'onyx-3.1-pro-preview',
      },
    },
    'onyx-3.1-pro-preview-customtools': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'onyx-3.1-pro-preview-customtools',
      },
    },
    'onyx-3.1-flash-lite-preview': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'onyx-3.1-flash-lite-preview',
      },
    },
    'onyx-2.5-pro': {
      extends: 'chat-base-2.5',
      modelConfig: {
        model: 'onyx-2.5-pro',
      },
    },
    'onyx-2.5-flash': {
      extends: 'chat-base-2.5',
      modelConfig: {
        model: 'onyx-2.5-flash',
      },
    },
    'onyx-2.5-flash-lite': {
      extends: 'chat-base-2.5',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
      },
    },
    'gemma-4-31b-it': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'gemma-4-31b-it',
      },
    },
    'gemma-4-26b-a4b-it': {
      extends: 'chat-base-3',
      modelConfig: {
        model: 'gemma-4-26b-a4b-it',
      },
    },

    // Bases for the internal model configs.
    'onyx-2.5-flash-base': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash',
      },
    },
    'onyx-3-flash-base': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-3-flash-preview',
      },
    },
    classifier: {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          maxOutputTokens: 1024,
          thinkingConfig: {
            thinkingBudget: 512,
          },
        },
      },
    },
    'prompt-completion': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          temperature: 0.3,
          maxOutputTokens: 16000,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    },
    'fast-ack-helper': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          temperature: 0.2,
          maxOutputTokens: 120,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    },
    'edit-corrector': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      },
    },
    'summarizer-default': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          maxOutputTokens: 2000,
        },
      },
    },
    'summarizer-shell': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
        generateContentConfig: {
          maxOutputTokens: 2000,
        },
      },
    },
    'web-search': {
      extends: 'onyx-3-flash-base',
      modelConfig: {
        generateContentConfig: {
          tools: [{ googleSearch: {} }],
        },
      },
    },
    'web-fetch': {
      extends: 'onyx-3-flash-base',
      modelConfig: {
        generateContentConfig: {
          tools: [{ urlContext: {} }],
        },
      },
    },
    // TODO(joshualitt): During cleanup, make modelConfig optional.
    'web-fetch-fallback': {
      extends: 'onyx-3-flash-base',
      modelConfig: {},
    },
    'loop-detection': {
      extends: 'onyx-3-flash-base',
      modelConfig: {},
    },
    'loop-detection-double-check': {
      extends: 'base',
      modelConfig: {
        model: 'onyx-3-pro-preview',
      },
    },
    'llm-edit-fixer': {
      extends: 'onyx-3-flash-base',
      modelConfig: {},
    },
    'next-speaker-checker': {
      extends: 'onyx-3-flash-base',
      modelConfig: {},
    },
    'context-snapshotter': {
      extends: 'onyx-3-flash-base',
      modelConfig: {
        generateContentConfig: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          temperature: 1,
          topP: 0.95,
          topK: 64,
        },
      },
    },
    'chat-compression-3-pro': {
      modelConfig: {
        model: 'onyx-3-pro-preview',
      },
    },
    'chat-compression-3-flash': {
      modelConfig: {
        model: 'onyx-3-flash-preview',
      },
    },
    'chat-compression-3.1-flash-lite': {
      modelConfig: {
        model: 'onyx-3.1-flash-lite-preview',
      },
    },
    'chat-compression-2.5-pro': {
      modelConfig: {
        model: 'onyx-2.5-pro',
      },
    },
    'chat-compression-2.5-flash': {
      modelConfig: {
        model: 'onyx-2.5-flash',
      },
    },
    'chat-compression-2.5-flash-lite': {
      modelConfig: {
        model: 'onyx-2.5-flash-lite',
      },
    },
    'chat-compression-default': {
      modelConfig: {
        model: 'onyx-3-pro-preview',
      },
    },
    'agent-history-provider-summarizer': {
      modelConfig: {
        model: 'onyx-3-flash-preview',
      },
    },
  },
  overrides: [
    {
      match: { model: 'chat-base', isRetry: true },
      modelConfig: {
        generateContentConfig: {
          temperature: 1,
        },
      },
    },
  ],
  modelDefinitions: {
    // Concrete Models
    'onyx-3.1-flash-lite-preview': {
      tier: 'flash-lite',
      family: 'onyx-3',
      isPreview: true,
      isVisible: true,
      features: { thinking: false, multimodalToolUse: true },
    },
    'onyx-3.1-pro-preview': {
      tier: 'pro',
      family: 'onyx-3',
      isPreview: true,
      isVisible: true,
      features: { thinking: true, multimodalToolUse: true },
    },
    'onyx-3.1-pro-preview-customtools': {
      tier: 'pro',
      family: 'onyx-3',
      isPreview: true,
      isVisible: false,
      features: { thinking: true, multimodalToolUse: true },
    },
    'onyx-3-pro-preview': {
      tier: 'pro',
      family: 'onyx-3',
      isPreview: true,
      isVisible: true,
      features: { thinking: true, multimodalToolUse: true },
    },
    'onyx-3-flash-preview': {
      tier: 'flash',
      family: 'onyx-3',
      isPreview: true,
      isVisible: true,
      features: { thinking: false, multimodalToolUse: true },
    },
    'onyx-2.5-pro': {
      tier: 'pro',
      family: 'onyx-2.5',
      isPreview: false,
      isVisible: true,
      features: { thinking: false, multimodalToolUse: false },
    },
    'onyx-2.5-flash': {
      tier: 'flash',
      family: 'onyx-2.5',
      isPreview: false,
      isVisible: true,
      features: { thinking: false, multimodalToolUse: false },
    },
    'onyx-2.5-flash-lite': {
      tier: 'flash-lite',
      family: 'onyx-2.5',
      isPreview: false,
      isVisible: true,
      features: { thinking: false, multimodalToolUse: false },
    },
    'gemma-4-31b-it': {
      displayName: 'gemma-4-31b-it',
      tier: 'custom',
      family: 'gemma-4',
      isPreview: false,
      isVisible: true,
      features: { thinking: true, multimodalToolUse: false },
    },
    'gemma-4-26b-a4b-it': {
      displayName: 'gemma-4-26b-a4b-it',
      tier: 'custom',
      family: 'gemma-4',
      isPreview: false,
      isVisible: true,
      features: { thinking: true, multimodalToolUse: false },
    },

    // Aliases
    auto: {
      displayName: 'Auto',
      tier: 'auto',
      isPreview: true,
      isVisible: true,
      features: { thinking: true, multimodalToolUse: false },
    },
    pro: {
      tier: 'pro',
      isPreview: false,
      isVisible: false,
      features: { thinking: true, multimodalToolUse: false },
    },
    flash: {
      tier: 'flash',
      isPreview: false,
      isVisible: false,
      features: { thinking: false, multimodalToolUse: false },
    },
    'flash-lite': {
      tier: 'flash-lite',
      isPreview: false,
      isVisible: false,
      features: { thinking: false, multimodalToolUse: false },
    },
    'auto-onyx-3': {
      tier: 'auto',
      family: 'onyx-3',
      isPreview: true,
      isVisible: false,
    },
    'auto-onyx-2.5': {
      tier: 'auto',
      family: 'onyx-2.5',
      isPreview: false,
      isVisible: false,
    },
  },
  modelIdResolutions: {
    'gemma-4-31b-it': {
      default: 'gemma-4-31b-it',
    },
    'gemma-4-26b-a4b-it': {
      default: 'gemma-4-26b-a4b-it',
    },

    'onyx-3.1-pro-preview': {
      default: 'onyx-3.1-pro-preview',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
        {
          condition: { useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
      ],
    },
    'onyx-3.1-pro-preview-customtools': {
      default: 'onyx-3.1-pro-preview-customtools',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
      ],
    },
    'onyx-3-flash-preview': {
      default: 'onyx-3-flash-preview',
      contexts: [
        {
          condition: { hasAccessToPreview: false },
          target: 'onyx-2.5-flash',
        },
      ],
    },
    'onyx-3-pro-preview': {
      default: 'onyx-3-pro-preview',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
        {
          condition: { useOnyx3_1: true, useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
        {
          condition: { useOnyx3_1: true },
          target: 'onyx-3.1-pro-preview',
        },
      ],
    },
    auto: {
      default: 'onyx-3-pro-preview',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
        {
          condition: { useOnyx3_1: true, useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
        {
          condition: { useOnyx3_1: true },
          target: 'onyx-3.1-pro-preview',
        },
      ],
    },
    pro: {
      default: 'onyx-3-pro-preview',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
        {
          condition: { useOnyx3_1: true, useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
        {
          condition: { useOnyx3_1: true },
          target: 'onyx-3.1-pro-preview',
        },
      ],
    },
    'onyx-3.1-flash-lite-preview': {
      default: 'onyx-3.1-flash-lite-preview',
      contexts: [
        {
          condition: { useOnyx3_1FlashLite: false },
          target: 'onyx-2.5-flash-lite',
        },
      ],
    },
    flash: {
      default: 'onyx-3-flash-preview',
      contexts: [
        {
          condition: { hasAccessToPreview: false },
          target: 'onyx-2.5-flash',
        },
      ],
    },
    'flash-lite': {
      default: 'onyx-2.5-flash-lite',
      contexts: [
        {
          condition: { useOnyx3_1FlashLite: true },
          target: 'onyx-3.1-flash-lite-preview',
        },
      ],
    },
    'auto-onyx-3': {
      default: 'onyx-3-pro-preview',
      contexts: [
        { condition: { hasAccessToPreview: false }, target: 'onyx-2.5-pro' },
        {
          condition: { useOnyx3_1: true, useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
        {
          condition: { useOnyx3_1: true },
          target: 'onyx-3.1-pro-preview',
        },
      ],
    },
    'auto-onyx-2.5': {
      default: 'onyx-2.5-pro',
    },
  },
  classifierIdResolutions: {
    flash: {
      default: 'onyx-3-flash-preview',
      contexts: [
        {
          condition: { hasAccessToPreview: false },
          target: 'onyx-2.5-flash',
        },
        {
          condition: { requestedModels: ['onyx-2.5-pro', 'auto-onyx-2.5'] },
          target: 'onyx-2.5-flash',
        },
      ],
    },
    pro: {
      default: 'onyx-3-pro-preview',
      contexts: [
        {
          condition: { hasAccessToPreview: false },
          target: 'onyx-2.5-pro',
        },
        {
          condition: { requestedModels: ['onyx-2.5-pro', 'auto-onyx-2.5'] },
          target: 'onyx-2.5-pro',
        },
        {
          condition: { useOnyx3_1: true, useCustomTools: true },
          target: 'onyx-3.1-pro-preview-customtools',
        },
        {
          condition: { useOnyx3_1: true },
          target: 'onyx-3.1-pro-preview',
        },
      ],
    },
  },
  modelChains: {
    preview: [
      {
        model: 'onyx-3-pro-preview',
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-3-flash-preview',
        isLastResort: true,
        maxAttempts: 10,
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
    ],
    'auto-preview': [
      {
        model: 'onyx-3-pro-preview',
        maxAttempts: 3,
        actions: {
          terminal: 'prompt',
          transient: 'silent',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'sticky_retry',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-3-flash-preview',
        isLastResort: true,
        maxAttempts: 10,
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
    ],
    default: [
      {
        model: 'onyx-2.5-pro',
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'sticky_retry',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-2.5-flash',
        isLastResort: true,
        maxAttempts: 10,
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
    ],
    'auto-default': [
      {
        model: 'onyx-2.5-pro',
        maxAttempts: 3,
        actions: {
          terminal: 'prompt',
          transient: 'silent',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'sticky_retry',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-2.5-flash',
        isLastResort: true,
        maxAttempts: 10,
        actions: {
          terminal: 'prompt',
          transient: 'prompt',
          not_found: 'prompt',
          unknown: 'prompt',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
    ],
    lite: [
      {
        model: 'onyx-2.5-flash-lite',
        actions: {
          terminal: 'silent',
          transient: 'silent',
          not_found: 'silent',
          unknown: 'silent',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-2.5-flash',
        actions: {
          terminal: 'silent',
          transient: 'silent',
          not_found: 'silent',
          unknown: 'silent',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
      {
        model: 'onyx-2.5-pro',
        isLastResort: true,
        actions: {
          terminal: 'silent',
          transient: 'silent',
          not_found: 'silent',
          unknown: 'silent',
        },
        stateTransitions: {
          terminal: 'terminal',
          transient: 'terminal',
          not_found: 'terminal',
          unknown: 'terminal',
        },
      },
    ],
  },
};
