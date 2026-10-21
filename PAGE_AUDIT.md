# Page and menu styling audit

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
