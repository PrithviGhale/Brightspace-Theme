# Changelog

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
