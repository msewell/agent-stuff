# Writing Effective Examples

## Table of Contents

- [Declarative over Imperative](#declarative-over-imperative)
- [One Behavior per Scenario](#one-behavior-per-scenario)
- [The Right Level of Detail](#the-right-level-of-detail)
- [Ubiquitous Language](#ubiquitous-language)
- [Worked Example: Good vs. Bad Scenario](#worked-example-good-vs-bad-scenario)
- [Worked Example: Rule-Example Table](#worked-example-rule-example-table)

---

## Declarative over Imperative

The most common mistake is using **imperative** style (step-by-step UI instructions) instead of **declarative** style (behavior descriptions).

**Imperative (avoid):**

```gherkin
Scenario: User logs in
  Given I am on the login page
  When I enter "alice@example.com" in the email field
  And I enter "s3cret!" in the password field
  And I click the "Sign In" button
  Then I should see the text "Welcome, Alice"
  And the URL should be "/dashboard"
```

**Declarative (prefer):**

```gherkin
Scenario: Successful login
  Given Alice has a registered account
  When Alice logs in with valid credentials
  Then she sees her personal dashboard
```

The declarative version:

- Describes **what** happens, not **how** (no CSS selectors, no button names).
- Survives UI redesigns without modification.
- Is readable by any stakeholder, technical or not.
- Lets the development team choose the best implementation.

**Rule of thumb:** if a step mentions a UI element (button, field, link, page), it is probably too imperative.

---

## One Behavior per Scenario

Each scenario should test exactly **one behavior**, expressed as a single When-Then pair.

**Anti-pattern — multiple behaviors in one scenario:**

```gherkin
Scenario: Shopping cart operations
  Given an empty cart
  When I add "Widget" to the cart
  Then the cart contains 1 item
  When I add "Gadget" to the cart
  Then the cart contains 2 items
  When I remove "Widget" from the cart
  Then the cart contains 1 item
```

**Preferred — separate scenarios for separate behaviors:**

```gherkin
Scenario: Adding an item to an empty cart
  Given an empty cart
  When the shopper adds "Widget" to the cart
  Then the cart contains 1 item

Scenario: Adding a second item
  Given a cart containing "Widget"
  When the shopper adds "Gadget" to the cart
  Then the cart contains 2 items

Scenario: Removing an item
  Given a cart containing "Widget" and "Gadget"
  When the shopper removes "Widget"
  Then the cart contains only "Gadget"
```

Splitting reveals duplication, exposes missing cases, and makes failure diagnosis immediate — you know exactly which behavior broke.

---

## The Right Level of Detail

Too abstract is as harmful as too specific.

**Too abstract:**

```gherkin
Scenario: Valid withdrawal
  Given a customer with sufficient funds
  When they withdraw money
  Then the withdrawal succeeds
```

This says nothing about amounts, balances, or what "sufficient" means. It cannot be executed and barely communicates intent.

**Too specific:**

```gherkin
Scenario: Valid withdrawal
  Given customer #4821 "Jane Doe" has a "Premium Checking" account #991028
    with a balance of $1,247.83 and an overdraft limit of $500.00
    opened on 2024-01-15 at branch "Downtown"
  When she withdraws $200.00 at ATM #7734 at 14:32 on 2025-03-01
  Then her balance is $1,047.83
    and transaction #TXN-20250301-001 is recorded
    with type "ATM_WITHDRAWAL" and status "COMPLETED"
```

Most of this detail is noise that obscures the rule being tested.

**Just right:**

```gherkin
Scenario: Withdrawal within available balance
  Given a checking account with a balance of $500
  When the account holder withdraws $200
  Then the account balance is $300
```

Include only the data that is *essential to the rule being illustrated*. Everything else is incidental detail that belongs in the automation layer's setup code, not in the specification.

---

## Ubiquitous Language

Specifications should use the same terms the business uses — not developer jargon, not database column names, not abbreviations that only one team understands.

| Avoid | Prefer |
|---|---|
| `user_id` | customer |
| `POST /api/orders` | places an order |
| `status = 2` | the order is confirmed |
| `txn` | transaction |
| `the system returns 200` | the request succeeds |

Consistency matters. If the business calls it a "customer" in one scenario and a "user" in another, readers waste cognitive effort resolving the ambiguity. Maintain a glossary and enforce it in reviews.

Gherkin scenarios are an excellent vehicle for *discovering* ubiquitous language. Each scenario records a conversation between domain experts and technologists. Over time, the scenario suite becomes a searchable corpus of agreed-upon terminology.

---

## Worked Example: Good vs. Bad Scenario

**Context:** An e-commerce system applies discount coupons at checkout.

**Bad scenario (imperative, multi-behavior, noisy):**

```gherkin
Scenario: Apply coupon
  Given I go to the product page for SKU-12345
  And I click "Add to Cart"
  And I go to the cart page
  And I type "SAVE20" into the coupon code field
  And I click "Apply Coupon"
  Then I see a green banner that says "Coupon applied!"
  And the subtotal shows "$80.00"
  And I click "Proceed to Checkout"
  And I enter my shipping address
  And I click "Place Order"
  Then I see the order confirmation page
```

Problems: couples to UI elements, tests adding-to-cart and checkout flow alongside the coupon rule, includes irrelevant steps, will break on any UI change.

**Good scenario (declarative, single-behavior, focused):**

```gherkin
Rule: A percentage coupon reduces the subtotal by the coupon's percentage

  Scenario: Applying a 20% coupon to a single-item order
    Given an order with a subtotal of $100.00
    And a valid coupon "SAVE20" worth 20% off
    When the shopper applies "SAVE20" to the order
    Then the order subtotal is $80.00

  Scenario: Applying a coupon that has expired
    Given an order with a subtotal of $100.00
    And an expired coupon "OLDCODE"
    When the shopper applies "OLDCODE" to the order
    Then the coupon is rejected
    And the order subtotal remains $100.00
```

The good version names the rule explicitly, uses only data relevant to the rule, reads naturally, and survives any UI change.

---

## Worked Example: Rule-Example Table

For rules with many input-output combinations, a **Scenario Outline** with an **Examples** table is more concise than repeating the scenario:

```gherkin
Rule: Shipping is free for orders over $75; otherwise $5.95 flat rate

  Scenario Outline: Shipping cost based on order total
    Given an order with a subtotal of <subtotal>
    When the shopper proceeds to checkout
    Then the shipping charge is <shipping>

    Examples:
      | subtotal | shipping |
      | $50.00   | $5.95    |
      | $74.99   | $5.95    |
      | $75.00   | $0.00    |
      | $75.01   | $0.00    |
      | $150.00  | $0.00    |
```

The table makes the boundary ($75.00) visually obvious and invites the reader to check whether the boundary is correct. The rule is stated in prose, and the examples *prove* the reader's understanding by showing exactly what happens at the edges.
