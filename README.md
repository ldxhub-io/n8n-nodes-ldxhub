# n8n-nodes-ldxhub

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ldxhub.svg)](https://www.npmjs.com/package/n8n-nodes-ldxhub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

n8n community node for **LDX hub** — AI-powered document processing (XLIFF translation refinement, PDF/image OCR to Office formats).

## Features

- **StructFlow**: Extract structured JSON from unstructured text using AI models (medical records, customer feedback, legal documents, and more)
- **RefineLoop**: Iteratively improve XLIFF translation quality using frontier AI models (Google Gemini, Anthropic Claude, OpenAI GPT, and more)
- **RenderOCR**: Convert PDFs and images to Word/Excel/PowerPoint with layout-preserving OCR (via industry-leading OCR engines)
- **CastDoc**: Convert text-based PDFs to Word/Excel/PowerPoint without OCR (high-fidelity layout preservation for digital-born documents)
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
- **Base URL** (credential field): defaults to `https://gw.ldxhub.io` (production). Most users should leave this as-is; only change it when pointing to a development or staging environment.

## Usage

1. Add **LDXhub API** credentials (API key from your LDX hub dashboard)
2. Add the **LDXhub** node to your workflow
3. Select a resource and operation (see below)

### RefineLoop — XLIFF translation refinement

1. Resource: **RefineLoop** → Operation: **Run Refinement Job**
2. Provide an XLIFF file via binary input
3. Choose an AI model and set max revisions

### RenderOCR — PDF/image to Office

1. Resource: **RenderOCR** → Operation: **Run Conversion Job**
2. Provide a PDF or image file via binary input
3. Choose an OCR engine, target language, and output format (docx/xlsx/pptx)

### CastDoc — text-based PDF to Office (no OCR)

1. Resource: **CastDoc** → Operation: **Run Conversion Job**
2. Provide the File ID of a previously uploaded PDF (from `POST /files`)
3. Choose an engine and output format (docx/xlsx/pptx)

### StructFlow — extract structured data from text

1. Resource: **StructFlow** → Operation: **Run Extraction Job**
2. Configure Model, System Prompt, and Example Output
3. Choose Input Mode:
   - **Inline Inputs**: Provide ID + Data pairs directly in the workflow (good for small batches, quick prototyping)
   - **Binary File**: Provide a JSONL file as binary input (good for large batches, or as part of an ExtractDoc → StructFlow pipeline)

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
