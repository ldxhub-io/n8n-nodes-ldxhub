# Example Workflows

Sample n8n workflows demonstrating LDX hub integration.

## Import Instructions

1. In n8n, go to **Workflows** → **Import from File**
2. Select one of the `.json` files in this directory
3. After import:
   - Click the **LDXhub** node and select your **LDXhub API** credential (create one first if you haven't — see the main [Credentials Setup](../README.md#credentials-setup))
   - Click the **Read/Write Files from Disk** node and update the **File Path** to point to your local input file

## Examples

| File | Resource | Description |
|---|---|---|
| `structflow-inline-demo.json` | StructFlow | Extract structured data from 10 medical notes (Japanese) using inline inputs |
| `structflow-binary-demo.json` | StructFlow | Extract structured data from a JSONL file (Japanese medical notes) |
| `refineloop-demo.json` | RefineLoop | Refine an XLIFF translation file using Gemini |
| `renderocr-demo.json` | RenderOCR | OCR a PDF and convert to DOCX (Japanese) |
| `castdoc-demo.json` | CastDoc | Convert a text-based PDF to DOCX without OCR |

## Input File Formats

These examples reference placeholder paths like `/path/to/your/input.jsonl`. You'll need to provide your own test files:

- **JSONL** (for StructFlow): One JSON object per line, e.g., `{"note":"Patient complains of fever and cough..."}`
- **XLIFF** (for RefineLoop): Standard `.xlf` file from a CAT tool (source-target bilingual file)
- **PDF** (for RenderOCR): Any PDF (text-based or scanned image)
- **PDF** (for CastDoc): Text-based (digital-born) PDF only — for scanned PDFs, use RenderOCR instead

## Demo Data Note

The StructFlow examples use Japanese medical note data, demonstrating LDX hub's strong multilingual support. The system prompt and example output are also in Japanese. Feel free to adapt these to your own domain and language.
