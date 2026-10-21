/* Only the two explicitly approved widget origins load this bootstrap. */
(() => {
  'use strict';
  const ancestors = Array.from(location.ancestorOrigins || []);
  // No referrer parsing, frame messages, course data, or cross-origin DOM access.
  globalThis.BrightWidgetAllowed = window.top !== window &&
    ancestors.length > 0 && ancestors.at(-1) === 'https://learn.snhu.edu';
})();
