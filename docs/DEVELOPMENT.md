# Development guide

Current version: **1.6.0**. Manifest V3, local JavaScript/CSS, no runtime dependencies. Read the [README](../README.md) for installation, appearances, update notices and permissions.

## Architecture

- `preferences.js`: validated theme IDs and hex colors; browser-local storage; partial writes and cross-tab events. No page content.
- `content.js`: subscribes before its initial preference read so later changes win. Applies the default immediately, then reconciles saved appearance.
- `theme-engine.js`: semantic D2L color tokens, legacy selectors, open-shadow styles, supported frames, Prism and Liquid Glass designs. Theme switches replace owned style text. Original/Off removes styles and observers.
- `shadow-lifecycle.js`: MAIN-world, document-start helper. While appearance is active, wraps native `attachShadow` and signals only the host of each new open root. No event details, course data or preferences. Preserves native arguments/result/errors. Stops/restores on Off/Original, without clobbering a later library wrapper. The ready/start handshake handles injection order.
- Existing root observers discover added subtrees and repair only owned styles removed by template replacement. No polling, repeated whole-page scans, or reading authored course content. Missing registries and components attaching after load have regression fixtures.
- `widget-context.js`: permits the two production widget paths only below SNHU's top-level origin, before DOM or storage access. The MAIN helper has the same origin guard. Closed roots stay closed.
- `popup.*`: accessible theme picker, glass-mode select, custom contrast validation and release notice. Appearance and update status use separate storage keys.

## Design behavior

Liquid Glass uses `liquid` (Default), `liquid-clear` (Transparent), and `liquid-dark` (Dark) as validated theme IDs. The popup presents one design with a mode selector. Every mode shares the same supported page coverage and preference synchronization. Gradients, blur, inset highlights, rounded surfaces and hover keyframes use bundled CSS only.

Navigation retains native row heights, order, actions and responsive collapse. Compact 44px controls center in full-height hosts. Page-title layout boxes are transparent. Prism and Dark Liquid Glass keep original navigation branding colors on a light backing; photos and authored media are unfiltered. Slotted profile openers are excluded from menu-panel decoration. Embedded SNHU module template panels receive the containing surface color. Data-table geometry selectors avoid layout/authored tables. Nested feedback inherits its cell's surface token.

The background drifts slowly; cards/buttons receive one jelly animation on hover. Reading posts stay stationary. Reduced-motion disables added motion; reduced-transparency selects opaque materials where supported; missing backdrop-filter falls back to solid panel colors. Text uses tested palette contrast, keyboard focus remains visible, and Original restores native styling.

## Release checker

`background.js` is an event-driven service worker that imports `updates.js`. It schedules a six-hour alarm and responds only to update messages from this extension's exact `popup.html` URL. No tab, history, cookie, scripting or notification API is used.

The only network request is a fixed GET to `https://api.github.com/repos/PrithviGhale/Brightspace-Theme/releases/latest`. It omits credentials/referrer, rejects redirects and times out after ten seconds. Only stable `vX.Y.Z` / `X.Y.Z` tags are accepted; draft/prerelease data is ignored. The link destination is a bundled constant, never a response URL. Version ordering is numeric. No remote code is downloaded or executed.

Requests deduplicate while pending. Automatic checks use a six-hour attempt cache, including failed attempts; Check now bypasses that cache. Failed checks retain previously known newer versions. Local `updateInfo` stores latestVersion, checkedAt, attemptedAt and failed. Availability is recalculated against the installed manifest, so installing the current version clears the red action badge. The popup shows a notice/dot and release link. ZIP installation remains manual.

Permissions: `storage`, `alarms`, and `https://api.github.com/*` for this fixed public request. Content-script matches remain SNHU and the two explicitly approved widget production paths. Chrome host permissions grant at origin granularity; the code restricts the actual request to one repository endpoint. GitHub sees ordinary network request metadata, not Brightspace data. Appearance Off does not disable release checks.

The extension-page CSP additionally limits connections to the exact latest-release URL. Keep that policy and `updates.js` endpoint consistent; the static suite checks both. Script sources remain local-only.

## Preview and tests

Use recent Node.js (24 tested) and Chrome. No npm install is needed.

```powershell
node tools/preview-server.mjs
```

Open `http://127.0.0.1:4173/preview/redesign.html`. Select Hello Kitty, Kuromi, Liquid Default, Transparent, Dark or Prism, and switch My Home / Course pages / Calendar. This is fictional sample layout/content using the real theme engine; it is not a replacement dashboard injected into accounts. `/popup-preview` uses the actual popup with a storage adapter; automatic checks run only in the installed extension.

```powershell
node tests/check.mjs
node tests/updates.mjs
node tests/browser.mjs
node tests/liquid.mjs
node tests/characters.mjs
node tests/extension.mjs
./tools/package.ps1
```

- Static checks: manifest scope/assets, syntax, content-script privacy, palettes/focus contrast, preference validation/races.
- Update units: stable numeric versions, dedup/cache, credential/referrer policy, invalid releases, offline retention, fixed links and badge clearing.
- Browser: existing theme, card, frame, table, menu, profile and late-root regressions.
- Liquid: every mode on dashboard/course/calendar plus discussions, submissions, feedback, attachments, tables, menus/settings/progress and photos. Desktop/mobile, focus, hover, reduced motion, no horizontal overflow and Original cleanup.
- Actual MV3: Chrome validates/loads the extension. Real storage, two tabs, widget/frame scope, restart persistence, sixteen cold navigations with six delayed roots, rerender repair, glass-mode sync, real popup/worker messages and red badges. Release responses are stubbed in that isolated worker and external GitHub DNS is blocked. SNHU responses are locally intercepted fictional documents. No live account/network data enters artifacts.

Browser suites create independent disposable profiles inside ignored `dist/`. They may need permission to launch Chrome outside a restricted process sandbox. Screenshots in `dist/liquid-*.png` and `dist/prism-*.png` contain fictional data. Package verification requires exactly 20 assets, including both updater files and the lifecycle helper, with root-level manifest and no preview/test adapter.

For an explicit real-network smoke check, set `AFTER_HOURS_LIVE_UPDATE_SMOKE=1` and run `node tests/extension.mjs`, then unset it. That mode loads only the worker and reads the real public release endpoint; it does not open SNHU or run the fictional page suite. Normal tests do not need network access. This live check passed after the connection policy was updated.

## Manual installed check

Reload the extension, refresh Brightspace, then check each mode on course pages. Test keyboard focus and menus, narrow layouts, visible photos, editor toolbars, grade/assignment rows and supported HTML widgets. Check an initial dashboard navigation without refreshing. Do not submit forms, upload files, post discussions, dismiss announcements or start quizzes during a presentation-only audit.

Authenticated originals were inspected read-only in earlier passes to establish structural selectors; the final 1.5.0 theme has not been installed into that account or independently tested in Opera. External viewers, closed roots, authored templates and future Brightspace changes can require further work. Coverage is detailed in [PAGE_AUDIT.md](../PAGE_AUDIT.md) and [VERIFICATION.md](../VERIFICATION.md).

References: [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests), [action badges](https://developer.chrome.com/docs/extensions/reference/api/action), [alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms), [GitHub releases API](https://docs.github.com/en/rest/releases/releases).

## Selection copy

Local 1.5.4 protects Ctrl+C/Command+C at window capture phase without preventing the native copy default. The copy handler rebuilds only selected text into simple escaped block/run/font elements with explicit black ink, white shading, no highlight and inherited font family. A faithful text/plain alternative is supplied. This avoids source theme styles and can reset an already-colored rich-paste destination. Input/textarea selected ranges are supported; password fields are excluded. No existing clipboard reads, storage, remote calls or permissions. Cut, image-only selections and Off remain native. Browser tests use a pale/dark destination and keyboard interceptor, plus actual MV3 trusted keyboard paste. Word testing remains the user's final validation.

## Local 1.5.5 diagnostics and direct copy

Popup uses an intrinsic 440 by 600 canvas with scrolling to avoid initial viewport max-width shrink. Copy helper metadata is restricted to status, timestamp and version. The direct-copy button queries only the active tab ID (no tabs permission or URL read), sends an extension-only message, and accepts a transient selection response from the content script/frame. Receivers validate exact popup URL and sender extension ID. Plain/HTML data is written through ClipboardItem from the focused popup on explicit click. No clipboard-read permission, copied text persistence or network call. Tests simulate the underlying active tab because their popup is a full tab, then exercise real messaging and clipboard write/paste. User Word confirmation remains required before publication.

## Character themes (local 1.6.0)

Hello Kitty and Kuromi share the theme lifecycle and glass geometry, with independent contrast-checked palettes and local decoration. characterCss applies to document/open-root surfaces while embedded readings remain uncluttered. Only two art PNGs are web-accessible, scoped to existing supported SNHU/widget origins; no additional permissions or remote runtime assets. Attribution is in extension/art/SOURCES.md. tests/characters.mjs covers both across the page fixture families, desktop/mobile, focus, photos, motion and Original cleanup. Actual MV3 tests decode both packaged PNGs from the SNHU fixture and select both popup radios.
