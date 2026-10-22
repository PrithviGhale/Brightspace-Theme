# Page and menu styling audit

### Liquid Glass, navigation and updates (1.5.0)

Default, Transparent and Dark use the same audited legacy/open-shadow selectors across supported page families. Each mode passed local dashboard/course/calendar, discussion, submission, feedback, drop-zone, data-table, menu/settings/progress and photo fixtures. Desktop/narrow layouts, focus, reduced motion, stationary reading surfaces and Original cleanup were checked. Navigation now has pill hover targets, native-height centering, consistent icon sizing and dark-theme white branding. Existing Prism and older-palette regression suites passed. Real extension tests cover three-mode tab/widget synchronization and fourteen fresh navigations with delayed components. Update notices are separate from course notifications: a worker checks only a fixed public GitHub endpoint and controls the extension's own popup/badge. Simulated release metadata verifies available/current states. This is fictional Chrome coverage, not a claim of perfect compatibility with every authenticated course, external viewer or Opera version.

### Header position and title backplate (1.4.3)

Read-only inspection of the authenticated dashboard confirmed native full-height navigation hosts inside fixed-height notification/profile wrappers. Prism's `height:auto` shrank the hosts and moved the controls to the row's top; retaining `height:100%` centers compact 44px buttons. The welcome title's nested `.d2l-box` / `.d2l-box-layout` wrappers inherited solid panel fills. Scoped transparency within `.d2l-page-header` removes that rectangle without clearing other course panels. A local fixture matching those structures reproduced both failures before correction and passed desktop/narrow geometry, hit-target, title transparency and Original restoration checks afterward. Existing theme and actual-MV3 suites passed. Only structural selectors/styles informed the fixture; no private course content was saved. Final installed appearance on Brightspace/Opera remains a manual check.

### White cards on first visit (1.4.2)

The old bounded startup checks miss a root attached to an existing host after those checks finish: attaching a shadow root does not emit a light-DOM child mutation. A six-level delayed fixture reproduced this without refresh. A bundled MAIN-world helper now emits host-only lifecycle notifications for new open roots, while isolated scripts inspect/style just those roots. A root observer also restores the owned style after template replacement. Eleven cold navigations across every theme passed with the actual extension and no refresh. Compact 44px header controls were verified against an 88px native-height fixture. The installed fix still needs confirmation on the user's authenticated Brightspace/Opera session.

### Prism glass redesign (1.4.1 local build)

Added a selectable CSS-only redesign using the existing audited Brightspace surface and component selectors. It rounds dashboard cards, nav/menu controls, discussion rows, assignment/grade panels, and supported calendar/notification surfaces, with CSS hover lift and scroll-entry motion where Chromium supports scroll-driven animations. `prefers-reduced-motion` disables the added motion. Images and video are not filtered. The redesign preserves Brightspace's existing navigation and actions; calendar/reminder behavior is unchanged. This pass has not been checked against authenticated Brightspace pages, and generated content in closed shadow roots or embedded PDF/Office viewers can remain unchanged.

### Nested dashboard course cards (1.2.5)

Read-only inspection found dashboard cards nested through `d2l-my-courses-v2`, `d2l-my-courses-container-v2`, `d2l-my-courses-content-v2`, `d2l-my-courses-card-grid-v2`, `d2l-my-courses-enrollment-card`, and an inner `d2l-card`. Added scoped surface/text rules at the enrollment and card shadow boundaries plus a fictional local fixture for the same nesting. This identifies and targets the real components; live behavior still needs confirmation after installing the build in Chrome and Opera.

### First-navigation theme timing (1.2.4)

The content script now applies the default Dark appearance at `document_start` before reading browser-local preferences. The saved theme is applied when that read completes. This targets the unthemed flash on first navigation; it is not a claim that every authenticated page has been visually verified.

October 21, 2026. Authenticated originals were inspected through read-only browser DOM access. The installable theme was verified on fictional local structures and in isolated Chrome extension tests. These are separate kinds of evidence; this is not a claim that the new build has been installed and visually checked on every live page.

| Page or control | Inspection and changes |
| --- | --- |
| Dashboard/course home | Card hosts, navigation triggers, same-domain HTML frames and the approved embedded widget families inspected in prior pass; regression checks retained. |
| Course Menu | Actual `d2l-menu-item-link` hosts and internal link/text structure inspected; paired foreground/background and hover styles; focus ring inset so menu clipping does not hide it. |
| Announcements / Learning Modules / Discussions / Assignments / Grades | Page/container/table/content structures inspected in prior pass; discussion rows and frame backgrounds fixed; shared menu, form, table and palette regression checks retained. No assignment submitted. |
| Calendar | Agenda/Day shell, sidebar, view filters, editable placeholders and loading surfaces inspected. Fixed sidebar/filter/placeholder/loading colors. Week/Month/List navigation was attempted but not all updates completed in the in-app session; site logs showed a duplicate `D2LFetch` declaration error. Reloaded, restored Agenda and verified its selected state. No events created or edited. |
| Classlist | Page shell and table/form styling sampled without extracting names or records. Shared table/form rules verified locally. |
| ePortfolio | Dashboard/editor panel hierarchy inspected. Fixed the gray editor panel through its stable box/textarea structure, without using generated class hashes. No item created or edited. |
| My Class Progress | Summary panel structure and backgrounds inspected, without extracting grade/progress values. Fixed nested list content surfaces. |
| MyCourseEvals | Not present in the connected Tools menus checked across two courses. Not opened or verified; external evaluation hosts remain outside the existing permission scope. |
| Profile | Form/control structure inspected without reading or modifying personal field values. |
| Notifications | Selects, form controls and button styles inspected. No subscriptions or preferences changed. |
| Account Settings | Default page and Discussions/Email tabs opened for structural checks only. Fixed selected tabs, legacy panels, editor toolbar and floating footer. No setting changed or Save button clicked. |
| Quizzes | No quizzes opened during this pass. The prior pass inspected a quiz listing only. No attempt started or submitted. |

The in-app browser was returned to the dashboard. No credentials, private screenshots, course content, classmate records or actual field/grade values were saved in the project. No messages, assignments, discussions, quizzes, calendar events or account-setting changes were submitted.

## Theme verification

### Small reply avatars follow-up (1.2.3)

The user confirmed 1.2.2 still hides photos and supplied the affected 36px `.d2l-imagelink > img` markup. Only structural selectors and dimensions were retained; private image URLs, names and IDs were not copied into artifacts. Read-only inspection of the open original thread confirmed loaded photo/default-image elements. Their live themed disappearance was not reproduced in this browser.

Added scoped visibility/non-shrinking size protection for legacy avatar controls and the profile-image endpoint, plus a local stacking context above post backgrounds. Transparent default-image pixels have a light canvas for contrast. No photo URL is read, rewritten or fetched by extension code. This is defensive protection rather than a confirmed explanation of the original symptom. Local regression tests now include 36px photo/default-icon controls and an explicitly synthetic collision case that collapses and covers an unprotected image. Each themed palette restores visibility and photo hit targets; Original removes protection. Check the installed result on the live thread after updating.

### Profile photos and branding follow-up (1.2.2)

Inspected a discussion thread's original profile controls and Classlist photo structure without saving photos or records. Legacy discussion handles use `.d2l-user-profile-handle-image > .d2l-imagelink[role="button"] > img`; Classlist uses ordinary `.di_i.d2l-badge-userprofile` images. Header profiles can use open-shadow `d2l-profile-image-base`. The logo is an image inside the open-shadow `d2l-labs-navigation-link-image.d2l-navigation-s-logo` component.

Image-link controls are now excluded from general button fills and their control backgrounds stay transparent. Photo sources, loading behavior, dimensions and popup handlers are unchanged. The extension-added logo plate is removed; only navigation logo artwork receives a contour in Dark/Dim. Warm and Original have no contour. No student photo is filtered, copied or replaced.

The fictional `preview/profiles.html` verifies loaded photos with nonzero dimensions, visible/uncovered image hit targets, no photo filters, transparent controls, keyboard focus, open-shadow and added profiles across all appearances. Screenshots `dist/profiles-{dark,dim,warm,original}.png` were reviewed. The original live pages were inspected but the exact missing-photo symptom was not reproduced in that unthemed browser; confirm the result in your installed extension after updating.

### Submission and table follow-up (1.2.1)

Inspected the assignment list, Grades and embedded HTML project submission view read-only. The missing white surfaces use stable `.d2l-panel` and `.d2l-filedrop` / `.d2l-fileinput` classes. Legacy tables use both column-heading and row-heading `th` cells, sometimes inside `tbody`. The old blanket heading background caused mismatched columns; fixed row-level surface inheritance also lets nested HTML components blend with their cells. No upload, editor change or submission occurred.

The fictional `preview/submission-tables.html` reproduces these structures without course data or working upload controls. Its regression failed against the old engine on the white submission panel, then passed after the fix in Dark, Dim and Warm. Checks cover panels, attachment drop zones, mixed row headings/data cells, nested plain/open-shadow HTML blocks, preserved green status color and Original restoration. All three new screenshots were visually reviewed. This is local regression evidence, not a live installation test.

`tests/browser.mjs` checks Dark, Dim and Warm / sepia independently using the actual theme engine: normal and hover menu rows, menu-link colors, visible keyboard focus with an inset ring, selected/unselected settings tabs, Calendar filters/sidebar, ePortfolio/Progress panels, form fields, editor glyphs and floating toolbar backgrounds. Original restores the original white/gray surfaces and removes theme styles. Existing dashboard, course widgets, frame, media-preservation and discovery checks also pass.

`tests/extension.mjs` loads the actual unpacked extension and checks scope restrictions, real local preferences, two-tab and frame synchronization, widget embedding restrictions, off/on removal and full-browser restart persistence. Test pages are local synthetic responses; the integration test does not use the authenticated browser or send requests to SNHU.

Screenshots with fictional data: `dist/menus-dark.png`, `dist/menus-dim.png`, `dist/menus-warm.png`. Broad coverage of each palette does not establish compatibility with every possible Brightspace page, chart, external tool, closed root or customized course template. Install the new ZIP and refresh live pages for the final check.
