// ==UserScript==
// @name         better Shtab
// @namespace    http://tampermonkey.net/
// @version      2024-12-18
// @description  Make shtab.app board look a bit better
// @author       github.com/side2k
// @match        https://my.shtab.app/*
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shtab.app
// @grant        GM_addStyle
// ==/UserScript==

const styles = {
  lightCards: `
      .task-group-tile .draggable-item {
        margin-bottom: 0px !important;
      }

      .task-group-tile .draggable-item .card-task-base__wrapper {
        padding: 2px 3px;
      }

      .task-group-tile .draggable-item .interactive-buttons,
      .task-group-tile .draggable-item .card-task-base__top-line,
      .task-group-tile .draggable-item .card-task-base__multi-executors,
      .task-group-tile .draggable-item .card-task-base__materials,
      .task-group-tile .draggable-item .task-name__wrapper>button,
      .task-group-tile .draggable-item .card-task-base__cover
      {
        display: none !important;
      }

      .task-group-tile .draggable-item .card-task-base__wrapper {
        font-size: 10px;
      }

    `,
  commentsWithMRLinks: `
      .task-comments-list .comment.has-gitlab-link .comment__wrapper-content {
        background-color: pink;
      }
    `,
};

function getBetterTimerInputEvent(timerForm) {
  const [startInput, endInput] = timerForm.querySelectorAll(
    ".select-time__inputs input"
  );
  const convertTime = (rawTime) => {
    const timeMatch = rawTime.match(/(?<hours>\d{2})(?<minutes>\d{2})/);
    if (!timeMatch) return;
    return `${timeMatch.groups.hours}:${timeMatch.groups.minutes}`;
  };
  const eventHandler = (event) => {
    const inputText = event.target.value;
    let timeMatch = inputText.match(/(?<start>\d{4})(?<end>\d{4})/);
    if (!timeMatch) {
      return;
    }
    startInput.value = convertTime(timeMatch.groups.start);
    endInput.value = convertTime(timeMatch.groups.end);

    startInput.dispatchEvent(new Event("input"));
    endInput.dispatchEvent(new Event("input"));
  };
  return eventHandler;
}

function betterTimer() {
  const className = "better-timer-form";
  document.querySelectorAll(".add-task-time").forEach((timerForm) => {
    if (timerForm.classList.contains(className)) {
      return;
    }
    timerForm.classList.add(className);
    const labels = timerForm.querySelector(".select-time__labels");
    if (!labels) {
      return;
    }
    const betterInput = document.createElement("input");
    betterInput.classList.add("better-timer-button");
    betterInput.addEventListener("input", getBetterTimerInputEvent(timerForm));
    labels.insertAdjacentElement("afterEnd", betterInput);
  });
}

function betterTimeline() {
  const className = "better-timer-form";
  document.querySelectorAll(".tabs+.timeline").forEach((timeline) => {
    if (timeline.classList.contains(className)) {
      return;
    }
    timeline.classList.add(className);

    const addManyBtn = document.createElement("button");
    addManyBtn.classList.add(
      "button",
      "button_padding_xs",
      "button_type_secondary",
      "button_sibling_none",
      "button_border_secondary",
      "button_radius_xxs",
      "timeline-graph__button"
    );
    addManyBtn.innerHTML = `
          <div class="svg-icon-wrapper svg-icon-wrapper_sm timeline-graph__cross"">
            <div class="icon-with-indicator">
              <svg viewBox="0 0 12 12" class="svg-icon svg-icon-plugin" style="width: 12px; height: 12px;">
                <path pid="0" d="M11 1 1 11M1 1l10 10" _stroke="#888CA0" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
                </path>
              </svg>
            </div>
          </div>
        `;

    addManyBtn.addEventListener("click", (event) =>
      console.log("not implemented yet 8(")
    );

    const buttons = timeline.querySelector(".timeline-graph__buttons");
    buttons.prepend(addManyBtn);
  });
}

function processComment(comment) {
  const linkClassName = "has-gitlab-link";
  if (comment.classList.contains(linkClassName)) {
    return;
  }
  const commentText = comment.querySelector(".comment__content").textContent;
  const searchPattern = /gitlab.otus.team/;
  if (commentText.search(searchPattern) >= 0) {
    comment.classList.add("has-gitlab-link");
  }
}

function happyNewYear() {
  const now = new Date();
  if (now.getMonth() != 11) return;
  const currentYear = now.getFullYear();
  const deadline = new Date(`${currentYear}-01-01`);
  const delta = new Date(deadline - now);

  document.querySelectorAll(".desktop-view-header").forEach((header) => {
    if (header.dataset.bs_processed) return;
    header.dataset.bs_processed = true;
    const greeting = document.createElement("div");
    greeting.innerHTML = `До Нового Года: ${delta.getDate()} дней!`;
    header.prepend(greeting);
  });
}

function onDOMChange() {
  betterTimer();
  betterTimeline();
  document
    .querySelectorAll(".task-comments-list .comment")
    .forEach((comment) => {
      processComment(comment);
    });
  happyNewYear();
}

(function () {
  "use strict";
  console.log("loading custom CSS");
  GM_addStyle(styles.lightCards);
  GM_addStyle(styles.commentsWithMRLinks);
  GM_addStyle(styles.boardAsList);

  const observerInterval = setInterval(() => {
    const app = document.querySelector(".app");
    if (!app) {
      return;
    }
    clearInterval(observerInterval);
    console.log("Observing:", app);
    const observer = new MutationObserver((event) => {
      onDOMChange();
    });
    observer.observe(app, { subtree: true, childList: true });
  }, 1000);
})();
