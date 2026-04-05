#!/usr/bin/env bash
# tcr.sh — General-purpose TCR (test && commit || revert) script
#
# Supports three modes:
#   hard     — revert everything on failure (classic TCR)
#   relaxed  — revert only source dir on failure, preserve tests
#   gentle   — same as hard, but stash failed code before reverting
#
# Usage:
#   ./tcr.sh <test-command> [options]
#
# Examples:
#   ./tcr.sh "pytest -x"
#   ./tcr.sh "npm test" --mode relaxed --src src/
#   ./tcr.sh "go test ./..." --mode gentle
#   ./tcr.sh "cargo test" --mode relaxed --src src/ --max-retries 3

set -euo pipefail

# --- Defaults ---
MODE="hard"
SRC_DIR=""
MAX_RETRIES=1
RETRY_DELAY=0
COMMIT_MSG_PREFIX="tcr"
VERBOSE=false

# --- Usage ---
usage() {
    cat <<'USAGE_EOF'
Usage: ./tcr.sh <test-command> [options]

Options:
  --mode <hard|relaxed|gentle>   Revert strategy (default: hard)
  --src <dir>                    Source dir to revert in relaxed mode (required for relaxed)
  --max-retries <n>              Retry attempts before giving up (default: 1, no retry)
  --retry-delay <seconds>        Delay between retries (default: 0)
  --msg <prefix>                 Commit message prefix (default: "tcr")
  --verbose                      Print detailed output
  -h, --help                     Show this help

Modes:
  hard      Revert all uncommitted changes on test failure.
  relaxed   Revert only --src directory on failure; test files are preserved.
  gentle    Stash failed changes before reverting. Recover with: git stash list
USAGE_EOF
    exit 0
}

# --- Parse args ---
TEST_CMD="${1:-}"
if [[ -z "$TEST_CMD" || "$TEST_CMD" == "-h" || "$TEST_CMD" == "--help" ]]; then
    usage
fi
shift

while [[ $# -gt 0 ]]; do
    case "$1" in
        --mode)     MODE="$2"; shift 2 ;;
        --src)      SRC_DIR="$2"; shift 2 ;;
        --max-retries) MAX_RETRIES="$2"; shift 2 ;;
        --retry-delay) RETRY_DELAY="$2"; shift 2 ;;
        --msg)      COMMIT_MSG_PREFIX="$2"; shift 2 ;;
        --verbose)  VERBOSE=true; shift ;;
        -h|--help)  usage ;;
        *)          echo "Unknown option: $1"; usage ;;
    esac
done

# --- Validate ---
if [[ "$MODE" == "relaxed" && -z "$SRC_DIR" ]]; then
    echo "Error: --src is required in relaxed mode."
    echo "Example: ./tcr.sh \"pytest\" --mode relaxed --src src/"
    exit 1
fi

if ! git rev-parse --is-inside-work-tree &>/dev/null; then
    echo "Error: not inside a git repository."
    exit 1
fi

if [[ -z "$(git log --oneline -1 2>/dev/null)" ]]; then
    echo "Error: repository has no commits. Make an initial commit first."
    exit 1
fi

# --- Helpers ---
log() {
    if [[ "$VERBOSE" == true ]]; then
        echo "[tcr] $*"
    fi
}

has_changes() {
    ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]
}

run_tests() {
    log "Running: $TEST_CMD"
    if eval "$TEST_CMD"; then
        return 0
    else
        return 1
    fi
}

do_commit() {
    git add -A
    local msg="$COMMIT_MSG_PREFIX: green"
    if [[ "$MAX_RETRIES" -gt 1 ]]; then
        msg="$COMMIT_MSG_PREFIX: green (attempt $attempt)"
    fi
    git commit -m "$msg" --quiet
    echo "✓ Tests passed — committed."
}

do_revert() {
    case "$MODE" in
        hard)
            git checkout . 2>/dev/null
            git clean -fd --quiet 2>/dev/null
            echo "✗ Tests failed — reverted all changes."
            ;;
        relaxed)
            # Revert tracked changes in source dir
            git checkout HEAD -- "$SRC_DIR" 2>/dev/null || true
            # Remove untracked files in source dir
            git clean -fd --quiet -- "$SRC_DIR" 2>/dev/null || true
            echo "✗ Tests failed — reverted $SRC_DIR (other files preserved)."
            ;;
        gentle)
            git stash push -m "tcr-failed-attempt-$(date +%s)" --include-untracked --quiet
            echo "✗ Tests failed — stashed and reverted. Recover with: git stash list"
            ;;
    esac
}

# --- Main loop ---
if ! has_changes; then
    echo "No changes to test."
    exit 0
fi

for attempt in $(seq 1 "$MAX_RETRIES"); do
    if [[ "$MAX_RETRIES" -gt 1 ]]; then
        log "--- Attempt $attempt/$MAX_RETRIES ---"
    fi

    if run_tests; then
        do_commit
        exit 0
    else
        do_revert

        # If this was the last attempt, exit with failure
        if [[ "$attempt" -eq "$MAX_RETRIES" ]]; then
            if [[ "$MAX_RETRIES" -gt 1 ]]; then
                echo "✗ All $MAX_RETRIES attempts failed."
            fi
            exit 1
        fi

        # Wait before retry if configured
        if [[ "$RETRY_DELAY" -gt 0 ]]; then
            log "Waiting ${RETRY_DELAY}s before retry..."
            sleep "$RETRY_DELAY"
        fi
    fi
done
