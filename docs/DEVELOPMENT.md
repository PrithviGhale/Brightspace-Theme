# Brightspace After Hours

This is the detailed development/coverage guide. For a short introduction, installation steps and downloads, see the [project README](../README.md). The current version is **1.2.2**: the popup includes its installed version and a user-clicked link to the latest GitHub release. It does not fetch release metadata or update code automatically. Test screenshots contain fictional data only.

A lightweight, unofficial Manifest V3 extension for **Chrome and Opera**, covering **https://learn.snhu.edu/** on every path and two explicitly approved embedded widget hosts. Dark, Dim, Warm / sepia, and Original appearances; a keyboard-accessible popup; an on/off switch; and preferences saved on your device. No background worker or runtime dependencies.

Version **1.1.1** added matched menu-row/hover colors, inset keyboard focus rings, Calendar sidebars/filters, ePortfolio editor panels, Progress sections, Account Settings tabs, rich-text editor controls and floating settings toolbars. Version 1.1.0 fixed legacy discussion rows, navigation shadow buttons and embedded HTML panels, and added the two approved widgets below. These changes use selectors and component structure inspected on authenticated Brightspace pages on October 21, 2026. Version 1.2.0 adds the manual latest-release link and a compact popup with its installed version.

**Expanded website scope, explicitly approved for this version:**

- `https://d1i6rhttasws5m.cloudfront.net/production/*` — embedded current-grade widget.
- `https://d1zg7b99iisfa6.cloudfront.net/production/*` — embedded discussion-activity widget.

The browser grants content-script access to these paths. Before touching the document or reading preferences, the widget bootstrap requires a nested frame whose top-level ancestor origin is exactly `https://learn.snhu.edu`. Direct visits and widgets embedded under other top-level sites are not themed. There are no wildcard CloudFront permissions, extra API permissions, cross-frame messages, data extraction, or network requests from the extension. The widgets themselves retain their existing network behavior.

Version **1.0.1** fixes fixed-white Brightspace course-card hosts, slotted course titles, white navigation wrappers, and matching navigation web-component surfaces. Institutional logo containers receive a light backing while image pixels stay unchanged. The viewport background also follows the theme on short pages. These fixes are based on a user dashboard screenshot and Brightspace's upstream card implementation; they still need verification on the authenticated site.

To update an existing unpacked install, replace its files with the new ZIP contents, click **Reload** on its browser Extensions page, then refresh Brightspace. Alternatively remove the old extension and load the newly extracted folder; removing it resets preferences. Keep only one copy enabled.

This project started from an empty folder. No existing work was replaced. It is not affiliated with SNHU or D2L.

Version **1.0.2** fixes the reported `Cannot read properties of null (reading 'get')` error. An isolated extension world may expose no custom-element registry. Discovery now checks for that capability and continues scanning; candidate hosts get one batched check after their first render frame, with startup checks at document-ready/load. These checks are bounded and do not poll or repeat whole-page scans. The local missing-registry fixture and actual-extension test include an unregistered element before fixed-white course cards so that this failure cannot silently pass again.

## Install in Chrome

1. Keep this project in a permanent folder. If using the shared ZIP, **extract it first**; Chrome cannot load the ZIP directly.
2. Enter `chrome://extensions` in the address bar.
3. Turn on **Developer mode** at the top right.
4. Click **Load unpacked**.
5. For this project, select the **extension** folder (the folder containing `manifest.json`). For the shared ZIP, select the extracted folder containing `manifest.json` directly.
6. Open the Extensions puzzle menu and pin **Brightspace After Hours**.
7. Open or refresh your Brightspace tabs at `https://learn.snhu.edu/`, then open the toolbar popup.

## Install in Opera

1. Keep the project or extracted ZIP in a permanent folder.
2. Enter `opera://extensions` in the address bar.
3. Enable **Developer mode**.
4. Click **Load unpacked** (some Opera versions label this **Load unpacked extension**).
5. Select this project's **extension** folder, or the extracted ZIP folder containing `manifest.json` directly.
6. Pin the extension through Opera's Extensions toolbar menu, then open or refresh your Brightspace tabs.

Both browsers load the same files. Managed school/work browser policies may disable developer-mode extensions. The browser may display a developer-extension reminder. Opera has not been run in this environment; verify your installed Opera release with the checklist below.

## Use and reload

The default is **on, Dark**. Choose a theme using the radio buttons; use Tab to reach the group and arrow keys to change choices. The switch supports Space. A visible focus ring follows keyboard focus. **Original** removes theme overrides. Turning the switch off also removes overrides and remembers the chosen theme for next time. You can choose a theme while off.

Changes update open matching tabs and frames through `chrome.storage.onChanged`. Preferences persist across browser restarts and remain separate for each browser profile and for Chrome versus Opera. They do not sync to a cloud account. Uninstalling the extension removes its preferences.

After editing files, go to `chrome://extensions` or `opera://extensions`, find this extension, and click its **Reload** circular-arrow button. **Refresh every open Brightspace tab afterward**, so old content scripts are replaced. Close and reopen the popup. Do not move or delete the unpacked folder while using it.

## Local preview and checks

Requires a recent Node.js (24 used here). There is no `npm install` step.

From the project folder:

```powershell
node tools/preview-server.mjs
```

Open **http://127.0.0.1:4173/**. Stop the server with Ctrl+C. It binds only to localhost. The preview contains fictional dashboard cards, discussion HTML, assignment controls, a grade table, quiz controls, a dialog, images/video poster, a same-origin HTML frame, and nested/dynamically added open shadow components. The popup iframe uses the real popup files with a **preview-only localStorage adapter**. This adapter is excluded from the extension and ZIP. The preview is not a replica of SNHU's authenticated UI.

For the dashboard regression case, open **http://127.0.0.1:4173/preview/dashboard.html**. It reproduces fixed-white card hosts in adopted stylesheets, slotted titles, legacy navigation wrappers, a shadow navigation footer, and a dark logo. The browser check verifies all three themes and Original restoration and saves `dist/dashboard-{dark,dim,warm}.png`.

For the course-page fixes, open **http://127.0.0.1:4173/preview/course-surfaces.html**. It uses fictional text with the observed discussion-row classes, navigation trigger roots, and nested grade/discussion widget roots. All three themes are checked, with screenshots at `dist/course-{dark,dim,warm}.png`. The actual-extension integration test separately verifies the approved widget origins, theme synchronization, removal on off, and rejection of direct visits and unrelated embeddings.

For menu and settings checks, open **http://127.0.0.1:4173/preview/menu-settings.html**. It has fictional Course Menu/Tools/account menus, Calendar controls, Progress/ePortfolio panels, form fields, settings tabs and editor/floating toolbars. Automated tests check normal/hover colors, inset keyboard focus, panel colors and Original restoration across Dark, Dim and Warm. Screenshots: `dist/menus-{dark,dim,warm}.png`. Gold/dark-brown focus rings are intentional accessibility indicators, not broken theme colors.

```powershell
node tests/check.mjs
node tests/browser.mjs
node tests/extension.mjs
powershell -NoProfile -File tools/package.ps1
```

The first check validates manifest scope/assets, JavaScript syntax, preference validation/defaults/events/concurrent key writes, initial-read race handling, and palette contrast. Normal palette text, links, and status colors exceed 4.5:1 against the three surfaces; focus exceeds 3:1 against the main surface. This is not a whole-site accessibility certification.

The second runs real headless Chrome against the local preview and captures `dist/preview-dark.png`, `preview-dim.png`, and `preview-warm.png`. It checks computed theme colors, popup controls, frame synchronization, dynamic/nested open roots, off/Original cleanup, focus styling, dialog behavior, media colors, and persistence on page reload.

The third loads the **actual unpacked extension**, so Chrome validates the manifest. It uses real `chrome.storage.local`, two tabs, matching and `srcdoc` frames, and an open shadow root; checks outside-host exclusion and off/on behavior; then restarts Chrome and checks saved preferences and theming. It intercepts all fixture requests and fulfills them locally: **no request to SNHU or login is needed**. Chrome's automation load is session-scoped, so the test reloads the same extension ID after relaunch to check the persisted storage.

Browser checks use a separate temporary profile under `dist/chrome-test-*`, never your normal Chrome profile. They require Chrome renderer processes and local debugging sockets to be allowed by the execution environment. Set `CHROME_PATH` if Chrome is installed elsewhere. Tests leave those profiles for diagnosis; after their Chrome processes exit you may delete those specific test-profile folders. The extension does not request debugging permission; debugging is used only by the local tests.

## Test on your Brightspace account

1. Load unpacked, refresh two Brightspace tabs, and open the popup. Change Dark → Dim → Warm. Both tabs should update without another refresh.
2. Visit the dashboard, course home, discussions and replies, assignment details/submission, grades, and a **practice** quiz. Open dropdowns, dialogs, expanded panels, and feedback. Do not submit a real assignment or quiz just to test the extension.
3. Open HTML module readings in the course-content viewer and any same-domain HTML frames. Check authored inline text/backgrounds, tables, lists, code, links, and form placeholders.
4. Use Tab/Shift+Tab and arrow keys. Check focus rings, native radio/checkbox/select controls, disabled states, validation and success messages, and 200% zoom. Inspect images/video against Original to confirm their colors are unchanged.
5. Select Original and switch off: page colors should return. Select Warm while off, turn on, then fully quit and reopen the browser. Confirm Warm remains selected and applies on a fresh Brightspace visit.
6. Navigate within a course without reloading and open newly inserted panels. Check a separate non-Brightspace website remains unchanged. Repeat in Opera.
7. Look for errors in the extension's card on the browser Extensions page. If a course page is unreadable, use Original/off and report the browser version, page category, and affected control **without including private course content**.

**Authenticated originals were inspected read-only**: dashboard, course home, discussion topic rows, assignment list, grade table, HTML module content/viewer, Calendar, Classlist, ePortfolio, Progress, Profile, Notifications and Account Settings (Account Settings, Discussions and Email tabs). A quiz list was inspected in the earlier pass; no quizzes were opened during the latest menu/settings pass and no attempt was started. Only structural selectors, colors and frame origins informed the fixtures; no course text, grade values, personal form values or credentials were copied into project artifacts. No coursework or settings were submitted or edited. MyCourseEvals was not exposed in the connected menus; alternate Calendar views did not all finish loading. See `PAGE_AUDIT.md` in the project for the coverage record. The new extension has not been loaded into the authenticated in-app browser, so final appearance there still needs checking after installation. Local fixture success does not establish complete compatibility with every course or Brightspace update.

## Coverage and limitations

- The manifest matches every path on exactly `https://learn.snhu.edu/*`, with `all_frames`. Matching embedded HTML documents receive their own script. `match_about_blank` and `match_origin_as_fallback` also cover eligible blank, `srcdoc`, blob, and data frames initiated by the matching origin. This does not grant access to arbitrary external websites.
- The two approved widget hosts are an explicit exception to the original SNHU-only scope. Their `/production/*` paths receive the same local theme engine only under the SNHU top-level origin. Other external hosts remain excluded. Embedded HTML/widget backgrounds use the containing panel's surface tone to avoid mismatched black rectangles.
- Brightspace CSS variables are inherited where supported, with targeted rules for common Daylight containers, HTML text, controls, tables, menus and dialogs. Open shadow roots get a local stylesheet, including nested roots. Closed roots can inherit supported variables but their internal CSS cannot be directly overridden.
- Discovery scans element structure once on enable, then only added subtrees, batched per mutation delivery. Each discovered document/open root has a child-list-only observer, with descendant work deduplicated. There are no timers, polling, network calls, or repeated full-page rescans. Theme changes replace stylesheet text. Original/off removes styles and disconnects observers. Re-enabling makes one fresh structural scan.
- Where a registry is exposed, late-defined custom elements get one post-definition animation-frame check. Without a registry, newly discovered candidates get one batched check after the first render frame. Document-ready/load events each permit one more bounded post-render check of unresolved startup candidates. An element that attaches a root much later after these checks without a discoverable DOM insertion can still be missed. No page-world `attachShadow` monkey patch is installed.
- Embedded **PDFs, Office viewers, third-party LTI tools, cross-origin frames beyond the two approved widgets, browser-controlled surfaces, canvas content, and closed shadow roots** can remain light or otherwise unthemed. Do not expect their coverage. Native control rendering depends on the browser/OS.
- Photos, video, canvas and course SVG artwork are not inverted, filtered, or recolored. Version 1.2.2 adds a logo-only contour in Dark/Dim and removes the earlier white logo plate; this exception does not apply to profile photos. Editor toolbar SVG control glyphs use their button's text color so they remain readable; this is restricted to `.tox-tbtn`/`.tox-mbtn` controls. Background images and gradients are preserved. Consequently, artwork containing baked-in text or bright areas can remain bright or need Original mode for readability. Semantic status styling and heavily customized course templates need real-page inspection.
- Strict page/frame CSP policies may prevent injected styles from applying. Hardcoded component styles, later custom styles, or future Brightspace changes may need additional selectors. An initial flash of original appearance can occur while local preferences load.
- Theme rules affect screen and print rendering while enabled. Choose Original/off before printing if original print colors are required. This extension does not add quiz functionality or change submitted course data.

## Privacy and permissions

The only API permission is **storage**. Automatic content-script access is limited to the SNHU host, its eligible origin-related frames, and the two approved widget paths described above. There are no analytics, tracking, ads, telemetry, remote code, added accounts, remote fonts, or runtime dependencies. The extension makes no external service requests. There is no service worker or permanent background process.

Only `enabled` (boolean) and `theme` (`dark`, `dim`, `warm`, `original`) are written to the extension's browser-local storage. The extension inspects element/shadow-root structure to place styles; it does **not read or store grades, assignment text, credentials, input values, discussion content, or other course data**. No page content is transmitted. You do not need to provide credentials to the developer.

## Files and sharing

- `extension/`: installable MV3 manifest, shared preferences, theme engine, content script, embedded-widget guard, popup HTML/CSS/JS.
- `preview/`: fictional local visual lab, sample frame/media, and preview storage adapter.
- `tests/`: dependency-free checks and Chrome integration tests.
- `tools/`: localhost preview server and ZIP packaging script.
- `dist/brightspace-after-hours-1.2.2.zip`: current sharing package with extension files, the main README and `PAGE_AUDIT.md`; `manifest.json` is at its root. Preview scripts, tests, browser profiles and screenshots are excluded. Older ZIPs are retained locally; install only the current version.

To share, send the ZIP and have the recipient extract it and follow the Load unpacked instructions. A ZIP is not a store listing or signed installer. **Public Chrome Web Store or Opera Add-ons distribution requires developer registration, submission, and review under each store's policies.** Nothing has been published or submitted by this project.

Implementation references: [Chrome content scripts and frame matching](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [Chrome local storage and events](https://developer.chrome.com/docs/extensions/reference/api/storage), [Chrome Load unpacked/reload](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world), [Opera testing and developer mode](https://help.opera.com/en/extensions/testing/), and [Brightspace UI color variables](https://github.com/BrightspaceUI/core/blob/main/components/colors/colors.js). Brightspace's semantic tokens are subject to upstream changes.
