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

## [Unreleased](https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.10.0...HEAD)

## [0.10.0] - 2026-07-03

### Added
- New resource: **AnalyzeDoc** (6th service) — extract structured JSON from PDF/JPEG/PNG documents with a vision AI model, following your prompt and example output. Model dropdown loads 15 vision models dynamically; output format is derived per selected model.

### Changed
- `package.json` description and keywords updated to cover all six services (previously listed four)

## [0.9.2] - 2026-05-23

### Added
- New integrated example: `examples/all-services-demo.json` — try all 5 services from a single Form Trigger with API key consumed per execution
- README: dedicated "Quick Start" section featuring the integrated demo

### Changed
- All example workflows now explicitly set `resource` and `binaryPropertyName` parameters (future-proof against future LDX hub Node default changes)
- examples/README.md restructured: "Quick Start" (all-services) separated from "Individual Service Demos"
- README.md: Quick start hint in Usage section renamed to "Examples" to avoid conflict with the new Quick Start section

### Removed
- `meta.templateCredsSetupCompleted` flag from all example workflows (misleading for marketplace import)

## [0.9.1] - 2026-05-23

### Fixed

- Authentication selector defined in 0.9.0 was not visible in the n8n UI because `credentials.displayOptions.show` referencing a property name causes n8n to internalize that property as a credential-selector control instead of a regular parameter. The entire Dynamic-vs-Static split is now removed in favor of a single credential.

### Changed

- Consolidated `LdxHubApi` and `LdxHubDynamicApi` into a single `LdxHubApi` credential. The API Key field accepts both static values and n8n expressions (e.g., `{{ $json.api_key }}`) for per-execution keys. Existing `LdxHubApi` credentials keep working without modification.
- Removed the credential connection test on save so expressions in the API Key field can be evaluated lazily at execution time.
- Simplified transport layer: removed `getAuthenticationMode` and `getCredentialNameForMode` helpers. Public metadata endpoints (`/{service}/models`, `/{service}/engines`) are always called without authentication regardless of how the credential is configured.
- README and `examples/README.md`: rewrote the Dynamic credentials documentation to reflect the single-credential approach. Added a "Dynamic API key" link in the StructFlow Examples row.

### Removed

- `LdxHubDynamicApi` credential type (functionally replaced by setting an Expression on the `LdxHubApi` credential's API Key field). 0.9.0 published this type but the Authentication selector that activated it was not rendered, so in practice no production workflows depend on it.
- `Authentication` parameter on the LDXhub node (no longer needed with a single credential type).

## [0.9.0] - 2026-05-22

### Added

- New `LdxHubDynamicApi` credential variant for per-execution API keys (Form Trigger, AI agent context, multi-tenant workflows)
- Authentication selector on LDXhub node (`API Key` / `API Key (Dynamic)`)
- `examples/structflow-dynamic-inline-demo.json`: StructFlow with Form Trigger + Dynamic credentials

### Changed

- Transport layer: bypass credential resolution for public metadata endpoints (`/{service}/models`, `/{service}/engines`) in dynamic mode, enabling Model/Engine dropdowns during workflow design
- README: added Dynamic Credentials (Advanced) subsection under Credentials Setup

## [0.8.3] - 2026-05-08

### Changed

- CI: migrated to npm Trusted Publishing (OIDC). No more long-lived `NPM_TOKEN` secret. Mitigates supply chain attack vectors (Mini Shai-Hulud pattern)

## [0.8.2] - 2026-05-07

### Changed

- README: simplified ExtractDoc usage section to match other resources (removed redundant Use case/Pricing/Engine bullets, added Example link)
- examples/refineloop-demo.json: explicit `pollingSettings` (180/10) for consistency with other demo workflows

## [0.8.1] - 2026-05-02

### Changed

* README: added Quick Facts block (free tier, one-key for all providers,
  30-second sign-up) at the top for clearer onboarding
* README: strengthened Credentials Setup step 1 with sign-up methods
  (GitHub, Google, email)
* README: added "One credential for all AI providers" to Features
* `LdxHubApi` credential: added free-tier hint to API Key tooltip

## [0.8.0] - 2026-04-30

### Added

* **ExtractDoc** resource: extract plain text or JSONL from PDF/DOCX/XLSX/PPTX
  using the LDX hub `ki/extract` engine (no AI, no OCR, free tier). Useful as
  a preprocessing step before StructFlow or as a standalone text extractor.
* `getExtractDocEngines` and `getExtractDocOutputFormats` loadOptions

## [0.7.0] - 2026-04-28

### Fixed
- HTTP errors now wrapped with `NodeApiError` across polling and
  download helpers (5 files), preserving HTTP status, response body,
  and request context in the n8n UI (n8n verified manual review)

### Removed
- Dead `requestDefaults` block from `LdxHub.node.ts`. The node is
  programmatic (uses `execute()` with `httpRequestWithAuthentication`),
  so the declarative routing system never engaged this config

## [0.6.0] - 2026-04-24

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

[Unreleased]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.10.0...HEAD
[0.10.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.9.2...0.10.0
[0.9.2]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.9.1...0.9.2
[0.9.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.9.0...0.9.1
[0.9.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.8.3...0.9.0
[0.8.3]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.8.2...0.8.3
[0.8.2]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.8.1...0.8.2
[0.8.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.8.0...0.8.1
[0.8.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.6.0...0.7.0
[0.6.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.5.0...0.6.0
[0.5.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.4.1...0.5.0
[0.4.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.4.0...0.4.1
[0.4.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.3.0...0.4.0
[0.3.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.2.1...0.3.0
[0.2.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.2.0...0.2.1
[0.2.0]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/ldxhub-io/n8n-nodes-ldxhub/releases/tag/0.1.1
