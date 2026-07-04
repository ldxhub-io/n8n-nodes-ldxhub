# Example Workflows

Sample n8n workflows demonstrating LDX hub integration.

## Quick Start

**[`all-services-demo.json`](all-services-demo.json)** — Try all 6 services (StructFlow / AnalyzeDoc / RefineLoop / RenderOCR / CastDoc / ExtractDoc) from a single Form Trigger. Your API key is entered per execution (one credential with expression-based fields required — see the [main README's Quick Start](../README.md#quick-start) for setup). **Best starting point.**

## Individual Service Demos

| File | Resource | Description |
|---|---|---|
| `structflow-inline-demo.json` | StructFlow | Extract structured data from 10 medical notes (Japanese) using inline inputs |
| `structflow-dynamic-inline-demo.json` | StructFlow | Same as inline demo, but the API key is supplied per execution via a Form Trigger. The credential's API Key field is set with an Expression (`{{ $json.api_key }}`) instead of a hardcoded value. |
| `structflow-binary-demo.json` | StructFlow | Extract structured data from a JSONL file (Japanese medical notes) |
| `analyzedoc-demo.json` | AnalyzeDoc | Extract structured data from a medical note document (PDF/JPEG/PNG) using a vision AI model (Japanese) |
| `refineloop-demo.json` | RefineLoop | Refine an XLIFF translation file using Gemini |
| `renderocr-demo.json` | RenderOCR | OCR a PDF and convert to DOCX (Japanese) |
| `castdoc-demo.json` | CastDoc | Convert a text-based PDF to DOCX without OCR |
| `extractdoc-demo.json` | ExtractDoc | Extract plain text or JSONL from a PDF/DOCX/XLSX/PPTX (no AI, no OCR) |

## Import Instructions (individual demos)

1. In n8n, go to **Workflows** → **Import from File**
2. Select one of the `.json` files in this directory
3. After import:
   - Click the **LDXhub** node and select your **LDXhub API** credential (create one first if you haven't — see the main [Credentials Setup](../README.md#credentials-setup))
   - Click the **Read/Write Files from Disk** node and update the **File Path** to point to your local input file

## Input File Formats

These examples reference placeholder paths like `/path/to/your/input.jsonl`. You'll need to provide your own test files:

- **JSONL** (for StructFlow): One JSON object per line, e.g., `{"note":"Patient complains of fever and cough..."}`
- **PDF / JPEG / PNG** (for AnalyzeDoc): A document or image — the vision model reads it directly (scanned documents and photos welcome)
- **XLIFF** (for RefineLoop): Standard `.xlf` file from a CAT tool (source-target bilingual file)
- **PDF** (for RenderOCR): Any PDF (text-based or scanned image)
- **PDF** (for CastDoc): Text-based (digital-born) PDF only — for scanned PDFs, use RenderOCR instead
- **PDF / DOCX / XLSX / PPTX** (for ExtractDoc): Any digital-born document — text is extracted as plain text or JSONL

## Demo Data Note

The StructFlow and AnalyzeDoc examples use Japanese medical note data, demonstrating LDX hub's strong multilingual support. The system prompt and example output are also in Japanese. Feel free to adapt these to your own domain and language.
