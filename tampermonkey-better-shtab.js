// ==UserScript==
// @name         better Shtab
// @namespace    http://tampermonkey.net/
// @version      2024-11-05
// @description  Make shtab.app board look a bit better
// @author       github.com/side2k
// @match        https://my.shtab.app/*
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
  boardAsList: `
      body,
      .board
      {
        overflow: visible !important;
      }

      .board {
        display: block !important;
      }

      .board .board__group:first-child {
        height: auto;
        border-right: 0;
      }

      .board .draggable-group {
        display: block;
      }
      .board .draggable-group .task-group-tile {
        width: auto;
      }

      .task-group-tile.task-group-tile_collapsed {
        height: 20px;
        width: 500px !important;
      }
      .task-group-tile.task-group-tile_collapsed .group-header__actions {
        align-items: start;
        justify-items: start;
        display: flex;
      }

      .task-group-tile .task-status-title {
        color: black;
        font-size: 8px;
      }
    `,
};

function boardAsList(board) {
  board
    .querySelectorAll(".task-group-tile_collapsed .group-header")
    .forEach((groupHeader) => {
      let statusBlock = groupHeader.querySelector(".task-status");
      const statusTitle = groupHeader.querySelector(".task-status-title");
      if (statusTitle || !statusBlock) {
        return;
      }

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
  const board = document.querySelector(".board");
  if (!board) {
    return;
  }
  boardAsList(board);
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
