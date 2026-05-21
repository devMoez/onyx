# @google/onyx-cli-sdk

The Onyx CLI SDK provides a programmatic interface to interact with Onyx
models and tools.

## Installation

```bash
npm install @google/onyx-cli-sdk
```

## Usage

```typescript
import { OnyxCliAgent } from '@google/onyx-cli-sdk';

async function main() {
  const agent = new OnyxCliAgent({
    instructions: 'You are a helpful assistant.',
  });

  const controller = new AbortController();
  const signal = controller.signal;

  // Stream responses from the agent
  const stream = agent.sendStream('Why is the sky blue?', signal);

  for await (const chunk of stream) {
    if (chunk.type === 'content') {
      process.stdout.write(chunk.value.text || '');
    }
  }
}

main().catch(console.error);
```
