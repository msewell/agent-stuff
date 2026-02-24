# Core Principle

**"Making invalid states unrepresentable"** (also known as "making illegal states unrepresentable" or "making impossible states impossible") is a design principle that leverages static type systems to prevent bugs at compile time rather than runtime.

> "Making illegal states unrepresentable is about statically proving that all runtime values (without exception) correspond to valid objects in the business domain."

Instead of:
- Writing code that can represent invalid states
- Adding runtime validation to detect those states
- Handling errors when invalid states occur

Do this:
- Design types so invalid states cannot be constructed
- Let the compiler enforce correctness
- Eliminate entire classes of runtime errors

The principle was popularized by [Yaron Minsky](https://blog.janestreet.com/effective-ml-revisited/) in the OCaml community and has since spread across functional and statically-typed programming communities.

## Key Benefits

- **Fewer runtime errors**: Invalid states become compile-time errors
- **Self-documenting code**: Types express business rules directly
- **Safer refactoring**: Type changes surface violations automatically
- **Reduced testing burden**: No need to test for impossible states
- **Faster onboarding**: New developers understand constraints from types
- **Better IDE support**: Autocompletion and error highlighting reflect domain rules

---

# The "Parse, Don't Validate" Pattern

Coined by [Alexis King](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) (2019), this pattern is the foundational strategy for applying the principle in practice. It distinguishes between validation (which discards information) and parsing (which preserves it).

## The Problem with Validation

```haskell
-- Validation: checks but returns nothing useful
validateNonEmpty :: [a] -> IO ()
validateNonEmpty (_:_) = pure ()
validateNonEmpty [] = throwIO $ userError "list cannot be empty"

-- Parsing: checks AND returns a refined type
parseNonEmpty :: [a] -> IO (NonEmpty a)
parseNonEmpty (x:xs) = pure (x :| xs)
parseNonEmpty [] = throwIO $ userError "list cannot be empty"
```

Validation is a "point-in-time" check. After it returns, the system cannot assume the data remains valid. This leads to **shotgun parsing** — validation scattered throughout the codebase.

**Key insight:** A value of type `NonEmpty a` is like a value of type `[a]` plus a proof that the list is non-empty.

## The Solution: Parse at Boundaries

1. **Parse incoming data** at system boundaries into refined types
2. **Use precise types** throughout the application
3. **Trust the types** internally — no redundant checks needed

```typescript
// Instead of this:
function processUser(email: string) {
  if (!isValidEmail(email)) throw new Error("Invalid email");
  // ... use email
}

// Do this:
function processUser(email: EmailAddress) {
  // EmailAddress guarantees validity at construction
  // ... use email safely
}
```

## Design Guidance

> "Write functions on the data representation you wish you had, not the data representation you are given."

Work from both ends: define ideal types, then bridge the gap with parsing at boundaries.

**Stratification:**
- **Phase 1 (Parsing):** All validation; can fail due to invalid input
- **Phase 2 (Execution):** Minimal failure modes; operates on validated data
