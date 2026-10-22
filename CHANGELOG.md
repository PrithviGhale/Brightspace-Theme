# Changelog

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
