# Karpathy Guidelines

**Behavioral guidelines to reduce common LLM coding mistakes.** Derived from Andrej Karpathy's observations on LLM coding pitfalls, these guidelines prioritize caution over speed for non-trivial tasks.

## Core Principles

**1. Think Before Coding**
Surface assumptions and confusion rather than proceeding with hidden uncertainties. Present multiple interpretations when they exist, and advocate for simpler approaches when applicable.

**2. Simplicity First**
Write minimal code solving only the stated problem. Avoid speculative features, unnecessary abstractions, or unasked flexibility. The standard: "Would a senior engineer call this overcomplicated?"

**3. Surgical Changes**
When editing existing code, "Touch only what you must. Clean up only your own mess." Preserve existing style and only remove code YOUR changes made unused—don't eliminate pre-existing dead code.

**4. Goal-Driven Execution**
Transform requests into verifiable success criteria with explicit verification steps. This enables independent looping and reduces clarification needs throughout implementation.

---

**License:** MIT
