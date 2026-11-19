# Contributing

Thanks for helping job seekers spot scams. The most useful contribution is a **new pattern**: a phrase you have seen in a real scam posting that the checker misses.

## Before you open a pull request

1. **Open an issue first** with the scam wording, where you saw it (the job board, not the scammer's details) and roughly when.
2. **Never paste personal information.** Remove names, phone numbers, email addresses and anything that identifies a real person or a real company that was impersonated.

## Adding or changing a rule

Rules live in `src/red-flags.js`, in the `FLAGS` list. A rule is either a set of `patterns` (each match quotes its sentence) or a `check` function for anything that needs counting or combining.

Every change needs two tests in `test/run.js`:

- **It fires** on the scam wording.
- **It stays quiet** on the closest wording a real employer would use. For example, "you must buy a starter kit" fires; "we provide all equipment" and "we will never ask you to pay" do not.

A false alarm on a severe flag tells someone a real employer is a scammer. Severe rules must be specific enough that a legitimate posting never trips them. When in doubt, make it a soft flag.

Run the tests:

```bash
npm test
```

## Style

- Plain JavaScript (ES5 in `src/`) so it runs in any browser without a build step. No dependencies.
- Labels and tips are short, direct and in American English. Tips tell the reader what to do next.
