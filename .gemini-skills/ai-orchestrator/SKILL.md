---
name: ai-orchestrator
description: Expert implementation of AI workflows using LangGraph and CrewAI. Use when building multi-agent systems, stateful graphs, or complex tool-use scenarios.
---

# AI Orchestrator (LangGraph & CrewAI)

## LangGraph Workflow
- **Stateful Graphs**: Define a clear `State` TypedDict. 
- **Nodes**: Each node should be a single, testable function that returns state updates.
- **Edges**: Use conditional edges for routing based on LLM output or tool results.
- **Persistence**: Use `MemorySaver` for thread-level state persistence.

## CrewAI Orchestration
- **Role-Based Agents**: Give agents distinct personas and goals.
- **Tasks**: Define granular tasks with clear expected outputs.
- **Process Types**: Use `Process.sequential` for linear workflows and `Process.hierarchical` for manager-led structures.

## Best Practices
- **Tool Use**: Wrap all external interactions (searches, file edits) in LangChain tools.
- **Error Handling**: Implement retry logic for LLM calls and tool failures within the graph nodes.
