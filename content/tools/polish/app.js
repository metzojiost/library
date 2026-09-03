/* Polish learning tool — interactive engine, same architecture as the Japanese tool.
   Expects ALPHABET, VOCAB_SETS, GRAMMAR_LESSONS to be defined by data.js, loaded before this file.

   Design notes (why it's built this way):
   - New material is introduced in chunks of ~5 (matches working-memory chunk-capacity research),
     tested immediately per chunk, then chunks accumulate — blocked-then-interleaved, not one giant
     test at the end and not pure interleaving from the start either.
   - Three retrieval formats (multiple choice, typed recall, matching-pairs game) rather than one
     repeated format — varied retrieval formats measurably improve retention/transfer over a single
     repeated format, and typed recall specifically engages the generation effect (producing an
     answer builds a stronger trace than recognizing one).
   - A Leitner-box spaced-repetition queue (Review tab) mixes everything that's actually due,
     old and new together, once individual items are established. */

(function () {
  "use strict";

  var STORAGE_KEY = "pl-tool-progress-v1";
  var DAY = 86400000;
  var BOX_INTERVALS = [0, DAY, 3 * DAY, 7 * DAY, 14 * DAY, 30 * DAY];
  var CHUNK_SIZE = 5;

  var state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { items: {}, grammarDone: {}, chunksLearned: {} };
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
  function getChunksLearned(key) {
    return (state.chunksLearned && state.chunksLearned[key]) || 1;
  }
  function setChunksLearned(key, n) {
    if (!state.chunksLearned) state.chunksLearned = {};
    state.chunksLearned[key] = n;
    saveState();
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
  function chunkList(list, size) {
    var chunks = [];
    for (var i = 0; i < list.length; i += size) chunks.push(list.slice(i, i + size));
    return chunks;
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function alphaNorm(it) {
    return { id: "alpha:" + it.char, display: it.char, sub: "", answer: it.sound, promptLabel: "What sound does it make?" };
  }
  function vocabNorm(w, setId) {
    return { id: "vocab:" + setId + ":" + w.pl, display: w.pl, sub: w.pron, answer: w.en, promptLabel: "What does it mean?" };
  }

  function showQuizResult(container, correct, total, onContinue) {
    container.innerHTML = "";
    var wrap = el("div", "pl-quiz-result");
    var pct = Math.round((correct / total) * 100);
    wrap.appendChild(el("div", "pl-quiz-result-score", correct + " / " + total + " (" + pct + "%)"));
    var msg = pct >= 90 ? "Excellent — that set is solid." :
      pct >= 70 ? "Good progress. The ones you missed will come back sooner." :
      "Worth another pass soon — repetition is exactly how this sticks.";
    wrap.appendChild(el("p", "pl-quiz-result-msg", msg));
    var btn = el("button", "pl-btn pl-btn-accent", "Back");
    btn.addEventListener("click", onContinue);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  // ---------------- Generic retrieval-format engines (used by Alphabet, Vocab, Review) ----------------

  function runMCQuiz(container, items, answerPool, onDone) {
    var idx = 0, correctCount = 0, total = items.length;
    function next() {
      if (idx >= total) { showQuizResult(container, correctCount, total, onDone); return; }
      var item = items[idx];
      var distractors = sample(answerPool.filter(function (a) { return a !== item.answer; }), 3);
      var options = shuffle(distractors.concat([item.answer]));
      container.innerHTML = "";
      var quizWrap = el("div", "pl-quiz-wrap");
      quizWrap.appendChild(el("div", "pl-quiz-progress", (idx + 1) + " / " + total));
      quizWrap.appendChild(el("div", "pl-quiz-char", item.display));
      if (item.sub) quizWrap.appendChild(el("div", "pl-quiz-subtext", item.sub));
      quizWrap.appendChild(el("p", "pl-quiz-prompt", item.promptLabel));
      var optWrap = el("div", "pl-quiz-options");
      options.forEach(function (opt) {
        var btn = el("button", "pl-quiz-option", opt);
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

  function runTypedQuiz(container, items, onDone) {
    var idx = 0, correctCount = 0, total = items.length;
    function next() {
      if (idx >= total) { showQuizResult(container, correctCount, total, onDone); return; }
      var item = items[idx];
      container.innerHTML = "";
      var quizWrap = el("div", "pl-quiz-wrap");
      quizWrap.appendChild(el("div", "pl-quiz-progress", (idx + 1) + " / " + total));
      quizWrap.appendChild(el("div", "pl-quiz-char", item.display));
      quizWrap.appendChild(el("p", "pl-quiz-prompt", item.promptLabel + " (type it in English)"));
      var inputRow = el("div", "pl-fill-row");
      var input = document.createElement("input");
      input.type = "text"; input.className = "pl-fill-input"; input.autocomplete = "off"; input.spellcheck = false;
      var checkBtn = el("button", "pl-btn pl-fill-check", "Check");
      inputRow.appendChild(input); inputRow.appendChild(checkBtn);
      quizWrap.appendChild(inputRow);
      var feedback = el("div", "pl-fill-feedback hidden");
      quizWrap.appendChild(feedback);
      var answered = false;
      function submit() {
        if (answered) return;
        answered = true;
        var val = input.value.trim().toLowerCase();
        var isCorrect = val === item.answer.toLowerCase();
        recordAnswer(item.id, isCorrect);
        if (isCorrect) correctCount++;
        input.disabled = true; checkBtn.disabled = true;
        feedback.classList.remove("hidden");
        feedback.className = "pl-fill-feedback " + (isCorrect ? "is-correct" : "is-wrong");
        feedback.textContent = isCorrect ? "Correct." : "Correct answer: " + item.answer;
        setTimeout(function () { idx++; next(); }, 1000);
      }
      checkBtn.addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
      container.appendChild(quizWrap);
      input.focus();
    }
    next();
  }

  function runMatchingGame(container, items, onDone) {
    var pairSet = shuffle(items).slice(0, Math.min(items.length, 8));
    if (pairSet.length < 2) {
      container.innerHTML = "";
      container.appendChild(el("p", "pl-tab-intro", "Not enough items in this chunk for a matching game — try the quiz modes instead."));
      var backBtn = el("button", "pl-btn pl-btn-accent", "Back");
      backBtn.addEventListener("click", onDone);
      container.appendChild(backBtn);
      return;
    }
    var cards = [];
    pairSet.forEach(function (item, i) {
      cards.push({ pairId: i, side: "prompt", text: item.display, itemId: item.id });
      cards.push({ pairId: i, side: "answer", text: item.answer, itemId: item.id });
    });
    cards = shuffle(cards);
    var matchedCount = 0;
    var selectedIdx = null;
    var mistakes = 0;

    container.innerHTML = "";
    var wrap = el("div", "pl-match-wrap");
    wrap.appendChild(el("p", "pl-quiz-progress", "Match each pair — " + pairSet.length + " pairs."));
    var grid = el("div", "pl-match-grid");
    wrap.appendChild(grid);
    container.appendChild(wrap);

    var cardEls = [];
    cards.forEach(function (c, idx) {
      var btn = el("button", "pl-match-card", c.text);
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-matched") || btn.classList.contains("is-selected") || btn.disabled) return;
        if (selectedIdx === null) {
          selectedIdx = idx;
          btn.classList.add("is-selected");
          return;
        }
        var first = cards[selectedIdx];
        var firstEl = cardEls[selectedIdx];
        if (selectedIdx === idx) return;
        if (first.pairId === c.pairId && first.side !== c.side) {
          firstEl.classList.remove("is-selected");
          firstEl.classList.add("is-matched");
          btn.classList.add("is-matched");
          firstEl.disabled = true; btn.disabled = true;
          recordAnswer(first.itemId, true);
          matchedCount++;
          selectedIdx = null;
          if (matchedCount === pairSet.length) {
            setTimeout(function () {
              showQuizResult(container, pairSet.length, pairSet.length + mistakes, onDone);
            }, 500);
          }
        } else {
          mistakes++;
          if (first.pairId === c.pairId) { /* same word both sides clicked, not a real miss */ } else {
            recordAnswer(first.itemId, false);
          }
          firstEl.classList.add("is-wrong-flash");
          btn.classList.add("is-wrong-flash");
          (function (fEl, bEl) {
            setTimeout(function () {
              fEl.classList.remove("is-selected", "is-wrong-flash");
              bEl.classList.remove("is-wrong-flash");
            }, 550);
          })(firstEl, btn);
          selectedIdx = null;
        }
      });
      grid.appendChild(btn);
      cardEls.push(btn);
    });
  }

  function renderDrillPicker(container, items, answerPool, onDone) {
    var picker = el("div", "pl-controls");
    var mcBtn = el("button", "pl-btn pl-btn-accent", "Multiple choice");
    var typeBtn = el("button", "pl-btn", "Type it");
    var matchBtn = el("button", "pl-btn", "Matching game");
    picker.appendChild(mcBtn); picker.appendChild(typeBtn); picker.appendChild(matchBtn);
    mcBtn.addEventListener("click", function () { runMCQuiz(container, shuffle(items), answerPool, onDone); });
    typeBtn.addEventListener("click", function () { runTypedQuiz(container, shuffle(items), onDone); });
    matchBtn.addEventListener("click", function () { runMatchingGame(container, items, onDone); });
    return picker;
  }

  // ---------------- Alphabet & Sounds ----------------

  function renderAlphabetTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "pl-kana-wrap");
    var modeRow = el("div", "pl-mode-row");
    var learnBtn = el("button", "pl-mode-btn is-active", "Learn (progressive)");
    var browseBtn = el("button", "pl-mode-btn", "Browse all / reference");
    modeRow.appendChild(learnBtn); modeRow.appendChild(browseBtn);
    wrap.appendChild(modeRow);
    var body = el("div", "pl-kana-body");
    wrap.appendChild(body);
    container.appendChild(wrap);

    learnBtn.addEventListener("click", function () {
      learnBtn.classList.add("is-active"); browseBtn.classList.remove("is-active");
      renderAlphabetLearn(body);
    });
    browseBtn.addEventListener("click", function () {
      browseBtn.classList.add("is-active"); learnBtn.classList.remove("is-active");
      renderAlphabetBrowse(body);
    });
    renderAlphabetLearn(body);
  }

  function renderAlphabetLearn(container) {
    container.innerHTML = "";
    var chunks = chunkList(ALPHABET, CHUNK_SIZE);
    var learned = Math.min(getChunksLearned("alphabet"), chunks.length);
    var currentChunkIdx = learned - 1;

    container.appendChild(el("p", "pl-tab-intro",
      "Chunk " + learned + " of " + chunks.length + " — " + chunks[currentChunkIdx].length + " new letters/digraphs. " +
      "Flip each to check the sound, then test yourself before moving on. Small, frequent tests beat one big one at the end."));

    var dots = el("div", "pl-chunk-dots");
    chunks.forEach(function (c, i) {
      dots.appendChild(el("span", "pl-chunk-dot" + (i < learned - 1 ? " is-done" : i === currentChunkIdx ? " is-current" : "")));
    });
    container.appendChild(dots);

    var grid = el("div", "pl-kana-grid");
    chunks[currentChunkIdx].forEach(function (item) {
      var id = "alpha:" + item.char;
      var box = getProgress(id).box || 0;
      var card = el("div", "pl-kana-card");
      card.appendChild(el("div", "pl-kana-char", item.char));
      var back = el("div", "pl-kana-romaji hidden", item.sound);
      card.appendChild(back);
      card.appendChild(el("div", "pl-kana-mastery mastery-" + box, masteryLabel(box)));
      card.addEventListener("click", function () { back.classList.toggle("hidden"); });
      grid.appendChild(card);
    });
    container.appendChild(grid);

    container.appendChild(el("h4", "pl-drills-title", "Test chunk " + learned + " (cumulative — includes everything learned so far)"));
    var cumulative = [].concat.apply([], chunks.slice(0, learned)).map(alphaNorm);
    var answerPool = ALPHABET.map(function (it) { return it.sound; });
    container.appendChild(renderDrillPicker(container, cumulative, answerPool, function () { renderAlphabetLearn(container); }));

    if (currentChunkIdx + 1 < chunks.length) {
      var nextBtn = el("button", "pl-btn pl-next-chunk-btn", "Next chunk (" + chunks[currentChunkIdx + 1].length + " more) →");
      nextBtn.addEventListener("click", function () {
        setChunksLearned("alphabet", learned + 1);
        renderAlphabetLearn(container);
      });
      container.appendChild(nextBtn);
    } else {
      container.appendChild(el("p", "pl-tab-intro", "That's the whole alphabet chart. Keep using Review to keep it fresh."));
    }
  }

  function renderAlphabetBrowse(container) {
    container.innerHTML = "";
    var rows = {};
    ALPHABET.forEach(function (it) {
      if (!rows[it.row]) rows[it.row] = [];
      rows[it.row].push(it);
    });
    container.appendChild(el("p", "pl-tab-intro", "The full alphabet/sounds chart for reference — click any letter to flip it."));
    Object.keys(rows).forEach(function (rowKey) {
      var section = el("div", "pl-kana-row-section");
      section.appendChild(el("h3", "pl-kana-row-title", rowKey));
      var grid = el("div", "pl-kana-grid");
      rows[rowKey].forEach(function (item) {
        var id = "alpha:" + item.char;
        var box = getProgress(id).box || 0;
        var card = el("div", "pl-kana-card");
        card.appendChild(el("div", "pl-kana-char", item.char));
        var back = el("div", "pl-kana-romaji hidden", item.sound);
        card.appendChild(back);
        card.appendChild(el("div", "pl-kana-mastery mastery-" + box, masteryLabel(box)));
        card.addEventListener("click", function () { back.classList.toggle("hidden"); });
        grid.appendChild(card);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  // ---------------- Vocabulary ----------------

  function renderVocabTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "pl-vocab-wrap");
    wrap.appendChild(el("p", "pl-tab-intro", "Pick a set to study. Each word has a real example sentence — reading it in context, not just as an isolated word, is what makes it stick."));
    var grid = el("div", "topic-grid pl-set-grid");
    VOCAB_SETS.forEach(function (set) {
      var card = el("a", "topic-card pl-set-card");
      card.href = "#";
      var box0count = set.words.filter(function (w) {
        return (getProgress("vocab:" + set.id + ":" + w.pl).box || 0) === 0;
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
    var wrap = el("div", "pl-vocab-set-wrap");
    var back = el("button", "pl-btn pl-back-btn", "← All sets");
    back.addEventListener("click", function () { renderVocabTab(container); });
    wrap.appendChild(back);
    wrap.appendChild(el("h3", "pl-set-title", set.title));

    var modeRow = el("div", "pl-mode-row");
    var learnBtn = el("button", "pl-mode-btn is-active", "Learn (progressive)");
    var browseBtn = el("button", "pl-mode-btn", "Browse all");
    modeRow.appendChild(learnBtn); modeRow.appendChild(browseBtn);
    wrap.appendChild(modeRow);
    var body = el("div", "pl-vocab-body");
    wrap.appendChild(body);
    container.appendChild(wrap);

    learnBtn.addEventListener("click", function () {
      learnBtn.classList.add("is-active"); browseBtn.classList.remove("is-active");
      renderVocabLearn(body, set);
    });
    browseBtn.addEventListener("click", function () {
      browseBtn.classList.add("is-active"); learnBtn.classList.remove("is-active");
      renderVocabBrowse(body, set);
    });
    renderVocabLearn(body, set);
  }

  function vocabCard(w, id) {
    var box = getProgress(id).box || 0;
    var card = el("div", "pl-vocab-card");
    card.innerHTML =
      '<div class="pl-vocab-main">' +
        '<span class="pl-vocab-kana">' + w.pl + '</span>' +
        '<span class="pl-vocab-romaji">' + w.pron + '</span>' +
      '</div>' +
      '<div class="pl-vocab-en">' + w.en + '</div>' +
      '<div class="pl-vocab-example">' +
        '<span class="pl-vocab-example-jp">' + w.example_pl + '</span>' +
        '<span class="pl-vocab-example-en">' + w.example_en + '</span>' +
      '</div>' +
      '<div class="pl-kana-mastery mastery-' + box + '">' + masteryLabel(box) + '</div>';
    return card;
  }

  function renderVocabLearn(container, set) {
    container.innerHTML = "";
    var chunks = chunkList(set.words, CHUNK_SIZE);
    var key = "vocab_" + set.id;
    var learned = Math.min(getChunksLearned(key), chunks.length);
    var currentChunkIdx = learned - 1;

    container.appendChild(el("p", "pl-tab-intro",
      "Chunk " + learned + " of " + chunks.length + " — " + chunks[currentChunkIdx].length + " new words. Read each with its example sentence, then test before moving on."));

    var dots = el("div", "pl-chunk-dots");
    chunks.forEach(function (c, i) {
      dots.appendChild(el("span", "pl-chunk-dot" + (i < learned - 1 ? " is-done" : i === currentChunkIdx ? " is-current" : "")));
    });
    container.appendChild(dots);

    var list = el("div", "pl-vocab-list");
    chunks[currentChunkIdx].forEach(function (w) {
      list.appendChild(vocabCard(w, "vocab:" + set.id + ":" + w.pl));
    });
    container.appendChild(list);

    container.appendChild(el("h4", "pl-drills-title", "Test chunk " + learned + " (cumulative)"));
    var cumulative = [].concat.apply([], chunks.slice(0, learned)).map(function (w) { return vocabNorm(w, set.id); });
    var answerPool = set.words.map(function (w) { return w.en; });
    container.appendChild(renderDrillPicker(container, cumulative, answerPool, function () { renderVocabLearn(container, set); }));

    if (currentChunkIdx + 1 < chunks.length) {
      var nextBtn = el("button", "pl-btn pl-next-chunk-btn", "Next chunk (" + chunks[currentChunkIdx + 1].length + " more) →");
      nextBtn.addEventListener("click", function () {
        setChunksLearned(key, learned + 1);
        renderVocabLearn(container, set);
      });
      container.appendChild(nextBtn);
    } else {
      container.appendChild(el("p", "pl-tab-intro", "That's the whole set. Keep using Review to keep it fresh."));
    }
  }

  function renderVocabBrowse(container, set) {
    container.innerHTML = "";
    container.appendChild(el("p", "pl-tab-intro", "The full set for reference."));
    var list = el("div", "pl-vocab-list");
    set.words.forEach(function (w) {
      list.appendChild(vocabCard(w, "vocab:" + set.id + ":" + w.pl));
    });
    container.appendChild(list);
  }

  // ---------------- Grammar ----------------

  function renderGrammarTab(container) {
    container.innerHTML = "";
    var wrap = el("div", "pl-grammar-wrap");
    wrap.appendChild(el("p", "pl-tab-intro", "Twelve lessons, each building on the last. Read the explanation, then work through the drills — the drills are what actually cement it, not just reading."));
    var list = el("div", "chapter-list pl-grammar-list");
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
    var wrap = el("div", "pl-grammar-lesson-wrap");
    var back = el("button", "pl-btn pl-back-btn", "← All lessons");
    back.addEventListener("click", function () { renderGrammarTab(container); });
    wrap.appendChild(back);
    wrap.appendChild(el("h3", "pl-set-title", lesson.title));
    wrap.appendChild(el("div", "pl-grammar-explanation", lesson.explanation_html));

    var drillsWrap = el("div", "pl-drills-wrap");
    drillsWrap.appendChild(el("h4", "pl-drills-title", "Drills"));
    lesson.drills.forEach(function (drill, di) {
      drillsWrap.appendChild(renderDrill(drill, lesson.id + ":" + di));
    });
    wrap.appendChild(drillsWrap);

    var doneBtn = el("button", "pl-btn pl-btn-accent", state.grammarDone && state.grammarDone[lesson.id] ? "Marked as reviewed" : "Mark this lesson reviewed");
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
    var box = el("div", "pl-drill");
    box.appendChild(el("p", "pl-drill-prompt", drill.prompt));

    if (drill.type === "mc") {
      var optWrap = el("div", "pl-quiz-options pl-drill-options");
      drill.options.forEach(function (opt, i) {
        var btn = el("button", "pl-quiz-option", opt);
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
      var inputRow = el("div", "pl-fill-row");
      var input = document.createElement("input");
      input.type = "text";
      input.className = "pl-fill-input";
      input.placeholder = "type your answer";
      var checkBtn = el("button", "pl-btn pl-fill-check", "Check");
      inputRow.appendChild(input);
      inputRow.appendChild(checkBtn);
      box.appendChild(inputRow);
      var feedback = el("div", "pl-fill-feedback hidden");
      box.appendChild(feedback);
      checkBtn.addEventListener("click", function () {
        var val = input.value.trim().toLowerCase();
        var acceptable = [drill.answer.toLowerCase()].concat((drill.acceptable || []).map(function (a) { return a.toLowerCase(); }));
        var isCorrect = acceptable.indexOf(val) !== -1;
        feedback.textContent = isCorrect ? "Correct." : "Not quite — correct answer: " + drill.answer;
        feedback.className = "pl-fill-feedback " + (isCorrect ? "is-correct" : "is-wrong");
        explain.classList.remove("hidden");
      });
    }

    var explain = el("div", "pl-drill-explain hidden", drill.explanation);
    box.appendChild(explain);
    return box;
  }

  // ---------------- Review (interleaved SRS across alphabet + vocab) ----------------

  function collectDueItems() {
    var items = [];
    ALPHABET.forEach(function (c) {
      var n = alphaNorm(c);
      if (isDue(n.id)) items.push(n);
    });
    VOCAB_SETS.forEach(function (set) {
      set.words.forEach(function (w) {
        var n = vocabNorm(w, set.id);
        if (isDue(n.id)) items.push(n);
      });
    });
    return items;
  }

  function allAnswerPool() {
    return ALPHABET.map(function (c) { return c.sound; })
      .concat(VOCAB_SETS.reduce(function (acc, s) { return acc.concat(s.words.map(function (w) { return w.en; })); }, []));
  }

  function renderReviewTab(container) {
    container.innerHTML = "";
    var due = collectDueItems();
    var wrap = el("div", "pl-review-wrap");
    wrap.appendChild(el("p", "pl-tab-intro",
      "Everything due for review right now, mixed together on purpose — interleaving different item types is more effective than reviewing one category at a time. " +
      "New items become due immediately; items you know well come back after longer gaps."));
    wrap.appendChild(el("div", "pl-review-count", due.length + " item" + (due.length === 1 ? "" : "s") + " due"));
    if (due.length === 0) {
      wrap.appendChild(el("p", "pl-tab-intro", "Nothing due right now — study some new Alphabet sounds or Vocabulary, or come back later."));
      container.appendChild(wrap);
      return;
    }
    var pool = shuffle(due).slice(0, 25);
    container.appendChild(wrap);
    container.appendChild(renderDrillPicker(container, pool, allAnswerPool(), function () { renderReviewTab(container); }));
  }

  // ---------------- Sentence Builder puzzle ----------------

  function allExampleSentences() {
    var out = [];
    VOCAB_SETS.forEach(function (set) {
      set.words.forEach(function (w) {
        if (w.example_pl && w.example_pl.split(" ").length >= 3) {
          out.push({ pl: w.example_pl, en: w.example_en });
        }
      });
    });
    return out;
  }

  function renderBuilderTab(container) {
    container.innerHTML = "";
    var sentences = allExampleSentences();
    var wrap = el("div", "pl-builder-wrap");
    wrap.appendChild(el("p", "pl-tab-intro", "Reconstruct the Polish sentence in the right order, using the English meaning as your guide. Pulled from real example sentences you've already seen in Vocabulary."));
    var startBtn = el("button", "pl-btn pl-btn-accent", "New sentence");
    wrap.appendChild(startBtn);
    var puzzleArea = el("div", "pl-builder-area");
    wrap.appendChild(puzzleArea);
    container.appendChild(wrap);

    function newPuzzle() {
      var s = sentences[Math.floor(Math.random() * sentences.length)];
      var tokens = s.pl.split(" ");
      var shuffled = shuffle(tokens);
      var chosen = [];
      puzzleArea.innerHTML = "";
      puzzleArea.appendChild(el("div", "pl-builder-en", s.en));
      var slotsRow = el("div", "pl-builder-slots");
      var bankRow = el("div", "pl-builder-bank");
      puzzleArea.appendChild(slotsRow);
      puzzleArea.appendChild(bankRow);
      var feedback = el("div", "pl-fill-feedback hidden");
      puzzleArea.appendChild(feedback);

      function renderSlots() {
        slotsRow.innerHTML = "";
        chosen.forEach(function (t, i) {
          var chip = el("button", "pl-builder-chip is-chosen", t);
          chip.addEventListener("click", function () {
            chosen.splice(i, 1);
            renderSlots();
            renderBank();
          });
          slotsRow.appendChild(chip);
        });
        for (var i = chosen.length; i < tokens.length; i++) {
          slotsRow.appendChild(el("span", "pl-builder-blank", "___"));
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
          var chip = el("button", "pl-builder-chip", t);
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
        feedback.className = "pl-fill-feedback " + (isCorrect ? "is-correct" : "is-wrong");
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
    { id: "alphabet", label: "Alphabet & Sounds", render: renderAlphabetTab },
    { id: "vocab", label: "Vocabulary", render: renderVocabTab },
    { id: "grammar", label: "Grammar", render: renderGrammarTab },
    { id: "review", label: "Review", render: renderReviewTab },
    { id: "builder", label: "Sentence Builder", render: renderBuilderTab }
  ];

  function init() {
    var tabBar = document.getElementById("plTabBar");
    var content = document.getElementById("plContent");
    TABS.forEach(function (tab, i) {
      var btn = el("button", "pl-tab-btn" + (i === 0 ? " is-active" : ""), tab.label);
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
