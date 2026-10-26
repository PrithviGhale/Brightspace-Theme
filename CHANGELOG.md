# Changelog

## 1.8.1 - 2026-10-26

- Drop the experimental ChatGPT/Claude sidebar from the local test build. This release has no chat sidebar, chat shortcut, sidePanel permission or AI website integration.
- Add Copy page text as a standalone popup button, working with themes on or off; readable text stays transient and plain.
- Add a saved Performance mode independent of appearance. Keep artwork, fonts and palette; stop decorative motion, glass blur and soft panel shadows. No polling or background AI processes.
- Rendering savings are not quantified; course features and media remain available.

## 1.7.8 - 2026-10-22

## What's new

- Six new character themes: My Melody, Sugarbunnies, Attack on Titan, Genshin Impact, Miffy and My Neighbor Totoro. Each has its own artwork, palette and layout details.
- Redesigned extension popup with an always-visible, two-column character picker.
- Illustrated Hello Kitty and Kuromi welcome cards, theme-matched heading fonts and softer image-to-color blends in photographic welcome banners.
- Genshin page-specific backgrounds, Primogem course accents, calendar Paimon and game-style home/mail/chat/notices icons.
- Bolder cartoon styling for Miffy and Gothic headings for Attack on Titan with a bundled font fallback.

## Fixes and polish

- Larger, consistent navigation icons; correctly centered home links and a balanced Paimon icon.
- Transparent SNHU logo backing in every theme, with a subtle lettering contour on dark backgrounds.
- Remove empty banners and large gaps inside course homepages. Character themes hide the native SNHU homepage photo; regular palettes, animated scenes, Prism and Liquid retain it.
- Cleaner assignment submission panels and form rows, readable section titles and mobile labels, plus themed Add a File dialog shells without white padding.
- Keep animated backgrounds outside embedded dialogs and reading areas.
- Preserve native links, notification indicators, form contents, course/profile images, reduced-motion settings and clean-copy behavior.

Earlier 1.7.x sections below record local development iterations; only v1.7.8 is published.

## 1.7.7 - Local test build, not published

- Center the native home-link host through the full navigation row height, rather than only centering the glyph inside its shorter anchor. Apply this correction to every themed appearance.
- Reduce the Genshin Paimon artwork to 28px inside its existing 32px glyph slot and 44px link target. Preserve navigation, labels and other icons.
- Reproduce the native inline-block host in the preview and verify home-link vertical centering across all 22 themed modes. No push or publication.

## 1.7.6 - Local test build, not published

- Enlarge navigation glyphs to matching 32px slots in every themed appearance, retaining 44px controls and native actions/labels. Account for padding in the Genshin mail/chat/notices artwork for consistent visible size.
- Blend Genshin, Titan, Sugarbunnies and Totoro welcome photos into their palette using a masked image layer; retain title contrast, character-specific positioning and pointer transparency. Transparent character illustrations retain their existing composition.
- Style the native assignment submission layout with aligned instruction/form panels and readable compact titles. Exclude legacy d_FG form tables from zebra striping; preserve content, comments and controls. Keep the submission section title readable over artwork and mobile field labels on one line.
- Theme the observed legacy ddial_o2 Add a File shell, footer/buttons and frame backing. Stop animated scene backgrounds from leaking into embedded dialogs/readings.
- Verify all 22 themed modes for icon containment, form geometry, non-striped fields, retained drafts/markup, matching dialog/frame surfaces and Original cleanup; render native-shaped fictional dialogs and mobile submissions. No uploads, submissions, new permissions, push or publication.

## 1.7.5 - Local test build, not published

- Add illustrated Hello Kitty/Kuromi welcome cards on My Home; prevent overlapping duplicate character art.
- Hide the native SNHU Homepage Header Image only in the eight character themes. Restore it in all regular palettes, animated scenes, Prism and Liquid modes, plus Original/Off.
- Remove decorative banners and excess spacing from native course-home headers across all 22 themes. Preserve the offscreen course h1 for assistive technology. Visible course headings remain compact.
- Give Miffy bold ink outlines, rounded cards, solid shadows and yellow/orange/green panel accents.
- Titan headings try installed Ditty/Cloister Black and otherwise use locally bundled OFL Pirata One; the linked forum offers suggestions, not a confirmed original font. Body text remains readable.
- Replace Genshin native navigation glyphs with original game Paimon/home, mail, chat and notices artwork. Preserve links, dropdown buttons, labels and native unread indicators; other themes restore their native icons.
- Add regressions for zero-height offscreen course headers in every theme, image-banner switching, welcome art, nested game glyphs, clickable openers and icon restoration. Package fonts/artwork locally with unchanged permissions. No push or release.

## 1.7.4 - Local test build, not published

- Remove Spider-Man and Cyberpunk theme choices/palettes/assets. Saved selections fall back to Dark. Remove only the Genshin five-character strip; retain page backgrounds, Primogems and Paimon.
- Hide the specific native Homepage Header Image widget in themed modes; restore it with Original/Off. Course artwork, profile photos, announcements and other widgets remain intact.
- Rework welcome headings with shorter vertically centered layouts, balanced name wrapping and theme-matched fonts. Genshin prefers an installed HYWenHei font, otherwise uses bundled Marcellus; cute themes use Nunito and Totoro/Titan use Bitter. All bundled fonts include OFL licenses and load locally.
- Redesign the popup with an always-visible two-column, eight-character grid above everyday appearances. Additional palettes/designs remain under More themes. Maintain radio keyboard/focus behavior, copy helper and update notices.
- Verify banner restoration, strip removal, removed-selection fallback, compact welcome geometry, real extension font loading, two-column grid, desktop/mobile and existing lifecycle/copy regressions. No push or release.

## 1.7.3 - Local test build, not published

- Restrict large character-world banners to Brightspace's native homepage heading. Tool pages use compact readable title strips and native action layout, preventing the floating Help layout caused by excessive banner padding.
- Genshin Home banner now uses different artwork from the page background. Assignments/Content use Fontaine art, Discussions/Calendar/course pages use Archon art, Grades use Furina and Classlist uses Nahida. Categories are local presentation attributes only; no URLs are stored or transmitted.
- Fix missing gallery/Paimon placement against read-only observed real Brightspace markup: d2l-my-courses-v2 and the Calendar widget's calendar link. Existing preview-only selectors were insufficient.
- Add a repeating white rabbit-face fan pattern on blue for Miffy, with a solid Home heading backing for text readability.
- Regression tests reproduce native widget selectors, compact Assignments/Help containment, page background changes, route cleanup, desktop/mobile and installed MV3 behavior. No push or release.

## 1.7.2 - Local test build, not published

- Rebuild Genshin Impact using the matching Moonlight Amidst Dreams festival background, violet panels, sakura-pink accents and pale-blue links. Remove the old landscape/party art.
- Add a separate gallery of five-star characters: Furina, Raiden Shogun, Nahida, Kaedehara Kazuha and Hu Tao. Replace course-card picture stickers with local Primogem icons.
- Place original Paimon artwork below recognized calendar widgets/month views, with reserved space and no pointer interception. No calendar data or tasks are added.
- Retain unchanged site permissions; all decorative assets are bundled locally. Source and attribution records updated.
- Test contrast, character themes across desktop/mobile page families, copying/reading panels in all 24 appearances and installed MV3 artwork/lifecycle/preferences. Live Brightspace/Opera testing remains pending. Nothing pushed or released.

## 1.7.1 - Local test build, not published

- Replace Edgerunners background with the Earthrise image matching the user reference; match slate/teal/lunar gold colors and remove all small Lucy thumbnails and separate character cutouts.
- Rebuild Spider-Man using Spider-Verse comic covers featuring multiple variants, cream comic paper, halftone dots, ink borders, caption panels and hard offset shadows. Remove game screenshots and web background.
- Add Miffy: official family illustration, simple primary-color blocks, uncluttered picture-book panels. Add My Neighbor Totoro: official film stills, forest greens, warm nostalgic paper and a separate night-flight vignette.
- Preserve course artwork and supported native page controls. All assets remain local, with unchanged permissions.
- All ten character worlds checked on desktop/mobile fixtures; all 24 copy/reading cases and real MV3 artwork/theme/lifecycle checks covered. Live Brightspace/Opera testing remains pending. No push or publication.

## 1.7.0 - Local test build, not published

- Add six independent themes: Spider-Man, Cyberpunk: Edgerunners, My Melody, Sugarbunnies, Attack on Titan and Genshin Impact under More themes > Character worlds.
- Give each world its own typography, palette, panel geometry, patterns and image composition, including Lucy/David with an illustrated moon, Titan wall and Scout art, and Genshin landscape/party art.
- Bundle publisher/official images locally with source records; no new permissions, no remote runtime artwork and no source media recoloring.
- Extend Chrome desktop/mobile, reading/copy, late-root and actual MV3 selection/artwork regressions to the new appearances. Authenticated-site/Opera testing remains pending.
- Local ZIP for user testing only. No Git push or release publication.

## 1.6.0 - 2026-10-22

- Add separate Hello Kitty and Kuromi themes under More themes > Character worlds. Pink/cream bows and midnight/lilac stars each have locally bundled character background art, heading accents and card stickers.
- Adapt supported dashboard, course, discussion, reading, assignment, feedback, grade, classlist, calendar, menu and settings surfaces. Preserve course/profile images and native actions, with mobile layouts, keyboard focus and reduced-motion support.
- Package two local PNG assets restricted to the existing supported site/widget origins; no new permissions or runtime remote image requests. Record Sanrio artwork sources locally.
- Verify contrast, desktop/mobile page fixtures, late-loading roots, real MV3 theme selection and packaged artwork loading. Includes earlier unpublished popup/copy improvements; Word/Opera confirmation remains pending.
- Release includes the installable extension ZIP and character-theme previews.

## 1.5.5 — Local test build, not published

- Give the popup a fixed 440 by 600 intrinsic size instead of a viewport-dependent width, with roomier header, two-column primary themes, and scrolling for extra themes.
- Add Copy selection cleanly: a focused popup requests the explicitly selected text from the active Brightspace tab/frame and writes a fresh normal HTML/plain clipboard item directly, bypassing page/native copy serializers. Text is transient, never saved or transmitted externally. No new permissions.
- Add shadow-selection handling and a visible local Copy helper diagnostic containing only status, version and timestamp. No copied text or source URL is retained.
- Installed Chrome tests verify direct clipboard write and actual paste into an already-dark receiving editor; page tabs/frames, preferences, update worker and existing copy tests pass. Popup screenshot reviewed. Final Word testing remains pending; not published.


## 1.5.4 — Local test build, not published

- Supply explicit black text and white shading on each rich-paste run, rather than relying only on a wrapper or destination-inherited plain text. A faithful plain-text alternative is also supplied.
- Protect Ctrl+C/Command+C before later editor key handlers while allowing the native copy action. Normalize selected text in input/textarea controls too, excluding passwords.
- Tests paste into a destination already using pale text and a dark background, and simulate a later keyboard serializer that prevents native copying. Browser and actual MV3 keyboard copy/paste checks pass, alongside all-theme and embedded-reading cases. Word validation remains pending.
- No push or publication; awaiting user testing.


## 1.5.3 — Local test build, not published

- Replace rich HTML copy with plain text only. Source colors, highlights, font overrides and emphasis cannot be carried in clipboard HTML because no HTML is supplied.
- Handle Copy in window capture phase, then stop later copy serializers from overwriting the normalized selection. No page mutation or new permissions.
- Tested all fourteen themes and Original, embedded readings, a conflicting page copy handler and Off restoration. Trusted keyboard Ctrl+C/Ctrl+V into a separate unthemed rich editor produced black, unhighlighted text; repeated in the actual MV3 extension.
- Word was not directly automated. Destination paragraph styles still govern plain-text paste. Awaiting user validation; do not publish.


## 1.5.2 — 2026-10-22

- Copy selected text into documents without carrying theme foreground/background colors or font overrides. Clean rich HTML uses neutral black ink and inherited font family, retaining semantic headings, lists, emphasis, tables and safe links; plain text stays faithful to the selection.
- Works in all appearances, including Original while enabled, and matching embedded readings. Off restores native copy. Native input/textarea, image-only copy, Cut and copy already handled by a page remain unchanged.
- Selected text is processed only during Copy, locally and transiently. No existing clipboard reads, storage, network calls or clipboard permissions.
- Browser regression checks cover all fourteen themes and Original, formatting/plain-text fidelity, unchanged source, embedded readings and Off cleanup. Installed-extension regression checks passed.


## 1.5.1 — 2026-10-22

- Restore original navigation logo colors instead of flattening the shield to white; a light backing keeps dark lettering readable.
- Stop styling the slotted profile opener as a dropdown menu panel, removing nested borders and padding while retaining keyboard focus.
- Remove extra native borders on navigation dropdown controls.
- Theme the observed embedded SNHU module template's intersect-content panel across every appearance, preserving banner artwork and reading layout.
- Read-only inspection identified the real template/profile classes. All fourteen themed reading-panel cases and existing browser/Liquid Glass checks passed; no new permissions.


## 1.5.0 — 2026-10-22

- Added **Liquid Glass** under More themes, with Default, Transparent and Dark appearances. Frosted panels, inset highlights, rounded cards, animated backgrounds and gentle jelly hover motion use local CSS only.
- Applied the design to supported dashboard, course, discussion, announcement, assignment, feedback, grade, classlist, calendar, menu and settings surfaces. Reading areas stay still; reduced-motion and reduced-transparency preferences are respected, with opaque fallbacks where blur is unavailable.
- Polished navigation for Prism and Liquid Glass: centered 44px pill controls, consistent 22px header icons, cleaner hover states and subtle dividers. Dark designs use a clean white navigation logo silhouette instead of the old contour. Photos remain unfiltered.
- Added automatic public GitHub release checks every six hours, cached startup/popup checks, **Check now**, a red toolbar badge/dot, and a popup notice with the new version. Numeric stable-version comparison ignores drafts/prereleases; offline checks retain known updates. ZIP installation still requires replacing files and reloading.
- Added an event-driven update worker, `alarms` permission and access to `api.github.com` solely for the fixed public latest-release endpoint. Requests omit credentials/referrer, reject redirects, and never include Brightspace content. No remote code or remote-provided link is executed.
- Includes the previously local Prism redesign, late-loading white-card lifecycle/rerender fixes, and transparent page-title wrappers from 1.4.x.
- Passed static/preferences/contrast checks, updater unit checks, existing Chrome regressions, all Liquid Glass modes across fictional page families, and actual MV3 storage/widget/restart tests with fourteen cold navigations. Real worker/popup update badges were tested with simulated release metadata. Installed authenticated Brightspace and Opera still need confirmation.

## 1.4.3 — Included in 1.5.0

- Fixed Prism header icons and the profile control sitting at the top of the navigation row. Their containers retain Brightspace's native full height while the visible buttons remain compact and centered.
- Removed the opaque rectangle behind the welcome/page heading by making only the page-title layout wrappers transparent. Course panels, menus, and form surfaces keep their backgrounds.
- Matched the local regression fixture to the authenticated dashboard's notification wrappers, full-height component hosts, and nested title boxes, inspected read-only.
- Verified centered, unclipped, clickable controls and transparent title wrappers at desktop and narrow widths, plus Original restoration. Existing browser and actual-extension regression suites passed, including late-loading cards, submissions, tables, profile images, preferences and widget scope.
- No new permissions or network calls. This is a local build; installed Chrome/Opera appearance on Brightspace still needs confirmation.

## 1.4.2 — Included in 1.5.0

- Fixed a reproducible white-card startup race: components that attach open shadow roots after the old startup checks now notify the theme immediately. No polling or extra full-document scans.
- Repair the extension's own style when a Brightspace template rerender removes it, using the existing observer only on the affected root.
- Added a small bundled MAIN-world lifecycle helper within the existing approved website scope. It passes no course data or preferences and disables/restores its native-method wrapper when appearance is off or Original is selected.
- Fixed stretched Prism header icon/profile backgrounds: controls stay compact with transparent normal-state backgrounds.
- Passed eleven fresh-navigation cases across every theme in the actual MV3 extension, including six delayed nested roots and rerenders, plus the existing browser/preference/scope tests.

## 1.4.1 — Included in 1.5.0

- Rebuilt the local redesign as **Prism glass**: blue and violet ambient glow, translucent panels, frosted navigation, inset course artwork, softly rounded tiles and a clear selected-navigation state.
- Course tiles lift as one piece on hover. Scroll motion keeps text fully opaque; discussion reading surfaces remain stationary. Reduced-motion preferences disable the movement.
- Removed nested panel shadows and restricted table geometry changes to data tables so layout/authored tables keep their existing structure.
- Restyled existing calendar, discussion, announcement, notification, grade, assignment and classlist surfaces while preserving Brightspace's links, forms and actions.
- Added a fictional dashboard/course/calendar preview, desktop and 390px screenshots, and passing browser/installed-extension regression checks. No new permissions, data access, external assets or background service.
- The theme changes existing page presentation; it does not add calendar/reminder functionality or replace Brightspace's underlying notification behavior.

## 1.3.0 — 2026-10-21

- Added Ocean, Forest, Rose, Midnight City, Sunset City and Aurora themes behind an accessible “More themes” disclosure.
- Added a custom palette picker for page, panel, raised-control, text and link colors. The popup checks text/link contrast before saving; custom colors sync across open tabs and supported frames.
- Added CSS-only, low-motion animated sky and skyline backgrounds for the three scene themes. They remain behind course content, add no image filters, and stop when reduced motion is requested.
- Updated the local preview and checks for added palettes, custom preference persistence, scene rendering and reduced-motion behavior.
- No new permissions, external assets/services, background process or course-data access.

## 1.2.5 — 2026-10-21

- Fixed white dashboard course cards by targeting the actual nested `d2l-my-courses-enrollment-card` and `d2l-card` shadow surfaces and slotted titles.
- Expanded the local dashboard fixture to reproduce Brightspace's nested course-card component path, with Dark, Dim, Warm and Original regression checks.
- No new permissions, network calls, course-data access or background process.

## 1.2.4 — 2026-10-21

- Apply the default appearance at document start while browser-local preferences load, then switch immediately to the saved appearance. This avoids an unthemed flash on first navigation.
- No new permissions, network calls, course-data access or background process.

## 1.2.3 — 2026-10-21

- Added the user-supplied blue gradient logo to the browser toolbar, extension manager and popup, with local PNG sizes 16/32/48/128.
- Added explicit visibility, non-shrinking size and stacking protection for discussion profile controls and profile images. A light image canvas keeps transparent default silhouettes readable.
- Added 36px reply-photo and default-icon fixtures plus a defensive collapsed/covered-image regression for all themed appearances, with Original restoration. The exact live disappearance cause remains unconfirmed.
- Preserved original logo source in `assets/`; `tools/build-icons.ps1` reproduces the square PNG assets without changing the source. No new website permissions or background work.

## 1.2.2 — 2026-10-21

- Excluded Brightspace's legacy profile image controls from filled-button styling; control backgrounds stay transparent.
- Removed the added white navigation logo plate. Dark and Dim use a small logo-only contour for lettering; Warm and Original use the unfiltered logo.
- Added fictional photo regression coverage for discussion handles, profile cards, Classlist, shared open-shadow profile components and dynamically added profiles. Photos stay unfiltered in every appearance.
- No added permissions, network calls, course-data access or background process.

## 1.2.1 — 2026-10-21

- Fixed white assignment submission panels, uploaded-file lists, feedback panels and discussion attachment drop zones.
- Fixed uneven table colors in Grades, Assignments and Classlist: row headings now match adjacent cells instead of being styled as column headings.
- Nested feedback and open-shadow HTML components inherit their table row's surface, removing contrasting rectangles behind text.
- Added a fictional submission/table preview and regression checks for Dark, Dim, Warm and Original. Status colors, images and videos remain preserved; no new permissions or background work.

## 1.2.0 — 2026-10-21

First GitHub release of Brightspace After Hours.

- Dark, Dim, Warm / sepia, and Original appearances for SNHU Brightspace.
- Theme picker, on/off switch, browser-local preferences and cross-tab updates.
- Targeted styles for menus, discussion rows, forms, tables, course cards and supported embedded widgets.
- Keyboard focus styles and support for discoverable open shadow roots.
- New **Check for updates** link and installed-version display in the popup. The link opens the latest release; unpacked updates are installed manually.
- Compact popup layout, simple installation/privacy documentation, fictional theme screenshots, and a reproducible sharing ZIP.
- No added website permissions, network APIs or background process for the update link.

Earlier local builds: 1.0.0–1.1.1. They are retained locally; this repository's first published release is 1.2.0.
