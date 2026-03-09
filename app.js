"use strict";

document.addEventListener("DOMContentLoaded", function onReady() {
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
});
