# Changelog

<!--
  This CHANGELOG is maintained manually in Keep a Changelog format.
  Do NOT regenerate with auto-changelog.
  Release workflow uses `release-it` directly (see .release-it.json),
  which bumps version, commits, tags, pushes, and creates a GitHub
  release — without touching this file.
-->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Example workflows in `examples/` directory for all 4 resources
  (StructFlow inline, StructFlow binary, RefineLoop, RenderOCR, CastDoc)
- Comprehensive README sections: Table of Contents, Credentials Setup,
  AI Agent Integration, Troubleshooting, Support
- npm downloads and Node.js version badges

### Changed
- Package description now covers all 4 resources instead of RefineLoop only
- Keywords expanded from 10 to 26 terms for better npm discoverability
- Credentials field descriptions improved for clarity
- README usage section reordered: StructFlow first

### Fixed
- README CastDoc section: corrected from `file_id` input to binary input
  (matched the 0.4.1 implementation)

## [0.5.0] - 2026-04-24

### Added
- **StructFlow** resource: extract structured JSON from unstructured text
  using AI models (medical records, customer feedback, legal documents,
  and more)
- Dual input mode for StructFlow:
  - **Inline Inputs**: provide ID + Data pairs directly in workflow
  - **Binary File**: upload JSONL file as binary input (internal upload
    to `/files`, then pass file_id to job)
- `getStructFlowModels` loadOption for StructFlow model dropdown

## [0.4.1] - 2026-04-24

### Changed
- **CastDoc**: migrated from File ID string input to Input Binary Field
  (default: `data`), matching the RenderOCR pattern for consistency
- CastDoc internally uploads the binary to `/files` and uses the
  returned file_id — no manual pre-upload required

## [0.4.0] - 2026-04-24

### Added
- **CastDoc** resource: convert text-based PDFs to Word/Excel/PowerPoint
  without OCR (high-fidelity layout preservation for digital-born documents)
- `getCastDocEngines` and `getCastDocOutputFormats` loadOptions

## [0.3.0] - 2026-04-24

### Added
- **RenderOCR** resource: convert PDFs and images to Word/Excel/PowerPoint
  with layout-preserving OCR via industry-leading OCR engines
- `getRenderOcrEngines`, `getRenderOcrLanguages`, and
  `getRenderOcrOutputFormats` loadOptions

## [0.2.1] - 2026-04-24

### Changed
- Credential field order: Base URL now appears first, above API Key

## [0.2.0] - 2026-04-24

### Added
- Configurable **Base URL** credential field, enabling dev/staging/
  production environment switching without code changes
- Default: `https://gw.ldxhub.io` (production)

## [0.1.1] - 2026-04-24

### Added
- Initial npm publication with provenance
- **RefineLoop** resource: iteratively improve XLIFF translation quality
  using frontier AI models (Google Gemini, Anthropic Claude, OpenAI GPT,
  and more)
- HTTP long-polling architecture for n8n Cloud compatibility
- `getModels` loadOption for RefineLoop model dropdown
- `LDXhub API` credential with API Key + Base URL

### Fixed
- Icon path correction after repository structure cleanup

[Unreleased]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.5.0...HEAD
[0.5.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/releases/tag/0.1.1
