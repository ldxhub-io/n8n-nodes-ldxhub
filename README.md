# n8n-nodes-ldxhub

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ldxhub.svg)](https://www.npmjs.com/package/n8n-nodes-ldxhub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n community node for **LDX hub** — AI-powered XLIFF translation refinement using the RefineLoop API.

## Features

- **RefineLoop**: Iteratively improve XLIFF translation quality using frontier AI models (Google Gemini, Anthropic Claude, OpenAI GPT, and more)
- HTTP long-polling architecture — compatible with n8n Cloud execution model
- Proven at scale: tested with 1.19M-character academic papers

## Installation

In your n8n instance:

1. Go to **Settings** → **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-ldxhub` and confirm

## Prerequisites

- An [LDX hub](https://ldxlab.io/ldxhub) account and API key — [sign up here](https://gw.portal.ldxhub.io/signup)
- n8n version supporting community nodes (v1.x+)

## Usage

1. Add **LDXhub API** credentials (API key from your LDX hub dashboard)
2. Add the **LDXhub** node to your workflow
3. Select **RefineLoop** resource and **Run Refinement Job** operation
4. Provide an XLIFF file via binary input, choose an AI model, and set max revisions

Documentation: https://gw.portal.ldxhub.io/introduction

## Polling Settings

For large documents, jobs may take several minutes. The node polls until completion:

| Setting | Default | Description |
|---|---|---|
| Max Polling Attempts | 180 | Maximum number of poll requests |
| Server Wait Seconds | 10 | Server-side long-poll wait per request |

Theoretical max wait = `Max Polling Attempts × Server Wait Seconds` seconds.
Defaults give 30 minutes. For longer documents, increase Max Polling Attempts
(e.g., 360 for 60 minutes).

> **n8n Cloud users**: your plan's workflow execution timeout applies independently. Check your plan's limits.

## License

[MIT](LICENSE)

Copyright (c) 2026 Kawamura International Co., Ltd.
