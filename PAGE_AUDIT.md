# Page and menu styling audit

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

### Submission and table follow-up (1.2.1)

Inspected the assignment list, Grades and embedded HTML project submission view read-only. The missing white surfaces use stable `.d2l-panel` and `.d2l-filedrop` / `.d2l-fileinput` classes. Legacy tables use both column-heading and row-heading `th` cells, sometimes inside `tbody`. The old blanket heading background caused mismatched columns; fixed row-level surface inheritance also lets nested HTML components blend with their cells. No upload, editor change or submission occurred.

The fictional `preview/submission-tables.html` reproduces these structures without course data or working upload controls. Its regression failed against the old engine on the white submission panel, then passed after the fix in Dark, Dim and Warm. Checks cover panels, attachment drop zones, mixed row headings/data cells, nested plain/open-shadow HTML blocks, preserved green status color and Original restoration. All three new screenshots were visually reviewed. This is local regression evidence, not a live installation test.

`tests/browser.mjs` checks Dark, Dim and Warm / sepia independently using the actual theme engine: normal and hover menu rows, menu-link colors, visible keyboard focus with an inset ring, selected/unselected settings tabs, Calendar filters/sidebar, ePortfolio/Progress panels, form fields, editor glyphs and floating toolbar backgrounds. Original restores the original white/gray surfaces and removes theme styles. Existing dashboard, course widgets, frame, media-preservation and discovery checks also pass.

`tests/extension.mjs` loads the actual unpacked extension and checks scope restrictions, real local preferences, two-tab and frame synchronization, widget embedding restrictions, off/on removal and full-browser restart persistence. Test pages are local synthetic responses; the integration test does not use the authenticated browser or send requests to SNHU.

Screenshots with fictional data: `dist/menus-dark.png`, `dist/menus-dim.png`, `dist/menus-warm.png`. Broad coverage of each palette does not establish compatibility with every possible Brightspace page, chart, external tool, closed root or customized course template. Install the new ZIP and refresh live pages for the final check.
