# Advanced Techniques

## Indexed Types / GADTs

Different constructors can return different type indices:

```haskell
-- Length-indexed vectors
data Vec (n :: Nat) a where
  VNil  :: Vec 0 a
  VCons :: a -> Vec n a -> Vec (n + 1) a

-- head is now total!
vhead :: Vec (n + 1) a -> a
vhead (VCons x _) = x
```

## Type-Level Computation

Compute types based on other types:

```haskell
type family Append (xs :: [k]) (ys :: [k]) :: [k] where
  Append '[] ys = ys
  Append (x ': xs) ys = x ': Append xs ys
```

## Singleton Types

Bridge term-level and type-level programming:

```haskell
data Nat = Zero | Succ Nat

data SNat (n :: Nat) where
  SZero :: SNat Zero
  SSucc :: SNat n -> SNat (Succ n)
```

## Proof-Carrying Code

Carry proofs of properties alongside data:

```haskell
data Sorted a where
  SortedNil :: Sorted a
  SortedOne :: a -> Sorted a
  SortedCons :: (Ord a) => a -> a -> Sorted a -> Sorted a
```

## Session Types

Encode communication protocols in types, preventing deadlocks and protocol violations:

```haskell
-- Protocol: send Int, receive String, close
type Protocol = Send Int (Recv String End)

send :: a -> Session (Send a s) s
recv :: Session (Recv a s) (a, s)
close :: Session End ()
```

## GADTs for Type-Safe Evaluation

```haskell
data Expr a where
  LitInt  :: Int -> Expr Int
  LitBool :: Bool -> Expr Bool
  Add     :: Expr Int -> Expr Int -> Expr Int
  If      :: Expr Bool -> Expr a -> Expr a -> Expr a

-- Type-safe evaluation
eval :: Expr a -> a
eval (LitInt n) = n
eval (LitBool b) = b
eval (Add e1 e2) = eval e1 + eval e2
eval (If cond t f) = if eval cond then eval t else eval f
```

---

# Modern Applications

## Data Pipelines and Lakehouses (2026)

Research on **Bauplan** demonstrates applying these principles to distributed data systems.

**Problem:** Traditional data lakehouses allow schema mismatches between pipeline stages, partial failures leaving inconsistent state, and difficult-to-reproduce bugs.

**Solution:** Type-driven design for data:

```python
# Explicit schema contracts
class ParentSchema(BauplanSchema):
    col1: str
    col2: datetime
    _sum: int

class ChildSchema(BauplanSchema):
    col2: datetime  # inherited type
    col4: float     # fresh type
    col5: Optional[str]  # explicitly nullable

def child_table(df: ParentSchema) -> ChildSchema:
    # Type system enforces schema compatibility
    return transform(df)
```

**Key innovations:**
- **Typed contracts:** Schema mismatches caught at compile/plan time
- **Git-for-data:** Branches and commits for reproducibility
- **Transactional pipelines:** All-or-nothing semantics for multi-table updates — partial failures don't corrupt the main branch, failed runs remain accessible for debugging, downstream consumers never see inconsistent state

## API Design and Protocol Verification

**Session types** encode communication protocols in types: valid message sequences enforced by compiler, protocol violations become type errors, prevents deadlocks and race conditions.

## Financial Systems

Phantom types for currency safety prevent accidental cross-currency arithmetic at compile time.

## Security and Authorization

Capabilities encoded in types ensure only authenticated/authorized users can access sensitive operations.

---

# Industry Adoption and Trends (2024–2026)

## Growing Adoption

**Companies using these techniques:**
- **Jane Street:** OCaml for trading systems
- **Facebook/Meta:** Flow and Hack for type safety
- **Microsoft:** TypeScript across products
- **Dropbox:** Migrated Python to typed Python
- **Stripe:** TypeScript for API clients
- **Bauplan Labs:** Type-driven data pipelines

## Emerging Patterns

1. **AI-Assisted Development:** Types help LLMs generate correct code and serve as specifications for verification
2. **Gradual Typing:** Adding types to dynamic languages (Python, JavaScript)
3. **Effect Systems:** Tracking side effects in types
4. **Capability-Based Security:** Types as unforgeable tokens
5. **Formal Verification:** Lightweight formal methods (Alloy, TLA+)

## Why It Matters More Now

- **Agentic coding:** AI assistants generating code require stronger type-level guarantees
- **Verification over writing:** Industry shift from writing code to reviewing/verifying changes (OpenAI, 2025)
- **Distributed systems:** Lakehouses and data pipelines need transactional correctness (Bauplan research, 2026)
- **Security:** Type-level guarantees prevent entire classes of vulnerabilities

## Language Evolution (Recent)

- **TypeScript 5.x:** Better type inference, const type parameters
- **Rust 2024:** Improved const generics
- **Python 3.12+:** Better typing support, type parameter syntax
- **Java 21:** Pattern matching, sealed classes
- **C# 12:** Primary constructors, collection expressions

---

# Historical Context

- **Yaron Minsky** (Jane Street Capital) popularized the phrase in the OCaml/F# community
- **2013:** Scott Wlaschin's influential blog post "Designing with types: Making illegal states unrepresentable" in F#
- **2016:** Richard Feldman's Elm Conf talk "Making Impossible States Impossible"
- **2019:** Alexis King's "Parse, Don't Validate" refined the concept for practical application
- **2020:** Chris Krycho demonstrated the approach in TypeScript
- **2024–2026:** Renewed interest with AI/agent-driven development requiring stronger correctness guarantees

---

# Tradeoffs, Limitations, and Criticism

## When to Apply

**✅ Good candidates:**
- Core business logic
- Security-critical code
- Public APIs
- Data validation at system boundaries
- State machines with clear transitions

**⚠️ Use judgment:**
- Prototype/exploratory code
- Performance-critical hot paths (measure first!)
- Simple CRUD operations
- Code with frequently changing requirements

## Costs and Benefits

**Benefits:**
- ✅ Bugs caught at compile time
- ✅ Refactoring is safer
- ✅ Self-documenting code
- ✅ Reduced test burden
- ✅ Better IDE support
- ✅ Easier to reason about code

**Costs:**
- ❌ Steeper learning curve
- ❌ More upfront design time
- ❌ Potential for over-engineering
- ❌ May require advanced type system features
- ❌ Can make prototyping slower
- ❌ Possible runtime overhead (language-dependent)

## When This Approach Can Be Challenging

1. **Schema Evolution**: In distributed systems, strict types can make migrations difficult. Applications may need to tolerate incomplete data during transitions.
2. **Requirements Change**: Overly constrained types may require significant refactoring when business rules evolve.
3. **Learning Curve**: Teams unfamiliar with these patterns need time to adopt them effectively.
4. **Boilerplate**: Creating wrapper types adds code. Consider whether the safety benefits justify the overhead.
5. **Serialization Boundaries**: JSON/database representations may not map cleanly to refined types.

## Criticism: "Considered Harmful?"

Some argue the principle can be taken too far (2025):
- Over-engineering simple problems
- Reduced flexibility for rapid iteration
- Steep learning curve for teams
- Not all invariants are worth encoding

**Response:** Use pragmatically — apply where bugs are costly, balance with team expertise, start simple, refactor when needed, and document invariants you can't encode.

## Common Pitfalls

1. **Over-engineering:** Not every boolean needs a sum type
2. **Fighting the type system:** If it's too hard, reconsider the design
3. **Ignoring ergonomics:** Types should help, not hinder
4. **Premature abstraction:** Start simple, refactor when patterns emerge
5. **Denormalized data:** Duplicating data creates sync problems

## Best Practices

1. **Start at boundaries:** Parse external data immediately
2. **Use precise types:** Prefer `NonEmpty a` over `[a]` when appropriate
3. **Avoid boolean blindness:** Use sum types instead of booleans
4. **Make illegal states unrepresentable:** Not just hard to create
5. **Encapsulate invariants:** Use abstract types with smart constructors
6. **Document with types:** Let types tell the story
7. **Iterate:** Refactor as you learn more about the domain

---

# Resources and Further Reading

## Foundational Articles

- [Designing with types: Making illegal states unrepresentable](https://fsharpforfunandprofit.com/posts/designing-with-types-making-illegal-states-unrepresentable/) — Scott Wlaschin (2013, F#)
- [Parse, don't validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) — Alexis King (2019)
- [Making Impossible States Impossible](https://www.youtube.com/watch?v=IcgmSRJHu_8) — Richard Feldman (2016, Elm Conf)
- [Making Illegal States Unrepresentable in TypeScript](https://v5.chriskrycho.com/journal/making-illegal-states-unrepresentable-in-ts/) — Chris Krycho (2020)
- [Type Safety Back and Forth](https://www.parsonsmatt.org/) — Matt Parsons (2017)
- [Make Illegal States Unrepresentable](https://corrode.dev/blog/illegal-state/) — corrode Rust Consulting

## Language-Specific Guides

- [Make Illegal States Unrepresentable! — DDD with TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/make-illegal-states-unrepresentable/) — Khalil Stemmler
- [The Typestate Pattern in Rust](https://cliffle.com/blog/rust-typestate/) — Cliffle
- [Typestate: Type-Driven API Design in Rust](https://willcrichton.net/rust-api-type-patterns/typestate.html) — Will Crichton
- [Make Illegal States Unrepresentable — Data-Oriented Programming](https://inside.java/2024/06/03/dop-v1-1-illegal-states/) — Inside.java
- [Making invalid states unrepresentable (Swift)](https://swiftology.io/articles/making-illegal-states-unrepresentable/) — Swiftology
- [From Primitive Obsession to Domain Modelling](https://blog.ploeh.dk/2015/01/19/from-primitive-obsession-to-domain-modelling/) — Mark Seemann

## Books

- **"Domain Modeling Made Functional"** — Scott Wlaschin (2018)
- **"Practical Type-Level Design"** — Pragmatic Bookshelf (2024)
- **"Programming with Types"** — Vlad Riscutia (2019)

## Recent Research (2024–2026)

- [Building a Correct-by-Design Lakehouse](https://arxiv.org/html/2602.02335v1) — Bauplan Labs (2026)
- "Trustworthy AI in the Agentic Lakehouse" — Tagliabue et al. (2025)
- "A Practical Approach to Verifying Code at Scale" — OpenAI (2025)

## Patterns and Libraries

- [Branded Types in TypeScript](https://www.learningtypescript.com/articles/branded-types) — Learning TypeScript
- [NonEmptyList](https://typelevel.org/cats/datatypes/nel.html) — Cats Documentation
- **Haskell:** Liquid Haskell (refinement types), Servant (type-level web APIs), Singletons library
- **TypeScript:** ts-pattern (exhaustive pattern matching), zod (runtime validation with type inference), io-ts (runtime type checking)
- **Rust:** typestate crate, phantom-type patterns, const generics

## Critiques and Discussion

- ['Make invalid states unrepresentable' considered harmful](https://www.seangoedecke.com/invalid-states/) — Sean Goedecke
- [Applying "Make Invalid States Unrepresentable"](https://kevinmahoney.co.uk/articles/applying-misu/) — Kevin Mahoney
- Hacker News discussions: [2023](https://news.ycombinator.com/item?id=40150159), [Applications](https://news.ycombinator.com/item?id=24685772)

## Community Resources

- [F# for Fun and Profit](https://fsharpforfunandprofit.com/) · [Alexis King's Blog](https://lexi-lambda.github.io/) · [r/dependent_types](https://reddit.com/r/dependent_types) · [Haskell Weekly](https://haskellweekly.news/)
