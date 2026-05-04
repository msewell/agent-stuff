# Hyperfine in CI

## Table of Contents

- [CI strategy](#ci-strategy)
- [Smoke gate with JSON and jq](#smoke-gate-with-json-and-jq)
- [Markdown PR comment](#markdown-pr-comment)
- [Bencher integration](#bencher-integration)
- [Hosted-runner caveats](#hosted-runner-caveats)

## CI strategy

Hosted CI runners are noisy. Use one of three approaches:

1. Smoke gate: fail only on egregious regressions.
2. PR comment: publish benchmark output for human review without gating.
3. Continuous benchmarking: use Bencher or dedicated infrastructure for statistically meaningful gates.

Prefer self-hosted or bare-metal runners for merge-blocking performance gates.

## Smoke gate with JSON and jq

Use generous headroom. Hosted runners can vary by 5-30% run to run.

```yaml
name: bench
on:
  pull_request:
    paths: ['src/**', 'Cargo.toml']
jobs:
  bench:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          curl -sSL https://github.com/sharkdp/hyperfine/releases/download/v1.20.0/hyperfine_1.20.0_amd64.deb -o hf.deb
          sudo dpkg -i hf.deb
      - run: cargo build --release
      - run: |
          hyperfine --warmup 3 --min-runs 30 \
            --export-json bench.json \
            './target/release/myapp --bench-input fixtures/data.json'
      - run: |
          mean=$(jq '.results[0].mean' bench.json)
          budget=0.250
          awk -v m="$mean" -v b="$budget" 'BEGIN{ exit !(m < b) }' \
            || { echo "::error::Regression: mean=$mean > budget=$budget"; exit 1; }
      - uses: actions/upload-artifact@v4
        with:
          name: bench
          path: bench.json
```

Tune smoke budgets with substantial headroom, or gate only on large percentage regressions.

## Markdown PR comment

Use this when the benchmark is informative but too noisy to block merges:

```yaml
- run: hyperfine --warmup 3 --export-markdown bench.md './target/release/myapp'
- uses: peter-evans/create-or-update-comment@v4
  with:
    issue-number: ${{ github.event.pull_request.number }}
    body-path: bench.md
```

## Bencher integration

Use Bencher when the project needs historical tracking and statistical alerting.

```yaml
name: continuous-bench
on:
  push:
    branches: [main]
  pull_request:
jobs:
  bench:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bencherdev/bencher@main
      - run: cargo build --release
      - run: |
          bencher run \
            --project my-project \
            --token "${{ secrets.BENCHER_API_TOKEN }}" \
            --branch "${{ github.head_ref || github.ref_name }}" \
            --start-point "${{ github.base_ref }}" \
            --start-point-reset \
            --start-point-clone-thresholds \
            --testbed ci-runner \
            --adapter shell_hyperfine \
            --err \
            --github-actions "${{ secrets.GITHUB_TOKEN }}" \
            "hyperfine --warmup 3 --export-json - './target/release/myapp'"
```

Key flags:

- `--adapter shell_hyperfine`: parse hyperfine JSON.
- `--err`: fail the job when an alert fires.
- `--github-actions`: comment results on the PR.
- `--start-point` plus `--start-point-reset`: compare PRs against the base branch baseline.

## Hosted-runner caveats

Mitigations, in descending value:

1. Use bare-metal or self-hosted runners for gates.
2. Run benchmarks on a dedicated runner pool separate from builds.
3. Increase `--min-runs` to shrink confidence intervals, accepting longer jobs.
4. Compare like-for-like hardware tiers.
5. Prefer statistical thresholds from historical data over fixed absolute budgets.
