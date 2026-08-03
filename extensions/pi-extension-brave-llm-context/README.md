# pi-extension-brave-llm-context

A Pi package that grounds agent research with Brave LLM Context. It returns
Brave's relevance-ranked, extracted source content rather than a search-result
page, so the agent can use current external information without adding a
separate browser workflow.

## Install locally for every Pi project

From this repository:

```sh
pi install ./extensions/pi-extension-brave-llm-context
```

Pi registers the package in user settings. Because this is a local package,
it continues to load the source tracked in this repository rather than a copied
version.

## Configure Brave credentials

Create `~/.pi/agent/brave-llm-context.json` and restrict it to its owner:

```json
{
  "apiKey": "YOUR_BRAVE_SEARCH_API_KEY",
  "defaults": {
    "country": "ALL",
    "search_lang": "en",
    "count": 10,
    "maximum_number_of_urls": 10,
    "maximum_number_of_tokens": 4096,
    "maximum_number_of_snippets": 25,
    "maximum_number_of_tokens_per_url": 2048,
    "maximum_number_of_snippets_per_url": 10,
    "context_threshold_mode": "balanced"
  }
}
```

```sh
chmod 600 ~/.pi/agent/brave-llm-context.json
```

Keeping credentials outside the package prevents secrets from being committed
or included if the package is later shared. `ALL` avoids country-specific
ranking; `search_lang` remains a language preference and can be overridden per
search.

## Tool

The package registers `brave_llm_context`. Ordinary searches default to ten
results and roughly 4,096 context tokens. The tool also exposes optional
freshness, relevance, Goggle, local-recall, and location controls. It does not
send location unless a call explicitly supplies location fields.

Results are formatted as Markdown grouped by original source URL. Output is
limited to Pi's 50 KB / 2,000-line tool cap; when needed, the complete result is
saved to a temporary Markdown file.

## Development

```sh
npm install
npm run typecheck
npm test
```

The automated tests mock filesystem and network access. They exercise config
validation, transient-request retrying, and the formatted tool result without
consuming Brave API quota.
