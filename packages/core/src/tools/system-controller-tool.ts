/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  Kind,
  type ToolResult,
  type ToolInvocation,
  type ExecuteOptions,
} from './tools.js';
import {
  SYSTEM_CONTROLLER_TOOL_NAME,
  executeSystemControl,
  type SystemControllerArgs,
} from './system-controller.js';
import type { MessageBus } from '../confirmation-bus/message-bus.js';
import { getSystemControllerDeclaration } from './definitions/dynamic-declaration-helpers.js';

class SystemControllerInvocation extends BaseToolInvocation<
  SystemControllerArgs,
  ToolResult
> {
  constructor(
    override readonly params: SystemControllerArgs,
    messageBus: MessageBus,
  ) {
    super(params, messageBus, SYSTEM_CONTROLLER_TOOL_NAME);
  }

  getDescription(): string {
    return `System Control: ${this.params.action}`;
  }

  async execute(_options: ExecuteOptions): Promise<ToolResult> {
    const result = await executeSystemControl(this.params);
    return {
      llmContent: result,
      returnDisplay: result,
    };
  }
}

export class SystemControllerTool extends BaseDeclarativeTool<
  SystemControllerArgs,
  ToolResult
> {
  constructor(messageBus: MessageBus) {
    super(
      SYSTEM_CONTROLLER_TOOL_NAME,
      'System Controller',
      getSystemControllerDeclaration().description!,
      Kind.Execute,
      getSystemControllerDeclaration().parametersJsonSchema!,
      messageBus,
      false, // isOutputMarkdown
      false, // canUpdateOutput
    );
  }

  protected createInvocation(
    params: SystemControllerArgs,
    messageBus: MessageBus,
  ): ToolInvocation<SystemControllerArgs, ToolResult> {
    return new SystemControllerInvocation(params, messageBus);
  }
}
