import { RemixBrowser } from "@remix-run/react";
import { startTransition } from "react";
import { hydrateRoot } from "react-dom/client";

startTransition(() => {
  hydrateRoot(document, <RemixBrowser />);
});

// if (document.readyState === "complete") {
//   console.log("Document already loaded");
//   // Jalankan kode langsung
//   registerServiceWorker();
// } else {
//   window.addEventListener("load", () => {
//     console.log("Window loaded");
//     registerServiceWorker();
//   });
// }
//
// function registerServiceWorker() {
//   if ("serviceWorker" in navigator) {
//     // Use the window load event to keep the page load performant
//     navigator.serviceWorker.register("/sw.js");
//   }
// }
