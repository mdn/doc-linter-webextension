document.addEventListener("DOMContentLoaded", event => {
  let elements = document.querySelectorAll("[data-i18n]");
  [].forEach.call(elements, element => {
    element.textContent = chrome.i18n.getMessage(element.dataset.i18n);
  });
});
