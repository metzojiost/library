/* Drone exam (A1/A3) tool — guide, cheat sheet, and interactive practice quiz.
   Expects GUIDE_HTML, CHEATSHEET_HTML, DRONE_QUESTIONS (and optionally DRONE_VARIANTS)
   to be defined by earlier <script> includes. */

(function () {
  "use strict";

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function renderGuideTab(container) {
    container.innerHTML = "";
    var panel = el("div", "drone-static-panel", GUIDE_HTML);
    container.appendChild(panel);
  }

  function renderCheatsheetTab(container) {
    container.innerHTML = "";
    var panel = el("div", "drone-static-panel", CHEATSHEET_HTML);
    container.appendChild(panel);
  }

  function flattenQuestions(dataset, sectionNum) {
    var out = [];
    dataset.forEach(function (sec) {
      if (sectionNum !== null && sec.section_num !== sectionNum) return;
      sec.questions.forEach(function (q) {
        out.push({
          section_num: sec.section_num,
          section_title: sec.section_title,
          question: q.question,
          options: q.options,
          correct_index: q.correct_index,
          explanation: q.explanation,
          confidence: q.confidence || "high"
        });
      });
    });
    return out;
  }

  function renderQuizTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "drone-quiz-setup");
    wrap.appendChild(el("p", "jp-tab-intro",
      "Choose a section (or all of them), and whether to practice with the real scraped questions or the freshly-generated variants — mixing both is the best test of whether you actually know the rule, not just the phrasing."));

    var sourceRow = el("div", "jp-controls");
    var sourceState = { mode: "original" };
    var origBtn = el("button", "jp-btn jp-btn-accent", "Original questions (247)");
    var variantBtn = el("button", "jp-btn", typeof DRONE_VARIANTS !== "undefined" ? "Variant questions" : "Variant questions (loading…)");
    sourceRow.appendChild(origBtn);
    sourceRow.appendChild(variantBtn);
    wrap.appendChild(sourceRow);
    origBtn.addEventListener("click", function () {
      sourceState.mode = "original";
      origBtn.className = "jp-btn jp-btn-accent";
      variantBtn.className = "jp-btn";
    });
    variantBtn.addEventListener("click", function () {
      if (typeof DRONE_VARIANTS === "undefined") return;
      sourceState.mode = "variant";
      variantBtn.className = "jp-btn jp-btn-accent";
      origBtn.className = "jp-btn";
    });

    var picker = el("div", "drone-section-picker");
    var sections = DRONE_QUESTIONS.map(function (s) { return { num: s.section_num, title: s.section_title }; });
    var selectedSection = null;
    var allBtn = el("button", "drone-section-btn is-active", "All sections");
    allBtn.addEventListener("click", function () {
      selectedSection = null;
      Array.prototype.forEach.call(picker.children, function (b) { b.classList.remove("is-active"); });
      allBtn.classList.add("is-active");
    });
    picker.appendChild(allBtn);
    sections.forEach(function (s) {
      var btn = el("button", "drone-section-btn", s.num + ". " + s.title);
      btn.addEventListener("click", function () {
        selectedSection = s.num;
        Array.prototype.forEach.call(picker.children, function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
      picker.appendChild(btn);
    });
    wrap.appendChild(picker);

    var startBtn = el("button", "jp-btn jp-btn-accent", "Start quiz");
    startBtn.addEventListener("click", function () {
      var dataset = sourceState.mode === "variant" && typeof DRONE_VARIANTS !== "undefined" ? DRONE_VARIANTS : DRONE_QUESTIONS;
      var pool = flattenQuestions(dataset, selectedSection);
      if (pool.length === 0) return;
      runQuiz(container, shuffle(pool), sourceState.mode === "variant");
    });
    wrap.appendChild(startBtn);

    container.appendChild(wrap);
  }

  function runQuiz(container, pool, isVariant) {
    var idx = 0;
    var correctCount = 0;
    var total = pool.length;

    function next() {
      if (idx >= total) {
        container.innerHTML = "";
        var resWrap = el("div", "drone-quiz-result");
        var pct = Math.round((correctCount / total) * 100);
        resWrap.appendChild(el("div", "drone-quiz-result-score", correctCount + " / " + total + " (" + pct + "%)"));
        resWrap.appendChild(el("p", "drone-quiz-result-msg",
          pct >= 90 ? "Very solid." : pct >= 70 ? "Good — worth another pass on what you missed." : "Worth reviewing the guide again before another attempt."));
        var backBtn = el("button", "jp-btn jp-btn-accent", "Back to setup");
        backBtn.addEventListener("click", function () { renderQuizTab(container); });
        resWrap.appendChild(backBtn);
        container.appendChild(resWrap);
        return;
      }
      var q = pool[idx];
      container.innerHTML = "";
      var wrap = el("div", "drone-quiz-wrap");
      wrap.appendChild(el("div", "drone-quiz-progress", (idx + 1) + " / " + total + " — Section " + q.section_num + ": " + q.section_title));
      wrap.appendChild(el("span", "drone-quiz-tag" + (isVariant ? " is-variant" : ""), isVariant ? "AI-generated variant" : "from real question bank"));
      wrap.appendChild(el("p", "drone-quiz-question", q.question));
      var optWrap = el("div", "drone-quiz-options");
      var explainBox = el("div", "drone-quiz-explain hidden" + (q.confidence === "low" ? " is-low-confidence" : ""));
      q.options.forEach(function (opt, i) {
        var btn = el("button", "drone-quiz-option", opt);
        btn.addEventListener("click", function () {
          var isCorrect = i === q.correct_index;
          if (isCorrect) correctCount++;
          Array.prototype.forEach.call(optWrap.children, function (b, bi) {
            if (bi === q.correct_index) b.classList.add("is-correct");
            else if (b === btn && !isCorrect) b.classList.add("is-wrong");
            b.disabled = true;
          });
          explainBox.innerHTML = q.explanation +
            (q.confidence === "low" ? '<div class="drone-low-confidence-note">Low-confidence determination — no official answer key exists for this source; worth double-checking this one against your course material.</div>' : "");
          explainBox.classList.remove("hidden");
        });
        optWrap.appendChild(btn);
      });
      wrap.appendChild(optWrap);
      wrap.appendChild(explainBox);
      var nextBtn = el("button", "jp-btn jp-btn-accent drone-quiz-next", idx + 1 < total ? "Next question" : "See results");
      nextBtn.addEventListener("click", function () { idx++; next(); });
      wrap.appendChild(nextBtn);
      container.appendChild(wrap);
    }
    next();
  }

  var TABS = [
    { id: "guide", label: "Guide", render: renderGuideTab },
    { id: "cheatsheet", label: "Cheat Sheet", render: renderCheatsheetTab },
    { id: "quiz", label: "Practice Quiz", render: renderQuizTab }
  ];

  function init() {
    var tabBar = document.getElementById("droneTabBar");
    var content = document.getElementById("droneContent");
    TABS.forEach(function (tab, i) {
      var btn = el("button", "jp-tab-btn" + (i === 0 ? " is-active" : ""), tab.label);
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(tabBar.children, function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        tab.render(content);
      });
      tabBar.appendChild(btn);
    });
    TABS[0].render(content);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
