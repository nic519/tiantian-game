# Implementation ledger

- 2026-11-12: Read design and actual recovery report; approved user request is to implement the playable Web version.
- Ruling: Current folder has no Git repository; work in place, preserve analysis, no commit/worktree actions.
- Ruling: Use Canvas 2D because Phaser cannot be downloaded in the current execution environment; keep domain/rendering separate.
- Ruling: Use provisional 7×9 board and explicit local numerical content; never present it as original recovered configuration.
- Ruling: Use DOM HUD/dialogs for accessibility alongside Canvas board.
- Ruling: Existing local Vite/TypeScript modules supply offline tooling; deliver portable pinned dependency declarations.
- Task 1 complete: 14 initial domain tests red→green; subsequent validation regressions also pass.
- Task 2 complete with verification limit: ordered persistence implemented; snapshot helpers and deferred Session import tested; real IndexedDB is unverified.
- Task 3 complete with verification limit: responsive UI, original 7×9 board texture, replacement SVG art, controls and offline HTML built; visual browser QA blocked.
- Ruling: Original 7×9 dimensions are now confirmed by recovered 744×950 board textures; initial arrangement/numerics remain provisional.
- Ruling: Unsupported Web Locks browsers remain read-only rather than use an unsafe lease fallback; cost: older browsers cannot change progress.
- Ruling: Browser security denied file:// navigation; do not work around this through another browser surface. Real browser verification is explicitly deferred. Node DOM simulations are a different, limited verification method.
- Final review: fresh reviewer reviewed all new code. Five Important findings were accepted and fixed with red→green regressions: corrupt snapshot revision, import concurrency, ownership stale snapshot, malformed item identifiers, keyboard merge focus. Additional multi-pointer regression was fixed.
- Final review set aside: browser visuals/IndexedDB/pointer capture remain unverified; provisional numerical fidelity and art remain documented differences; final packaging is covered by the handoff below.
- No minor findings deferred by reviewer. Task 4 code review/test/build completed; real browser and mobile acceptance remain pending for the stated environment limitation.
