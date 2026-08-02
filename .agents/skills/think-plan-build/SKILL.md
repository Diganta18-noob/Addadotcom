---
name: think-plan-build
description: Enforces a structured 3-stage execution flow (Think -> Plan -> Build) for complex software engineering tasks. Use this skill whenever starting complex feature additions, architectural refactoring, or multi-step tasks.
---

# Think.Plan.Build Workflow

Follow this structured 3-stage methodology when addressing complex engineering tasks:

## Stage 1: Think (Deep Research & Context Gathering)
- Inspect existing codebase files, schemas, and dependencies before writing code.
- Analyze system impacts, edge cases, breaking changes, and performance implications.
- Identify authoritative sources rather than assuming implementation details.
- Do NOT modify codebase files during this stage.

## Stage 2: Plan (Structured Implementation Specification)
- Formulate a clean, step-by-step implementation plan covering:
  - Architecture and component modifications
  - Data model and schema additions
  - API endpoint specifications
  - Automated and manual verification strategy
- Document open questions, breaking changes, or user feedback requirements.
- Obtain alignment before proceeding to code execution.

## Stage 3: Build (Incremental Execution & Empirical Verification)
- Execute changes step-by-step in logical component blocks.
- Run build commands, lint checks, and test suites after edits to verify correctness empirically.
- Document completed changes and verification results in a walkthrough report upon task completion.
