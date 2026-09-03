"""
Builds the static library/ site from content/manifest.json + content/categories/**/*.html

Run after adding or editing a topic/chapter:
    python scripts/build.py

Content chapter files are plain HTML fragments (no <html>/<head>/<body>),
e.g. content/categories/<category>/<topic>/chapter-1.html

Topic branching:
  A topic can optionally have "parent": "<parent-topic-slug>" and
  "branches_after": "free text label, e.g. Chapter 3". When a topic has
  children, its library card and page show a "Continues into" section
  linking to each branch, and its badges show totals across the whole tree.

Read tracking:
  content/progress.json maps topic slug -> list of read chapter slugs, e.g.
  {"norse-mythology": ["chapter-1"]}. It's read here to bake checkmarks and
  "X/Y read" badges into the static pages. Ticking a chapter's checkbox in
  the browser only *persists* when the site is served via scripts/serve.py
  (double-click Start Library.bat) — plain file:// pages have no way to
  write back to disk, so the checkbox falls back to a same-session-only
  visual toggle there.
"""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
LIBRARY = ROOT / "library"
MANIFEST = CONTENT / "manifest.json"
PROGRESS = CONTENT / "progress.json"

WORDS_PER_MINUTE = 200


def load_manifest():
    return json.loads(MANIFEST.read_text(encoding="utf-8"))


def load_progress():
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text(encoding="utf-8"))
    return {}


def word_count(html):
    text = re.sub(r"<[^>]+>", " ", html)
    words = re.findall(r"\w+", text)
    return len(words)


def reading_time(words):
    return max(1, round(words / WORDS_PER_MINUTE))


def chapter_word(n):
    return "chapter" if n == 1 else "chapters"


def topic_own_words(topic):
    total = 0
    for ch in topic["chapters"]:
        ch_file = CONTENT / "categories" / topic["category"] / topic["slug"] / f"{ch['slug']}.html"
        total += word_count(ch_file.read_text(encoding="utf-8"))
    return total


class TopicIndex:
    """Resolves parent/child relationships across the manifest's topic list."""

    def __init__(self, manifest):
        self.by_slug = {t["slug"]: t for t in manifest["topics"]}
        self.children = {}
        for t in manifest["topics"]:
            parent = t.get("parent")
            if parent:
                self.children.setdefault(parent, []).append(t)

    def kids(self, topic):
        return self.children.get(topic["slug"], [])

    def ancestors(self, topic):
        """Root-first list of ancestor topics (not including topic itself)."""
        chain = []
        cur = topic
        while cur.get("parent"):
            parent = self.by_slug[cur["parent"]]
            chain.append(parent)
            cur = parent
        return list(reversed(chain))

    def total_chapters(self, topic):
        n = len(topic["chapters"])
        for kid in self.kids(topic):
            n += self.total_chapters(kid)
        return n

    def total_words(self, topic):
        words = topic_own_words(topic)
        for kid in self.kids(topic):
            words += self.total_words(kid)
        return words

    def own_read_count(self, progress, topic):
        read = set(progress.get(topic["slug"], []))
        have = {ch["slug"] for ch in topic["chapters"]}
        return len(read & have)

    def total_read(self, progress, topic):
        n = self.own_read_count(progress, topic)
        for kid in self.kids(topic):
            n += self.total_read(progress, kid)
        return n


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<link rel="stylesheet" href="{css_path}">
</head>
<body>
<div class="page">
<header class="topbar">
  <a class="brand" href="{home_path}">📚 My Library</a>
  <nav class="breadcrumbs">{breadcrumbs}</nav>
</header>
<main>
{content}
</main>
</div>
</body>
</html>
"""


def render_page(title, css_path, home_path, breadcrumbs, content):
    return PAGE.format(
        title=title,
        css_path=css_path,
        home_path=home_path,
        breadcrumbs=breadcrumbs,
        content=content,
    )


def read_badge(read_n, total_n):
    if read_n <= 0:
        return ""
    return f'<span class="badge badge-read">&#10003; {read_n}/{total_n} read</span>'


def topic_href_from_library_root(topic):
    return f"categories/{topic['category']}/{topic['slug']}/index.html"


def topic_href_from_topic_dir(topic):
    """Relative link to another topic's index page, from within a topic dir
    (library/categories/<cat>/<slug>/)."""
    return f"../../{topic['category']}/{topic['slug']}/index.html"


def build_library_index(manifest, idx, progress):
    categories = manifest["categories"]
    topics = manifest["topics"]
    top_level = [t for t in topics if not t.get("parent")]

    by_category = {}
    for t in top_level:
        by_category.setdefault(t["category"], []).append(t)

    if not topics:
        body = '<p class="empty">No topics yet. Ask for one to be added.</p>'
    else:
        sections = []
        for cat_slug, cat_name in categories.items():
            cat_topics = by_category.get(cat_slug, [])
            if not cat_topics:
                continue
            cards = []
            for t in cat_topics:
                n = idx.total_chapters(t)
                minutes = reading_time(idx.total_words(t))
                read_n = idx.total_read(progress, t)
                kids = idx.kids(t)
                branch_badge = ""
                if kids:
                    branch_word = "branch" if len(kids) == 1 else "branches"
                    branch_badge = f'<span class="badge badge-branch">{len(kids)} {branch_word}</span>'
                cards.append(f"""
  <a class="topic-card" href="{topic_href_from_library_root(t)}">
    <div class="topic-card-title">{t['title']}</div>
    <div class="topic-card-desc">{t.get('description', '')}</div>
    <div class="topic-card-meta">
      <span class="badge">{n} {chapter_word(n)}</span>
      <span class="badge">~{minutes} min read</span>
      {read_badge(read_n, n)}
      {branch_badge}
    </div>
  </a>""")
            sections.append(f"""
<section class="category-section">
  <h2>{cat_name}</h2>
  <div class="topic-grid">{''.join(cards)}
  </div>
</section>""")
        body = "\n".join(sections)

    games_section = """
<section class="category-section">
  <h2>Something Else to Do</h2>
  <div class="topic-grid">
  <a class="topic-card" href="games/sudoku.html">
    <div class="topic-card-title">Sudoku</div>
    <div class="topic-card-desc">Easy, medium, or hard — fully clickable, no keyboard needed.</div>
    <div class="topic-card-meta">
      <span class="badge">game</span>
    </div>
  </a>
  <a class="topic-card" href="tools/japanese/index.html">
    <div class="topic-card-title">Japanese, From Zero</div>
    <div class="topic-card-desc">Hiragana/Katakana drilling, vocabulary, 12 grammar lessons, and interleaved spaced-repetition review — built to be a real foundation, not a gamified toy.</div>
    <div class="topic-card-meta">
      <span class="badge">tool</span>
    </div>
  </a>
  <a class="topic-card" href="tools/drone-exam/index.html">
    <div class="topic-card-title">Εξέταση Χειριστή ΣμηΕΑ (A1/A3)</div>
    <div class="topic-card-desc">Full Greek study guide, key-numbers cheat sheet, and a 247-question practice quiz with explanations, plus generated variants.</div>
    <div class="topic-card-meta">
      <span class="badge">tool</span>
    </div>
  </a>
  <a class="topic-card" href="games/2048.html">
    <div class="topic-card-title">2048</div>
    <div class="topic-card-desc">Slide and merge tiles to reach 2048 — on-screen buttons, no keyboard needed.</div>
    <div class="topic-card-meta">
      <span class="badge">game</span>
    </div>
  </a>
  <a class="topic-card" href="tools/habit-calendar.html">
    <div class="topic-card-title">Habit Calendar</div>
    <div class="topic-card-desc">Stamp work-level, workout, and coffee stickers on any day. Saves locally, and it's printable.</div>
    <div class="topic-card-meta">
      <span class="badge">tool</span>
    </div>
  </a>
  <a class="topic-card" href="tools/polish-language-guide.html">
    <div class="topic-card-title">Polish Language Guide (static)</div>
    <div class="topic-card-desc">A beginner's first ~20 hours with Polish, as a read-through guide — pronunciation, core grammar, and everyday phrases.</div>
    <div class="topic-card-meta">
      <span class="badge">guide</span>
    </div>
  </a>
  <a class="topic-card" href="tools/polish/index.html">
    <div class="topic-card-title">Polish, From Zero (interactive)</div>
    <div class="topic-card-desc">The same 20-hour curriculum as chunked drilling — multiple choice, typed recall, matching games, and spaced-repetition review.</div>
    <div class="topic-card-meta">
      <span class="badge">tool</span>
    </div>
  </a>
  <a class="topic-card" href="tools/crete-home-savings-guide.html">
    <div class="topic-card-title">Home Savings Guide (Crete)</div>
    <div class="topic-card-desc">DIY and paid home upgrades to cut electricity, water, and cooling costs — with cost and payback estimates.</div>
    <div class="topic-card-meta">
      <span class="badge">guide</span>
    </div>
  </a>
  </div>
</section>"""

    html = render_page(
        title="My Library",
        css_path="assets/style.css",
        home_path="index.html",
        breadcrumbs="",
        content=f'<h1 class="page-title">My Library</h1>\n{body}\n{games_section}',
    )
    (LIBRARY / "index.html").write_text(html, encoding="utf-8")


def build_breadcrumbs(manifest, idx, topic, chapter=None):
    cat_name = manifest["categories"][topic["category"]]
    parts = [f'<a href="../../../index.html">Library</a>', f'<span>{cat_name}</span>']
    for anc in idx.ancestors(topic):
        parts.append(f'<a href="{topic_href_from_topic_dir(anc)}">{anc["title"]}</a>')
    if chapter is not None:
        parts.append(f'<a href="index.html">{topic["title"]}</a>')
        parts.append(f'<span>{chapter["title"]}</span>')
    else:
        parts.append(f'<span>{topic["title"]}</span>')
    return " / ".join(parts)


def build_branches_section(idx, progress, topic):
    kids = idx.kids(topic)
    if not kids:
        return ""
    cards = []
    for kid in kids:
        n = idx.total_chapters(kid)
        minutes = reading_time(idx.total_words(kid))
        read_n = idx.total_read(progress, kid)
        note = kid.get("branches_after")
        note_html = f'<div class="topic-card-desc">Branches off after {note}</div>' if note else ""
        cards.append(f"""
  <a class="topic-card" href="{topic_href_from_topic_dir(kid)}">
    <div class="topic-card-title">{kid['title']}</div>
    {note_html}
    <div class="topic-card-meta">
      <span class="badge">{n} {chapter_word(n)}</span>
      <span class="badge">~{minutes} min read</span>
      {read_badge(read_n, n)}
    </div>
  </a>""")
    return f"""
<section class="branches-section">
  <h2>Continues into</h2>
  <div class="topic-grid">{''.join(cards)}
  </div>
</section>"""


def build_guides_section(topic, progress):
    guides = topic.get("guides", [])
    if not guides:
        return ""
    read_slugs = set(progress.get(topic["slug"], []))
    cards = []
    for g in guides:
        g_file = CONTENT / "categories" / topic["category"] / topic["slug"] / f"{g['slug']}.html"
        words = word_count(g_file.read_text(encoding="utf-8"))
        minutes = reading_time(words)
        is_read = g["slug"] in read_slugs
        read_html = '<span class="badge badge-read">&#10003; read</span>' if is_read else ""
        cards.append(f"""
  <a class="topic-card guide-card" href="{g['slug']}.html">
    <div class="topic-card-title">{g['title']}</div>
    <div class="topic-card-meta">
      <span class="badge badge-guide">field guide</span>
      <span class="badge">~{minutes} min</span>
      {read_html}
    </div>
  </a>""")
    return f"""
<section class="guides-section">
  <h2>Field Guide</h2>
  <p class="guides-intro">Not a summary — practical takeaways for applying what the chapters cover, in bigger situations than the examples inside them.</p>
  <div class="topic-grid">{''.join(cards)}
  </div>
</section>"""


def build_topic_page(manifest, idx, progress, topic):
    cat_slug = topic["category"]
    topic_dir = LIBRARY / "categories" / cat_slug / topic["slug"]
    topic_dir.mkdir(parents=True, exist_ok=True)

    read_slugs = set(progress.get(topic["slug"], []))

    rows = []
    total_words = 0
    for ch in topic["chapters"]:
        ch_file = CONTENT / "categories" / cat_slug / topic["slug"] / f"{ch['slug']}.html"
        words = word_count(ch_file.read_text(encoding="utf-8"))
        total_words += words
        minutes = reading_time(words)
        is_read = ch["slug"] in read_slugs
        row_class = "chapter-row is-read" if is_read else "chapter-row"
        check = '<span class="chapter-check">&#10003;</span>' if is_read else ""
        rows.append(f"""
  <a class="{row_class}" href="{ch['slug']}.html">
    <span class="chapter-row-title">{check}{ch['title']}</span>
    <span class="badge">~{minutes} min</span>
  </a>""")

    n = len(topic["chapters"])
    total_minutes = reading_time(total_words)
    read_n = idx.own_read_count(progress, topic)

    parent_note = ""
    ancestors = idx.ancestors(topic)
    if ancestors:
        parent = ancestors[-1]
        parent_note = (
            f'<p class="continued-from">Continued from '
            f'<a href="{topic_href_from_topic_dir(parent)}">{parent["title"]}</a></p>'
        )

    breadcrumbs = build_breadcrumbs(manifest, idx, topic)

    body = f"""
<h1 class="page-title">{topic['title']}</h1>
{parent_note}
<p class="topic-desc">{topic.get('description', '')}</p>
<div class="topic-meta">
  <span class="badge">{n} {chapter_word(n)} here</span>
  <span class="badge">~{total_minutes} min here</span>
  {read_badge(read_n, n)}
</div>
<div class="chapter-list">{''.join(rows)}
</div>
{build_guides_section(topic, progress)}
{build_branches_section(idx, progress, topic)}
"""

    html = render_page(
        title=f"{topic['title']} — My Library",
        css_path="../../../assets/style.css",
        home_path="../../../index.html",
        breadcrumbs=breadcrumbs,
        content=body,
    )
    (topic_dir / "index.html").write_text(html, encoding="utf-8")


READ_TOGGLE = """
<div class="read-toggle">
  <div class="read-toggle-row">
    <label class="read-toggle-label">
      <input type="checkbox" class="read-checkbox" data-topic="{topic_slug}" data-chapter="{chapter_slug}" {checked} {disabled}>
      Mark this chapter as read
    </label>
    <button type="button" class="confirm-read-btn {confirm_class}">Confirm</button>
    <a href="#" class="change-read-link {change_class}">change</a>
  </div>
</div>
<script>
(function() {{
  var wrap = document.currentScript.previousElementSibling;
  var box = wrap.querySelector('.read-checkbox');
  var confirmBtn = wrap.querySelector('.confirm-read-btn');
  var changeLink = wrap.querySelector('.change-read-link');

  function save() {{
    fetch('/api/progress', {{
      method: 'POST',
      headers: {{'Content-Type': 'application/json'}},
      body: JSON.stringify({{topic: box.dataset.topic, chapter: box.dataset.chapter, read: box.checked}})
    }}).catch(function() {{}});
  }}

  confirmBtn.addEventListener('click', function() {{
    save();
    box.disabled = true;
    confirmBtn.classList.add('is-hidden');
    changeLink.classList.remove('is-hidden');
  }});

  changeLink.addEventListener('click', function(e) {{
    e.preventDefault();
    box.disabled = false;
    confirmBtn.classList.remove('is-hidden');
    changeLink.classList.add('is-hidden');
  }});

  if (location.protocol === 'file:') {{
    var note = document.createElement('p');
    note.className = 'read-toggle-note';
    note.textContent = "This won't be saved permanently \\u2014 open the library via Start Library.bat instead of double-clicking the page to keep your progress.";
    wrap.appendChild(note);
  }}
}})();
</script>
"""


def build_chapter_pages(manifest, idx, progress, topic):
    cat_slug = topic["category"]
    topic_dir = LIBRARY / "categories" / cat_slug / topic["slug"]
    chapters = topic["chapters"]
    read_slugs = set(progress.get(topic["slug"], []))

    for i, ch in enumerate(chapters):
        src = CONTENT / "categories" / cat_slug / topic["slug"] / f"{ch['slug']}.html"
        chapter_html = src.read_text(encoding="utf-8")
        words = word_count(chapter_html)
        minutes = reading_time(words)

        prev_link = ""
        if i > 0:
            prev = chapters[i - 1]
            prev_link = f'<a class="nav-link" href="{prev["slug"]}.html">&larr; {prev["title"]}</a>'
        next_link = ""
        if i < len(chapters) - 1:
            nxt = chapters[i + 1]
            next_link = f'<a class="nav-link" href="{nxt["slug"]}.html">{nxt["title"]} &rarr;</a>'

        breadcrumbs = build_breadcrumbs(manifest, idx, topic, chapter=ch)

        locked = ch["slug"] in read_slugs
        read_toggle = READ_TOGGLE.format(
            topic_slug=topic["slug"],
            chapter_slug=ch["slug"],
            checked="checked" if locked else "",
            disabled="disabled" if locked else "",
            confirm_class="is-hidden" if locked else "",
            change_class="" if locked else "is-hidden",
        )

        body = f"""
<article class="chapter">
<h1 class="page-title">{ch['title']}</h1>
<p class="chapter-meta">~{minutes} min read</p>
{chapter_html}
</article>
{read_toggle}
<div class="chapter-footer-nav">
  <div>{prev_link}</div>
  <a class="nav-link" href="index.html">All chapters</a>
  <div>{next_link}</div>
</div>
"""
        html = render_page(
            title=f"{ch['title']} — {topic['title']}",
            css_path="../../../assets/style.css",
            home_path="../../../index.html",
            breadcrumbs=breadcrumbs,
            content=body,
        )
        (topic_dir / f"{ch['slug']}.html").write_text(html, encoding="utf-8")


def build_guide_pages(manifest, idx, progress, topic):
    cat_slug = topic["category"]
    topic_dir = LIBRARY / "categories" / cat_slug / topic["slug"]
    guides = topic.get("guides", [])
    read_slugs = set(progress.get(topic["slug"], []))

    for g in guides:
        src = CONTENT / "categories" / cat_slug / topic["slug"] / f"{g['slug']}.html"
        guide_html = src.read_text(encoding="utf-8")
        words = word_count(guide_html)
        minutes = reading_time(words)

        breadcrumbs = build_breadcrumbs(manifest, idx, topic, chapter=g)

        locked = g["slug"] in read_slugs
        read_toggle = READ_TOGGLE.format(
            topic_slug=topic["slug"],
            chapter_slug=g["slug"],
            checked="checked" if locked else "",
            disabled="disabled" if locked else "",
            confirm_class="is-hidden" if locked else "",
            change_class="" if locked else "is-hidden",
        )

        body = f"""
<article class="chapter">
<h1 class="page-title">{g['title']}</h1>
<p class="chapter-meta">Field guide &middot; ~{minutes} min read</p>
{guide_html}
</article>
{read_toggle}
<div class="chapter-footer-nav">
  <div></div>
  <a class="nav-link" href="index.html">Back to topic</a>
  <div></div>
</div>
"""
        html = render_page(
            title=f"{g['title']} — {topic['title']}",
            css_path="../../../assets/style.css",
            home_path="../../../index.html",
            breadcrumbs=breadcrumbs,
            content=body,
        )
        (topic_dir / f"{g['slug']}.html").write_text(html, encoding="utf-8")


def copy_static_assets():
    dst_css_dir = LIBRARY / "assets"
    dst_css_dir.mkdir(parents=True, exist_ok=True)
    src_css = ROOT / "scripts" / "style.css"
    if src_css.exists():
        shutil.copy(src_css, dst_css_dir / "style.css")

    src_images = CONTENT / "images"
    if src_images.exists():
        dst_images = dst_css_dir / "images"
        if dst_images.exists():
            shutil.rmtree(dst_images)
        shutil.copytree(src_images, dst_images)

    src_games = CONTENT / "games"
    if src_games.exists():
        dst_games = LIBRARY / "games"
        if dst_games.exists():
            shutil.rmtree(dst_games)
        shutil.copytree(src_games, dst_games)

    src_tools = CONTENT / "tools"
    if src_tools.exists():
        dst_tools = LIBRARY / "tools"
        if dst_tools.exists():
            shutil.rmtree(dst_tools)
        shutil.copytree(src_tools, dst_tools)


def main():
    manifest = load_manifest()
    idx = TopicIndex(manifest)
    progress = load_progress()
    LIBRARY.mkdir(exist_ok=True)
    copy_static_assets()
    build_library_index(manifest, idx, progress)
    for topic in manifest["topics"]:
        build_topic_page(manifest, idx, progress, topic)
        build_chapter_pages(manifest, idx, progress, topic)
        build_guide_pages(manifest, idx, progress, topic)
    print(f"Built {len(manifest['topics'])} topic(s) into {LIBRARY}")


if __name__ == "__main__":
    main()
