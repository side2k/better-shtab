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


      const status = statusBlock.attributes.title
        ? statusBlock.attributes.title.value
        : "No status";

      groupHeader
        .querySelector("button")
        .insertAdjacentHTML(
          "beforeBegin",
          `<div class="task-status-title">${status}</div>`
        );
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

function onDOMChange() {
  document
    .querySelectorAll(".task-comments-list .comment")
    .forEach((comment) => {
      processComment(comment);
    });
}

(function () {
  "use strict";
  console.log("loading custom CSS");
  GM_addStyle(styles.lightCards);
  GM_addStyle(styles.commentsWithMRLinks);
  GM_addStyle(styles.boardAsList);

  const app = document.querySelector(".app");

  const observer = new MutationObserver((event) => {
    onDOMChange();
  });
  observer.observe(app, { subtree: true, childList: true });
})();
