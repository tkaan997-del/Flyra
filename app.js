"use strict";

document.addEventListener("DOMContentLoaded", function onReady() {
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function onWindowLoad() {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(function onRegistered(registration) {
        console.log("Service Worker registered", registration);
      })
      .catch(function onRegistrationError(error) {
        console.log("Service Worker failed", error);
      });
  });
}
