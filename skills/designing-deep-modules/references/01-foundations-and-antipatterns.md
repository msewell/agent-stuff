# Foundations, Examples, and Antipatterns

## Table of Contents

- [The Core Thesis](#the-core-thesis)
- [The Cost/Benefit Model](#the-costbenefit-model)
- [Characteristics of Deep Modules](#characteristics-of-deep-modules)
- [Canonical Examples](#canonical-examples)
  - [Unix File I/O — The Gold Standard](#unix-file-io--the-gold-standard)
  - [Garbage Collectors](#garbage-collectors)
  - [Go's io.Reader](#gos-ioreader)
  - [Go's http.Handler](#gos-httphandler)
- [The Shallow Module Antipattern](#the-shallow-module-antipattern)
  - [Classitis](#classitis)
  - [The Java File API — A Cautionary Tale](#the-java-file-api--a-cautionary-tale)
  - [Pass-Through Methods](#pass-through-methods)
  - [Configuration Parameters — Complexity Pushed Upward](#configuration-parameters--complexity-pushed-upward)
  - [Excessive Exceptions](#excessive-exceptions)
- [Deep Modules at Every Scale](#deep-modules-at-every-scale)
  - [Functions](#functions)
  - [Classes](#classes)
  - [Packages and Libraries](#packages-and-libraries)
  - [Services and Microservices](#services-and-microservices)
  - [APIs (Public and Internal)](#apis-public-and-internal)

---

## The Core Thesis

Complexity is the central problem of software engineering. Every design decision either adds to or subtracts from the total complexity a team must manage. The single most powerful lever is **module depth**: the ratio of functionality a module provides to the interface it exposes.

A **deep module** hides substantial complexity behind a small, simple interface. A **shallow module** exposes an interface nearly as complex as its implementation. Deep modules are the primary tool for managing complexity at scale. Shallow modules are, in most cases, a design failure — they impose cost without proportionate benefit.

"Module" is used in the broadest sense: a function, a class, a package, a service, an API — anything with a boundary between interface and implementation.

---

## The Cost/Benefit Model

Every module has two facets:

- **Cost**: the interface. Every parameter, method, endpoint, configuration option, exception, and type that a consumer must learn and handle.
- **Benefit**: the functionality hidden behind that interface. The work the module does that consumers no longer need to think about.

A module justifies its existence only when benefit substantially exceeds cost. The deeper the module — the more functionality per unit of interface — the more complexity it absorbs from the rest of the system.

```
  ┌──────────────────────────────┐
  │          Interface           │  <- narrow = low cost
  ├──────────────────────────────┤
  │                              │
  │                              │
  │                              │
  │       Implementation         │  <- tall = high benefit
  │                              │
  │                              │
  │                              │
  └──────────────────────────────┘
         DEEP MODULE

  ┌──────────────────────────────────────────────────┐
  │                  Interface                       │  <- wide = high cost
  ├──────────────────────────────────────────────────┤
  │              Implementation                      │  <- short = low benefit
  └──────────────────────────────────────────────────┘
         SHALLOW MODULE
```

The visual is deliberately simple: tall, narrow rectangles are deep. Short, wide ones are shallow.

---

## Characteristics of Deep Modules

Deep modules share a recognizable set of traits:

1. **Few public methods/endpoints relative to internal complexity.** The consumer sees 5 operations; the implementation handles 50 concerns.

2. **Stable interfaces that survive implementation rewrites.** Unix file I/O has the same five calls (open, read, write, seek, close) it had decades ago, despite radical changes to file system internals.

3. **Common cases require no ceremony.** Opening a file, making an HTTP request, allocating memory — the default path is trivial. Advanced options exist but don't clutter the common path.

4. **Errors are handled internally, not thrown upward.** The module defines errors out of existence wherever possible, rather than burdening the caller with edge cases.

5. **Implementation details do not leak.** The interface is expressed in terms of what the module *does*, not how it does it. Internal data structures, threading models, and storage formats remain invisible.

---

## Canonical Examples

### Unix File I/O — The Gold Standard

Five system calls — `open`, `read`, `write`, `lseek`, `close` — provide a uniform interface to an enormous range of functionality: disk files, pipes, sockets, devices, network file systems. The implementation encompasses buffer management, caching, journaling, permissions, locking, and concurrent access. None of this leaks into the interface.

This interface has remained stable for over 50 years while implementations evolved from simple flat file systems to copy-on-write, log-structured, and distributed file systems. The hallmark of a deep module: the interface outlives every implementation behind it.

### Garbage Collectors

A garbage collector is perhaps the deepest module most programmers interact with daily. The interface is effectively zero — you allocate, and the collector handles the rest. Behind that non-interface lies reference counting, tracing, generational collection, compaction, concurrent marking, and write barriers. Programmers benefit from all of this complexity without ever seeing it.

### Go's `io.Reader`

A single method:

```
read(buffer) -> (bytesRead, error)
```

This interface composes into `ReadWriter`, `ReadCloser`, and dozens of other abstractions. Entire I/O subsystems — compression, encryption, buffering, network protocols — implement this one method. The depth is in how much functionality that single method can represent.

### Go's `http.Handler`

```
serveHTTP(responseWriter, request)
```

One method. Behind it: routing, middleware chains, authentication, rate limiting, request parsing, response serialization, logging. The interface remains stable regardless of the complexity behind it.

---

## The Shallow Module Antipattern

### Classitis

The conventional wisdom — "classes should be small," "methods should do one thing," "no method longer than N lines" — has been taken to an extreme that actively damages software systems. Ousterhout calls this **classitis**: the proliferation of small, shallow classes that individually do almost nothing, collectively create enormous system complexity, and force developers to navigate dozens of indirections to understand a single operation.

When followed dogmatically, this advice produces systems where:

- A simple operation requires instantiating and coordinating 5-10 objects.
- Every class is a thin wrapper that delegates to another thin wrapper.
- The interface surface area of the system is enormous relative to its actual functionality.
- Reading the code requires constant jumping between files to reconstruct what is actually happening.
- Information leaks across class boundaries because no single class owns enough context to encapsulate a decision.

This is not modularity. It is the *opposite* of modularity — complexity distributed across many shallow containers, each too thin to hide anything meaningful.

### The Java File API — A Cautionary Tale

To read serialized objects from a file in classic Java:

```
stream1 = new FileInputStream("data.bin")
stream2 = new BufferedInputStream(stream1)
stream3 = new ObjectInputStream(stream2)
```

Three objects, three interfaces to learn, three potential failure points — to accomplish something that should be a single call. The "flexibility" of choosing your own buffering strategy is an interface cost imposed on every user, regardless of whether they need it. The common case — "read this file" — should require zero ceremony.

### Pass-Through Methods

A method that does little except forward a call to another method with a similar signature is a shallow module by definition. It adds interface cost (the caller must know the method exists and what to pass) without adding functionality. Pass-through methods are a symptom of confused responsibility boundaries — the system has too many layers, and no individual layer does enough to justify its existence.

```
// Shallow: pass-through that adds nothing
function getEmployee(id):
    return employeeRepository.getEmployee(id)
```

If a method's implementation is essentially the same as its declaration, it should not exist as a separate abstraction.

### Configuration Parameters — Complexity Pushed Upward

Exposing a configuration parameter is the opposite of a deep module. It takes a decision that the module *could* make internally and pushes it to the caller. Every configuration parameter is interface cost.

A network module that exposes `retryInterval`, `maxRetries`, `backoffMultiplier`, and `timeoutMs` as required configuration is a shallow module. A deep module computes reasonable values from observed network conditions and handles retries internally, exposing at most a single `timeout` parameter for the rare case where the caller has domain-specific knowledge.

The heuristic: **if you can compute it, don't configure it.**

### Excessive Exceptions

Every exception a module throws is part of its interface. A module that throws 15 different exception types for various internal failure modes is pushing its complexity onto every caller, who must now handle (or propagate) all of them.

Deep modules define errors out of existence. A `delete(file)` operation that silently succeeds when the file does not exist is deeper than one that throws `FileNotFoundException` — in most cases, the caller's intent is "ensure this file does not exist," and the module can satisfy that intent directly.

---

## Deep Modules at Every Scale

The principle is fractal — it applies at every level of system architecture.

### Functions

A function that takes 1-3 parameters and handles a meaningful chunk of logic is deep. A function that takes the same parameters as the function it calls and adds a single `if` check is shallow.

Prefer fewer, more capable functions over many tiny functions that each do one trivial thing. A 40-line function that handles a complete operation is clearer than 8 five-line functions that must be read together to understand the same operation.

The question is not "is this function short?" but "does this function earn its interface cost?"

### Classes

A class should own a meaningful design decision and hide it completely. If the decision is "how we store and retrieve user sessions," the class should handle serialization, caching, expiration, and storage — not expose a different method for each of these concerns.

If a class has more public methods than meaningful operations it performs, it is too shallow. If understanding the class requires also understanding its three helper classes, the abstraction boundary is drawn in the wrong place.

### Packages and Libraries

A package that exposes 3 public functions and hides 30 internal ones is deep. A package that exposes 25 public functions, each trivially thin, forces every consumer to learn a large API surface and assemble operations manually.

When designing a package API, optimize for the caller who wants the common behavior. Provide a single `doTheThing(input)` function for the 90% case and separate lower-level primitives only for the 10% who genuinely need control.

### Services and Microservices

A microservice is a module. Its API is its interface. Its internal logic is its implementation.

A microservice with 3 endpoints that handles complex domain logic — validation, state transitions, persistence, event emission — is deep. A microservice with 15 CRUD endpoints that is essentially a database table with HTTP in front of it is shallow. It has not hidden any complexity; it has merely moved it across a network boundary and added latency, serialization cost, and a new failure mode.

The worst case is a shallow microservice that also tightly couples to other services: a distributed shallow module — all the costs of a network boundary with none of the benefits of encapsulation.

**Heuristic for service boundaries:** if two services always change together, they should be one service. If a service is essentially a pass-through to a database or another service, it should not exist independently.

### APIs (Public and Internal)

The same cost/benefit analysis applies to any API:

- **REST/GraphQL APIs:** Fewer, more powerful endpoints beat many fine-grained ones. An endpoint that accepts a high-level intent ("place this order") and handles the 12 internal steps is deeper than 12 endpoints the client must orchestrate.
- **SDK/library APIs:** The best SDKs have a tiny surface area for common operations. `client.send(message)` is deep. Requiring the user to construct a `Request`, wrap it in a `SignedRequest`, pass it to a `Transport`, and read from a `ResponseStream` is shallow.
