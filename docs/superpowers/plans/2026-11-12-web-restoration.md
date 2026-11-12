# Tiantian Web Restoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a playable, locally saved H5 merging game based on recovered layout and merge rules.

**Architecture:** Pure TypeScript domain, browser persistence adapter, Canvas board with accessible DOM HUD and dialogs. Original cached images are curated into a manifest; missing pastry art uses replaceable SVG drawings. No original SDK or service dependencies.

**Tech Stack:** TypeScript 5.9.3, Vite 5.4.19, Canvas 2D, IndexedDB, Node test runner, Playwright browser checks.

**Spec:** docs/tiantian-web-technical-design.md and docs/tiantian-recovery-results.md.

## Global Constraints

- Preserve original WeChat caches and analysis results.
- Confirmed logical design resolution: 750×1334. Mobile and desktop must have no horizontal scrolling.
- Implement production, movement, equal-item merging, swapping, orders, energy, storage, growth, audio settings, and save import/export.
- Missing original numerical configuration is explicitly tracked as provisional local content.
- Never load original SDKs, production APIs, or payment/advertising functionality.
- Work in the current dedicated folder: it has no Git repository; do not create commits or worktrees.

## Review Focus

- Invalid or full-board production must not lose energy or advance random state (Task 1).
- Duplicate/replayed order commands cannot grant rewards twice (Task 1).
- Hidden-page energy recovery and full-energy anchors remain consistent (Task 1).
- Imported malformed saves cannot corrupt the active save; fallback remains usable (Task 2).
- Small-screen resizing and pointer cancel cannot lose items or create overflow (Tasks 3–4).

### Task 1: Deterministic game domain

Files: src/game/content.ts, src/game/model.ts, tests/model.test.ts.
Interfaces: createGame(now:number): GameState; dispatch(state, command, now): Result; recoverEnergy(state, now): GameState; validateGame(value): GameState.

- [x] Write Node tests for merge/swap/max level, production failures, deterministic drops, order idempotency, storage, energy recovery, save validation.
- [x] Run `npm test` and observe missing implementation failures.
- [x] Implement seeded, immutable command state transitions; 3 item chains of 7 levels, 2 producers, 20 order templates, configurable 7×9 board and 8 storage slots.
- [x] Run `npm test`, require all tests passing.

### Task 2: Persistence and browser runtime

Files: src/game/storage.ts, src/game/session.ts, src/game/audio.ts; tests/storage.test.ts.
Interfaces: SaveStore.load/save/export; Session.send(command), subscribe(listener), state, writable, saveStatus.

- [x] Write failure tests for malformed saves, outdated snapshots, and export/import validation.
- [x] Implement ordered IndexedDB snapshots with previous valid snapshot and explicit errors, Web Locks single-writer session with lease fallback, DOM lifecycle recovery and synthesized audio.
- [x] Run domain/persistence tests; browser checks exercise real IndexedDB and page reload.

### Task 3: Playable game and restored presentation

Files: index.html, src/main.ts, src/styles.css, src/game/board.ts, src/game/art.ts, src/game/ui.ts, public/assets/manifest.json; README.md; docs/restoration-differences.md.

- [x] Curate cached gem/scissors/character images, generate consistent pastry SVG replacements and a café illustration.
- [x] Implement responsive café-themed game page, resource HUD, three orders, Canvas 7×9 chessboard, selected item detail, storage/settings/collection/shop/home dialogs and tutorial.
- [x] Pointer drag and tap-select use the same command path; invalid drops/cancel return without mutation. Animate committed changes without delaying rewards.
- [x] Verify `npm run typecheck`, `npm run build`; document setup and all provisional rules.

### Task 4: End-to-end verification and handoff

Files: tests/browser-check.mjs, docs/implementation-log.md, tiantian-web-source.zip.

- [ ] Open local page, produce, merge, complete at least three distinct orders, use storage/settings, reload and confirm persistence.
- [ ] Check 320/375/390/430 px and desktop, pointer cancellation, real storage import errors, console and network failures.
- [x] Request one fresh code review, fix meaningful findings with regression tests, rerun suite and build.
- [ ] Package source and production build; leave local preview running and provide its URL.

## Execution rulings

- Phaser acquisition failed via npm DNS and GitHub oversized-file access. Use native Canvas 2D and a separate renderer boundary; cost: Phaser effects would require an adapter later.
- The original board dimensions/configuration are not recovered. Use a clearly provisional 7×9 layout and 20 reachable order templates; cost: exact content differs until original config is available.
- Use DOM for HUD/dialog accessibility and Canvas for the board; cost: CSS/Canvas coordination is covered by responsive checks.
- Reuse existing installed TypeScript/Vite packages via local symlinks in this environment; package.json pins portable dependencies for normal npm installation elsewhere.

Actual limitations: real browser/IndexedDB/mobile acceptance blocked by environment. Node DOM simulation and build passed. Standalone file and source archive delivered; no preview server could remain running.
