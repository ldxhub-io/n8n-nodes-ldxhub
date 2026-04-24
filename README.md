# n8n-nodes-ldxhub

[![npm version](https://img.shields.io/npm/v/n8n-nodes-ldxhub.svg)](https://www.npmjs.com/package/n8n-nodes-ldxhub)
[![npm downloads](https://img.shields.io/npm/dm/n8n-nodes-ldxhub.svg)](https://www.npmjs.com/package/n8n-nodes-ldxhub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >=20.15](https://img.shields.io/badge/Node.js-%3E%3D20.15-brightgreen.svg)](https://nodejs.org)

n8n community node for **LDX hub** — AI-powered document processing platform: structured data extraction (StructFlow), XLIFF translation refinement (RefineLoop), layout-preserving OCR (RenderOCR), and text-based PDF conversion (CastDoc).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Credentials Setup](#credentials-setup)
- [Usage](#usage)
  - [StructFlow](#structflow--extract-structured-data-from-text)
  - [RefineLoop](#refineloop--xliff-translation-refinement)
  - [RenderOCR](#renderocr--pdfimage-to-office)
  - [CastDoc](#castdoc--text-based-pdf-to-office-no-ocr)
- [AI Agent Integration](#ai-agent-integration)
- [Polling Settings](#polling-settings)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [License](#license)

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

- An [LDX hub](https://ldxlab.io/ldxhub) account
- n8n version supporting community nodes (v1.x or later)
- A paid or free tier subscription (free tier includes 25,000 credits/month, suitable for evaluation)

## Credentials Setup

1. Sign up or log in at the [LDX hub DevPortal](https://gw.portal.ldxhub.io)
2. Choose a subscription plan — start with **Free** (25,000 credits/month) to evaluate, or pick **Starter** / **Standard** / **Pro** for production. See [pricing](https://gw.portal.ldxhub.io/pricing) for details.
3. Click your account email in the top-right of the DevPortal, then select **My Subscriptions**
4. Under **API Keys**, copy the **Current Key**
5. In n8n, create a new **LDXhub API** credential:
   - **Base URL**: `https://gw.ldxhub.io` (default; leave as-is for production)
   - **API Key**: paste the key from step 4
6. Click **Save** — n8n will automatically test the credential by listing available models

If the credential test fails, verify:
- The API key is active (shown with a green dot in the DevPortal)
- The Base URL has no trailing slash
- Your network allows outbound HTTPS to `gw.ldxhub.io`

## Usage

1. Add **LDXhub API** credentials (see [Credentials Setup](#credentials-setup))
2. Add the **LDXhub** node to your workflow
3. Select a resource and operation (see below)

### StructFlow — extract structured data from text

1. Resource: **StructFlow** → Operation: **Run Extraction Job**
2. Configure Model, System Prompt, and Example Output
3. Choose Input Mode:
   - **Inline Inputs**: Provide ID + Data pairs directly in the workflow (good for small batches, quick prototyping)
   - **Binary File**: Provide a JSONL file as binary input (good for large batches, or as part of an ExtractDoc → StructFlow pipeline)

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
2. Provide a PDF file via binary input
3. Choose an engine and output format (docx/xlsx/pptx)

## AI Agent Integration

The LDXhub node is marked as `usableAsTool: true`, so it can be attached to an **AI Agent** node as a tool. This enables agentic workflows where an AI agent autonomously decides when to extract structured data, translate documents, or convert files using LDX hub.

Example use cases:

- Customer support agent that extracts structured complaint data from incoming emails (StructFlow)
- Document processing agent that automatically OCRs and translates uploaded PDFs (RenderOCR → RefineLoop)
- Knowledge base ingestion agent that converts and structures diverse document formats (CastDoc → StructFlow)

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

## Troubleshooting

### 401 Unauthorized

- The API key is invalid, revoked, or expired
- Roll the key from **My Subscriptions** → **API Keys** → **Roll API Key** in the LDX hub DevPortal, then update the n8n credential

### 400 Bad Request — invalid file_id

- The binary input is missing or the binary field name is incorrect
- Check that the previous node outputs a binary property matching the **Input Binary Field** setting (default: `data`)

### Job times out / polling exhausted

- Large documents may exceed the default 30-minute window
- Increase **Max Polling Attempts** in Polling Settings
- For n8n Cloud, also check your plan's workflow execution timeout

### StructFlow Inline mode — empty results

- Ensure **Inputs** collection has at least one record with non-empty **ID** and **Data** fields
- Verify **Example Output** is valid JSON

### Credit limit exceeded

- Your subscription's monthly credit allowance has been reached
- Check usage in the DevPortal's **My Subscriptions** page
- Upgrade your plan or wait for the next billing period

## Support

- **Product**: https://ldxlab.io/ldxhub
- **Documentation**: https://gw.portal.ldxhub.io/introduction
- **Bug reports & feature requests**: [GitHub Issues](https://github.com/ldxhub-io/n8n-nodes-ldxhub/issues)

## License

[MIT](LICENSE)

Copyright (c) 2026 Kawamura International Co., Ltd.
