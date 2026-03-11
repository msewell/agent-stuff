# Heuristics and Refactoring

## Table of Contents

- [Design Heuristics](#design-heuristics)
  - [1. Measure Interface Cost Honestly](#1-measure-interface-cost-honestly)
  - [2. Pull Complexity Downward](#2-pull-complexity-downward)
  - [3. Design the Common Case First](#3-design-the-common-case-first)
  - [4. Aim for Somewhat General-Purpose Interfaces](#4-aim-for-somewhat-general-purpose-interfaces)
  - [5. Combine Modules That Share Information](#5-combine-modules-that-share-information)
  - [6. Separate Modules Only When Interfaces Are Distinct](#6-separate-modules-only-when-interfaces-are-distinct)
  - [7. Define Errors Out of Existence](#7-define-errors-out-of-existence)
  - [8. Avoid Decorators and Wrappers Unless They Add Real Logic](#8-avoid-decorators-and-wrappers-unless-they-add-real-logic)
- [Refactoring Shallow Modules Into Deep Ones](#refactoring-shallow-modules-into-deep-ones)
  - [Step 1: Identify Shallow Module Clusters](#step-1-identify-shallow-module-clusters)
  - [Step 2: Map the Actual Responsibilities](#step-2-map-the-actual-responsibilities)
  - [Step 3: Merge Toward a Single, Deeper Module](#step-3-merge-toward-a-single-deeper-module)
  - [Step 4: Internalize Pass-Through Logic](#step-4-internalize-pass-through-logic)
  - [Step 5: Collapse Exception Hierarchies](#step-5-collapse-exception-hierarchies)
  - [Step 6: Simplify the Interface for the Common Case](#step-6-simplify-the-interface-for-the-common-case)
  - [Step 7: Verify the Module Hides a Real Decision](#step-7-verify-the-module-hides-a-real-decision)

---

## Design Heuristics

### 1. Measure Interface Cost Honestly

The interface of a module is not just its method signatures. It includes:

- Parameters and return types
- Exceptions and error codes the caller must handle
- Preconditions the caller must establish
- Ordering constraints ("call init before use")
- Side effects the caller must know about
- Configuration the caller must provide
- Types the caller must import to interact with the module

When evaluating depth, account for *all* of this, not just the method count.

### 2. Pull Complexity Downward

When faced with a design decision about where to put complexity, default to pushing it into the module's implementation rather than its interface. It is more important for a module to have a simple interface than a simple implementation.

If a decision can be made internally with reasonable defaults, make it internally. Do not add a parameter "for flexibility." Flexibility that no one uses is interface cost with zero benefit.

### 3. Design the Common Case First

Ask: "What does the caller want 90% of the time?" Design the interface for that case. Make it trivially easy — zero unnecessary parameters, zero configuration, zero ceremony. Then, and only then, consider how to support the remaining 10% without complicating the common path.

### 4. Aim for Somewhat General-Purpose Interfaces

A general-purpose interface is typically deeper than a special-purpose one. If you can reduce the number of methods in an interface without reducing its total capability, you are making the module deeper.

This does not mean adding speculative features. It means expressing the interface in terms of general concepts rather than specific use cases.

```
// Shallow: special-purpose
insertTextAfterCursor(text)
deleteTextBeforeCursor(count)
deleteSelection()

// Deep: general-purpose (covers all the above and more)
modifyText(range, replacement)
```

### 5. Combine Modules That Share Information

If two modules depend on the same knowledge — the same data format, the same business rule, the same protocol — they should probably be one module. Separate modules that share knowledge create information leakage: a change to that knowledge requires changing both modules. Merging them hides the shared knowledge behind a single interface.

### 6. Separate Modules Only When Interfaces Are Distinct

The reason to separate code into distinct modules is that the resulting interfaces are simpler than the combined alternative. If separating produces two modules with similar interfaces, or two modules that consumers must always use together, the separation is not earning its cost.

### 7. Define Errors Out of Existence

Before adding an exception or error return, ask: can the module handle this case itself? Can the operation be defined so the "error" condition is simply part of normal behavior?

- `delete(file)` succeeds if the file is already gone.
- `ensureDirectoryExists(path)` succeeds if the directory is already there.
- `getOrDefault(key, default)` never throws "not found."

Every error you eliminate from the interface is a reduction in cost.

### 8. Avoid Decorators and Wrappers Unless They Add Real Logic

A class whose primary purpose is to wrap another class and add a small behavioral tweak is almost always shallow. The interface cost of the wrapper (learning it exists, knowing when to use it, understanding the delegation) rarely justifies the tiny functionality it adds.

If you need to add behavior, prefer modifying the original module or using a configuration option within it.

---

## Refactoring Shallow Modules Into Deep Ones

### Step 1: Identify Shallow Module Clusters

Look for these symptoms:

- **Long call chains:** A request passes through 4+ layers before real work happens.
- **Mirror interfaces:** Two or more classes with nearly identical method signatures.
- **Forced co-changes:** Modifying a feature requires touching 5+ files across 3+ modules.
- **Thin wrappers:** Classes or functions whose implementations are a single delegation.
- **Ceremony-heavy common operations:** Simple tasks (read a file, send a message, create a record) require multiple object instantiations or method calls.

### Step 2: Map the Actual Responsibilities

For each cluster of shallow modules, ask: what design decisions are being made, and where? Often the real decisions are scattered — validation in one layer, transformation in another, persistence in a third, with pass-through layers in between adding no decisions of their own.

List the actual decisions (not the classes). This is the set of things the deep module will hide.

### Step 3: Merge Toward a Single, Deeper Module

Combine the shallow modules into fewer, deeper ones. The goal is not one giant class — it is fewer classes, each of which owns a meaningful, complete responsibility.

```
// Before: 4 shallow classes
OrderValidator      ->  validates fields
OrderMapper         ->  maps DTO to entity
OrderRepository     ->  wraps a single DB call
OrderService        ->  calls the above three in sequence

// After: 1 deep class
OrderService
    placeOrder(orderRequest) -> orderId
    // internally: validates, maps, persists, emits events
    // interface: one method, one input, one output
```

The four "responsibilities" of the shallow design were never independent — they were steps in a single operation that shared the same data and always changed together. Combining them hides this internal structure and presents a single, clear interface.

### Step 4: Internalize Pass-Through Logic

For every pass-through method, either:

- **Absorb it** into the module that actually does the work, or
- **Eliminate it** if the caller can invoke the real module directly.

No module should exist solely to forward calls.

### Step 5: Collapse Exception Hierarchies

If the refactored module inherits a stack of specific exceptions from its former submodules, collapse them. Most callers do not distinguish between `InvalidOrderFieldException` and `OrderMappingException` — they care that the order could not be placed. Provide a single, clear error type, or better, define the error out of existence by handling it internally.

### Step 6: Simplify the Interface for the Common Case

After merging, review the resulting interface. Ask:

- Can any parameters be defaulted?
- Can any configuration be computed internally?
- Can any error cases be handled without involving the caller?
- Is the common-case invocation a single call with minimal arguments?

Strip the interface to the minimum that covers the 90% case. Provide escape hatches only where genuinely needed.

### Step 7: Verify the Module Hides a Real Decision

After refactoring, the deep module should clearly hide at least one significant design decision: a storage format, a protocol, a business rule, an algorithm, a data structure. If you cannot articulate what the module hides, it may still be too shallow.
