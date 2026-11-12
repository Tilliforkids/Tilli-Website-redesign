/* Demo boot — runs last. The dashboard is already mounted underneath.
   On top: the landing page; "Enter the dashboard" opens the "Continue as"
   pop-up over it (dark overlay); "Continue as" reveals the dashboard. */
(function () {
  'use strict';
  // After a refresh in the same tab, go straight back to where you were; otherwise show the landing page.
  if (window.DemoUI && !window.DemoUI.restore()) window.DemoUI.landing();
})();
