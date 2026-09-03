/* Japanese learning tool — interactive engine.
   Expects HIRAGANA, KATAKANA, VOCAB_SETS, GRAMMAR_LESSONS to be defined by data.js, loaded before this file. */

(function () {
  "use strict";

  var STORAGE_KEY = "jp-tool-progress-v2";
  var DAY = 86400000;
  var BOX_INTERVALS = [0, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];

  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { items: {}, grammarDone: {} };
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function getProgress(id) {
    return state.items[id] || { box: 0, due: 0, seen: 0, correct: 0 };
  }
  function recordAnswer(id, correct) {
    var p = getProgress(id);
    p.seen = (p.seen || 0) + 1;
    if (correct) {
      p.correct = (p.correct || 0) + 1;
      p.box = Math.min((p.box || 0) + 1, 5);
    } else {
      p.box = 0;
    }
    p.due = Date.now() + BOX_INTERVALS[p.box];
    state.items[id] = p;
    saveState();
  }
  function isDue(id) {
    var p = getProgress(id);
    return Date.now() >= (p.due || 0);
  }
  function masteryLabel(box) {
    var labels = ["New", "Learning", "Familiar", "Known", "Strong", "Mastered"];
    return labels[box] || "New";
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) {
    return shuffle(arr).slice(0, n);
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  // ---------------- Kana practice (Hiragana / Katakana share this) ----------------

  function buildKanaSet(list, kind) {
    return list.map(function (item) {
      return { id: "kana:" + kind + ":" + item.char, char: item.char, romaji: item.romaji, row: item.row };
    });
  }

  function renderKanaTab(container, list, kind, label) {
    container.innerHTML = "";
    var wrap = el("div", "jp-kana-wrap");
    container.appendChild(wrap);

    var rows = {};
    list.forEach(function (it) {
      if (!rows[it.row]) rows[it.row] = [];
      rows[it.row].push(it);
    });

    var intro = el("p", "jp-tab-intro",
      "Click a character to flip it and see the reading. Progress per character is tracked automatically — " +
      "characters you get wrong come back sooner, ones you consistently get right come back less often. " +
      "Use “Quiz me” once a row feels familiar.");
    wrap.appendChild(intro);

    var controls = el("div", "jp-controls");
    var quizBtn = el("button", "jp-btn jp-btn-accent", "Quiz me on " + label);
    controls.appendChild(quizBtn);
    wrap.appendChild(controls);

    Object.keys(rows).forEach(function (rowKey) {
      var section = el("div", "jp-kana-row-section");
      section.appendChild(el("h3", "jp-kana-row-title", rowKey.replace(/-/g, " ")));
      var grid = el("div", "jp-kana-grid");
      rows[rowKey].forEach(function (item) {
        var id = "kana:" + kind + ":" + item.char;
        var card = el("div", "jp-kana-card");
        card.dataset.id = id;
        var box = getProgress(id).box || 0;
        card.appendChild(el("div", "jp-kana-char", item.char));
        var back = el("div", "jp-kana-romaji hidden", item.romaji);
        card.appendChild(back);
        card.appendChild(el("div", "jp-kana-mastery mastery-" + box, masteryLabel(box)));
        card.addEventListener("click", function () {
          back.classList.toggle("hidden");
        });
        grid.appendChild(card);
      });
      section.appendChild(grid);
      wrap.appendChild(section);
    });

    quizBtn.addEventListener("click", function () {
      runKanaQuiz(container, list, kind, label);
    });
  }

  function runKanaQuiz(container, list, kind, label) {
    var pool = shuffle(list);
    var idx = 0;
    var correctCount = 0;
    var total = Math.min(pool.length, 20);

    function next() {
      if (idx >= total) {
        showQuizResult(container, correctCount, total, function () {
          renderKanaTab(container, list, kind, label);
        });
        return;
      }
      var item = pool[idx];
      var id = "kana:" + kind + ":" + item.char;
      var distractors = sample(list.filter(function (x) { return x.romaji !== item.romaji; }), 3)
        .map(function (x) { return x.romaji; });
      var options = shuffle(distractors.concat([item.romaji]));

      container.innerHTML = "";
      var quizWrap = el("div", "jp-quiz-wrap");
      quizWrap.appendChild(el("div", "jp-quiz-progress", (idx + 1) + " / " + total));
      quizWrap.appendChild(el("div", "jp-quiz-char", item.char));
      quizWrap.appendChild(el("p", "jp-quiz-prompt", "What's the reading?"));
      var optWrap = el("div", "jp-quiz-options");
      options.forEach(function (opt) {
        var btn = el("button", "jp-quiz-option", opt);
        btn.addEventListener("click", function () {
          var isCorrect = opt === item.romaji;
          if (isCorrect) correctCount++;
          recordAnswer(id, isCorrect);
          Array.prototype.forEach.call(optWrap.children, function (b) {
            if (b.textContent === item.romaji) b.classList.add("is-correct");
            else if (b === btn && !isCorrect) b.classList.add("is-wrong");
            b.disabled = true;
          });
          setTimeout(function () { idx++; next(); }, 650);
        });
        optWrap.appendChild(btn);
      });
      quizWrap.appendChild(optWrap);
      container.appendChild(quizWrap);
    }
    next();
  }

  function showQuizResult(container, correct, total, onContinue) {
    container.innerHTML = "";
    var wrap = el("div", "jp-quiz-result");
    var pct = Math.round((correct / total) * 100);
    wrap.appendChild(el("div", "jp-quiz-result-score", correct + " / " + total + " (" + pct + "%)"));
    var msg = pct >= 90 ? "Excellent — that set is solid." :
      pct >= 70 ? "Good progress. The ones you missed will come back sooner." :
      "Worth another pass soon — repetition is exactly how this sticks.";
    wrap.appendChild(el("p", "jp-quiz-result-msg", msg));
    var btn = el("button", "jp-btn jp-btn-accent", "Back");
    btn.addEventListener("click", onContinue);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  // ---------------- Vocabulary ----------------

  function renderVocabTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "jp-vocab-wrap");
    wrap.appendChild(el("p", "jp-tab-intro", "Pick a set to study. Each word has a real example sentence — reading it in context, not just as an isolated word, is what makes it stick."));
    var grid = el("div", "topic-grid jp-set-grid");
    VOCAB_SETS.forEach(function (set) {
      var card = el("a", "topic-card jp-set-card");
      card.href = "#";
      var box0count = set.words.filter(function (w) {
        return (getProgress("vocab:" + set.id + ":" + w.kana).box || 0) === 0;
      }).length;
      card.innerHTML =
        '<div class="topic-card-title">' + set.title + '</div>' +
        '<div class="topic-card-desc">' + set.words.length + ' words' + (box0count ? ' · ' + box0count + ' new' : '') + '</div>';
      card.addEventListener("click", function (e) {
        e.preventDefault();
        renderVocabSet(container, set);
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  function renderVocabSet(container, set) {
    container.innerHTML = "";
    var wrap = el("div", "jp-vocab-set-wrap");
    var back = el("button", "jp-btn jp-back-btn", "← All sets");
    back.addEventListener("click", function () { renderVocabTab(container); });
    wrap.appendChild(back);
    wrap.appendChild(el("h3", "jp-set-title", set.title));

    var controls = el("div", "jp-controls");
    var quizBtn = el("button", "jp-btn jp-btn-accent", "Quiz me on this set");
    controls.appendChild(quizBtn);
    wrap.appendChild(controls);

    var list = el("div", "jp-vocab-list");
    set.words.forEach(function (w) {
      var id = "vocab:" + set.id + ":" + w.kana;
      var box = getProgress(id).box || 0;
      var card = el("div", "jp-vocab-card");
      card.innerHTML =
        '<div class="jp-vocab-main">' +
          '<span class="jp-vocab-kana">' + w.kana + '</span>' +
          (w.kanji ? '<span class="jp-vocab-kanji">' + w.kanji + '</span>' : '') +
          '<span class="jp-vocab-romaji">' + w.romaji + '</span>' +
        '</div>' +
        '<div class="jp-vocab-en">' + w.en + '</div>' +
        '<div class="jp-vocab-example">' +
          '<span class="jp-vocab-example-jp">' + w.example_jp + '</span>' +
          '<span class="jp-vocab-example-romaji">' + w.example_romaji + '</span>' +
          '<span class="jp-vocab-example-en">' + w.example_en + '</span>' +
        '</div>' +
        '<div class="jp-kana-mastery mastery-' + box + '">' + masteryLabel(box) + '</div>';
      list.appendChild(card);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);

    quizBtn.addEventListener("click", function () {
      runVocabQuiz(container, set);
    });
  }

  function runVocabQuiz(container, set) {
    var pool = shuffle(set.words);
    var idx = 0;
    var correctCount = 0;
    var total = pool.length;
    var allWords = VOCAB_SETS.reduce(function (acc, s) { return acc.concat(s.words); }, []);

    function next() {
      if (idx >= total) {
        showQuizResult(container, correctCount, total, function () { renderVocabSet(container, set); });
        return;
      }
      var w = pool[idx];
      var id = "vocab:" + set.id + ":" + w.kana;
      var distractors = sample(allWords.filter(function (x) { return x.en !== w.en; }), 3)
        .map(function (x) { return x.en; });
      var options = shuffle(distractors.concat([w.en]));

      container.innerHTML = "";
      var quizWrap = el("div", "jp-quiz-wrap");
      quizWrap.appendChild(el("div", "jp-quiz-progress", (idx + 1) + " / " + total));
      quizWrap.appendChild(el("div", "jp-quiz-char jp-quiz-char-word", w.kana + (w.kanji ? " (" + w.kanji + ")" : "")));
      quizWrap.appendChild(el("div", "jp-quiz-subtext", w.romaji));
      quizWrap.appendChild(el("p", "jp-quiz-prompt", "What does it mean?"));
      var optWrap = el("div", "jp-quiz-options");
      options.forEach(function (opt) {
        var btn = el("button", "jp-quiz-option", opt);
        btn.addEventListener("click", function () {
          var isCorrect = opt === w.en;
          if (isCorrect) correctCount++;
          recordAnswer(id, isCorrect);
          Array.prototype.forEach.call(optWrap.children, function (b) {
            if (b.textContent === w.en) b.classList.add("is-correct");
            else if (b === btn && !isCorrect) b.classList.add("is-wrong");
            b.disabled = true;
          });
          setTimeout(function () { idx++; next(); }, 750);
        });
        optWrap.appendChild(btn);
      });
      quizWrap.appendChild(optWrap);
      container.appendChild(quizWrap);
    }
    next();
  }

  // ---------------- Grammar ----------------

  function renderGrammarTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "jp-grammar-wrap");
    wrap.appendChild(el("p", "jp-tab-intro", "Twelve lessons, each building on the last. Read the explanation, then work through the drills — the drills are what actually cement it, not just reading."));
    var list = el("div", "chapter-list jp-grammar-list");
    GRAMMAR_LESSONS.forEach(function (lesson, i) {
      var done = state.grammarDone && state.grammarDone[lesson.id];
      var row = el("a", "chapter-row" + (done ? " is-read" : ""));
      row.href = "#";
      row.innerHTML =
        '<span class="chapter-row-title">' + (done ? '<span class="chapter-check">✓</span>' : '') +
        'Lesson ' + (i + 1) + ': ' + lesson.title + '</span>';
      row.addEventListener("click", function (e) {
        e.preventDefault();
        renderGrammarLesson(container, lesson);
      });
      list.appendChild(row);
    });
    wrap.appendChild(list);
    container.appendChild(wrap);
  }

  function renderGrammarLesson(container, lesson) {
    container.innerHTML = "";
    var wrap = el("div", "jp-grammar-lesson-wrap");
    var back = el("button", "jp-btn jp-back-btn", "← All lessons");
    back.addEventListener("click", function () { renderGrammarTab(container); });
    wrap.appendChild(back);
    wrap.appendChild(el("h3", "jp-set-title", lesson.title));
    wrap.appendChild(el("div", "jp-grammar-explanation", lesson.explanation_html));

    var drillsWrap = el("div", "jp-drills-wrap");
    drillsWrap.appendChild(el("h4", "jp-drills-title", "Drills"));
    lesson.drills.forEach(function (drill, di) {
      drillsWrap.appendChild(renderDrill(drill, lesson.id + ":" + di));
    });
    wrap.appendChild(drillsWrap);

    var doneBtn = el("button", "jp-btn jp-btn-accent", state.grammarDone && state.grammarDone[lesson.id] ? "Marked as reviewed" : "Mark this lesson reviewed");
    doneBtn.addEventListener("click", function () {
      if (!state.grammarDone) state.grammarDone = {};
      state.grammarDone[lesson.id] = true;
      saveState();
      doneBtn.textContent = "Marked as reviewed";
    });
    wrap.appendChild(doneBtn);

    container.appendChild(wrap);
  }

  function renderDrill(drill, drillId) {
    var box = el("div", "jp-drill");
    box.appendChild(el("p", "jp-drill-prompt", drill.prompt));

    if (drill.type === "mc") {
      var optWrap = el("div", "jp-quiz-options jp-drill-options");
      drill.options.forEach(function (opt, i) {
        var btn = el("button", "jp-quiz-option", opt);
        btn.addEventListener("click", function () {
          var isCorrect = i === drill.correct;
          Array.prototype.forEach.call(optWrap.children, function (b, bi) {
            if (bi === drill.correct) b.classList.add("is-correct");
            else if (b === btn && !isCorrect) b.classList.add("is-wrong");
            b.disabled = true;
          });
          explain.classList.remove("hidden");
        });
        optWrap.appendChild(btn);
      });
      box.appendChild(optWrap);
    } else if (drill.type === "fill") {
      var inputRow = el("div", "jp-fill-row");
      var input = document.createElement("input");
      input.type = "text";
      input.className = "jp-fill-input";
      input.placeholder = "type your answer (romaji)";
      var checkBtn = el("button", "jp-btn jp-fill-check", "Check");
      inputRow.appendChild(input);
      inputRow.appendChild(checkBtn);
      box.appendChild(inputRow);
      var feedback = el("div", "jp-fill-feedback hidden");
      box.appendChild(feedback);
      checkBtn.addEventListener("click", function () {
        var val = input.value.trim().toLowerCase();
        var acceptable = [drill.answer.toLowerCase()].concat((drill.acceptable || []).map(function (a) { return a.toLowerCase(); }));
        var isCorrect = acceptable.indexOf(val) !== -1;
        feedback.textContent = isCorrect ? "Correct." : "Not quite — correct answer: " + drill.answer;
        feedback.className = "jp-fill-feedback " + (isCorrect ? "is-correct" : "is-wrong");
        explain.classList.remove("hidden");
      });
    }

    var explain = el("div", "jp-drill-explain hidden", drill.explanation);
    box.appendChild(explain);
    return box;
  }

  // ---------------- Review (interleaved SRS across kana + vocab) ----------------

  function collectDueItems() {
    var items = [];
    HIRAGANA.forEach(function (c) {
      var id = "kana:hira:" + c.char;
      if (isDue(id)) items.push({ kind: "hira", id: id, char: c.char, answer: c.romaji, promptLabel: "What's the reading?" });
    });
    KATAKANA.forEach(function (c) {
      var id = "kana:kata:" + c.char;
      if (isDue(id)) items.push({ kind: "kata", id: id, char: c.char, answer: c.romaji, promptLabel: "What's the reading?" });
    });
    VOCAB_SETS.forEach(function (set) {
      set.words.forEach(function (w) {
        var id = "vocab:" + set.id + ":" + w.kana;
        if (isDue(id)) items.push({ kind: "vocab", id: id, char: w.kana + (w.kanji ? " (" + w.kanji + ")" : ""), answer: w.en, promptLabel: "What does it mean?" });
      });
    });
    return items;
  }

  function renderReviewTab(container) {
    container.innerHTML = "";
    var due = collectDueItems();
    var wrap = el("div", "jp-review-wrap");
    wrap.appendChild(el("p", "jp-tab-intro",
      "Everything due for review right now, mixed together on purpose — interleaving different item types is more effective than reviewing one category at a time. " +
      "New items become due immediately; items you know well come back after longer gaps."));
    wrap.appendChild(el("div", "jp-review-count", due.length + " item" + (due.length === 1 ? "" : "s") + " due"));
    if (due.length === 0) {
      wrap.appendChild(el("p", "jp-tab-intro", "Nothing due right now — study some new Hiragana, Katakana, or Vocabulary, or come back later."));
      container.appendChild(wrap);
      return;
    }
    var startBtn = el("button", "jp-btn jp-btn-accent", "Start review (" + Math.min(due.length, 25) + ")");
    startBtn.addEventListener("click", function () { runReviewQuiz(container, due); });
    wrap.appendChild(startBtn);
    container.appendChild(wrap);
  }

  function runReviewQuiz(container, dueItems) {
    var pool = shuffle(dueItems).slice(0, 25);
    var idx = 0;
    var correctCount = 0;
    var total = pool.length;
    var allAnswerPools = {
      hira: HIRAGANA.map(function (c) { return c.romaji; }),
      kata: KATAKANA.map(function (c) { return c.romaji; }),
      vocab: VOCAB_SETS.reduce(function (acc, s) { return acc.concat(s.words.map(function (w) { return w.en; })); }, [])
    };

    function next() {
      if (idx >= total) {
        showQuizResult(container, correctCount, total, function () { renderReviewTab(container); });
        return;
      }
      var item = pool[idx];
      var distractors = sample(allAnswerPools[item.kind].filter(function (a) { return a !== item.answer; }), 3);
      var options = shuffle(distractors.concat([item.answer]));

      container.innerHTML = "";
      var quizWrap = el("div", "jp-quiz-wrap");
      quizWrap.appendChild(el("div", "jp-quiz-progress", (idx + 1) + " / " + total));
      quizWrap.appendChild(el("div", "jp-quiz-char", item.char));
      quizWrap.appendChild(el("p", "jp-quiz-prompt", item.promptLabel));
      var optWrap = el("div", "jp-quiz-options");
      options.forEach(function (opt) {
        var btn = el("button", "jp-quiz-option", opt);
        btn.addEventListener("click", function () {
          var isCorrect = opt === item.answer;
          if (isCorrect) correctCount++;
          recordAnswer(item.id, isCorrect);
          Array.prototype.forEach.call(optWrap.children, function (b) {
            if (b.textContent === item.answer) b.classList.add("is-correct");
            else if (b === btn && !isCorrect) b.classList.add("is-wrong");
            b.disabled = true;
          });
          setTimeout(function () { idx++; next(); }, 700);
        });
        optWrap.appendChild(btn);
      });
      quizWrap.appendChild(optWrap);
      container.appendChild(quizWrap);
    }
    next();
  }

  // ---------------- Sentence Builder puzzle ----------------

  function allExampleSentences() {
    var out = [];
    VOCAB_SETS.forEach(function (set) {
      set.words.forEach(function (w) {
        if (w.example_romaji && w.example_romaji.split(" ").length >= 3) {
          out.push({ jp: w.example_jp, romaji: w.example_romaji, en: w.example_en });
        }
      });
    });
    return out;
  }

  function renderBuilderTab(container) {
    container.innerHTML = "";
    var sentences = allExampleSentences();
    var wrap = el("div", "jp-builder-wrap");
    wrap.appendChild(el("p", "jp-tab-intro", "Reconstruct the sentence in the right order, using the English meaning as your guide. Pulled from real example sentences you've already seen in Vocabulary."));
    var startBtn = el("button", "jp-btn jp-btn-accent", "New sentence");
    wrap.appendChild(startBtn);
    var puzzleArea = el("div", "jp-builder-area");
    wrap.appendChild(puzzleArea);
    container.appendChild(wrap);

    function newPuzzle() {
      var s = sentences[Math.floor(Math.random() * sentences.length)];
      var tokens = s.romaji.split(" ");
      var shuffled = shuffle(tokens);
      var chosen = [];
      puzzleArea.innerHTML = "";
      puzzleArea.appendChild(el("div", "jp-builder-target", s.jp));
      puzzleArea.appendChild(el("div", "jp-builder-en", s.en));
      var slotsRow = el("div", "jp-builder-slots");
      var bankRow = el("div", "jp-builder-bank");
      puzzleArea.appendChild(slotsRow);
      puzzleArea.appendChild(bankRow);
      var feedback = el("div", "jp-fill-feedback hidden");
      puzzleArea.appendChild(feedback);

      function renderSlots() {
        slotsRow.innerHTML = "";
        chosen.forEach(function (t, i) {
          var chip = el("button", "jp-builder-chip is-chosen", t);
          chip.addEventListener("click", function () {
            chosen.splice(i, 1);
            renderSlots();
            renderBank();
          });
          slotsRow.appendChild(chip);
        });
        for (var i = chosen.length; i < tokens.length; i++) {
          slotsRow.appendChild(el("span", "jp-builder-blank", "___"));
        }
      }
      function renderBank() {
        bankRow.innerHTML = "";
        var remaining = shuffled.filter(function (t, i) {
          var usedCount = chosen.filter(function (c) { return c === t; }).length;
          var seenSoFar = shuffled.slice(0, i + 1).filter(function (x) { return x === t; }).length;
          return seenSoFar > usedCount;
        });
        remaining.forEach(function (t) {
          var chip = el("button", "jp-builder-chip", t);
          chip.addEventListener("click", function () {
            chosen.push(t);
            renderSlots();
            renderBank();
            if (chosen.length === tokens.length) checkAnswer();
          });
          bankRow.appendChild(chip);
        });
      }
      function checkAnswer() {
        var isCorrect = chosen.join(" ") === tokens.join(" ");
        feedback.classList.remove("hidden");
        feedback.className = "jp-fill-feedback " + (isCorrect ? "is-correct" : "is-wrong");
        feedback.textContent = isCorrect ? "Correct order!" : "Not quite the original order — correct: " + tokens.join(" ");
      }
      renderSlots();
      renderBank();
    }
    startBtn.addEventListener("click", newPuzzle);
    newPuzzle();
  }

  // ---------------- Tab shell ----------------

  var TABS = [
    { id: "hiragana", label: "Hiragana", render: function (c) { renderKanaTab(c, HIRAGANA, "hira", "Hiragana"); } },
    { id: "katakana", label: "Katakana", render: function (c) { renderKanaTab(c, KATAKANA, "kata", "Katakana"); } },
    { id: "vocab", label: "Vocabulary", render: renderVocabTab },
    { id: "grammar", label: "Grammar", render: renderGrammarTab },
    { id: "review", label: "Review", render: renderReviewTab },
    { id: "builder", label: "Sentence Builder", render: renderBuilderTab }
  ];

  function init() {
    var tabBar = document.getElementById("jpTabBar");
    var content = document.getElementById("jpContent");
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
