import { mouse } from '@nut-tree-fork/nut-js';

async function testVisualBridge() {
  console.log('Onyx: Initializing Visual Control Bridge Test...');
  
  // Minimal example: Move mouse to a relative position
  // This simulates the "Human-like" control layer
  await mouse.move([{ x: 100, y: 100 }]);
  
  console.log('Onyx: Visual Control Bridge Test Successful.');
}

testVisualBridge().catch(console.error);

