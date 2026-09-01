"""
Local server for the learning library.

Serves the static site (identical to opening library/index.html directly)
but additionally exposes POST /api/progress, which persists "mark as read"
state to content/progress.json and rebuilds the static pages so read
checkmarks and badges show up everywhere immediately.

This is the only way ticks can be saved permanently: a page opened via
file:// (double-clicking the html) has no way to write to disk at all.

Run with:
    python scripts/serve.py
or just double-click Start Library.bat in the project root.
"""
import json
import sys
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
ROOT = SCRIPTS_DIR.parent
LIBRARY = ROOT / "library"
PROGRESS = ROOT / "content" / "progress.json"
PORT = 8765

sys.path.insert(0, str(SCRIPTS_DIR))
import build as sitebuild  # noqa: E402


def load_progress():
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text(encoding="utf-8"))
    return {}


def save_progress(data):
    PROGRESS.write_text(json.dumps(data, indent=2, sort_keys=True), encoding="utf-8")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(LIBRARY), **kwargs)

    def do_POST(self):
        if self.path != "/api/progress":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length))
            topic = payload["topic"]
            chapter = payload["chapter"]
            read = bool(payload["read"])
        except (KeyError, ValueError):
            self.send_error(400)
            return

        data = load_progress()
        chapters = set(data.get(topic, []))
        if read:
            chapters.add(chapter)
        else:
            chapters.discard(chapter)
        data[topic] = sorted(chapters)
        save_progress(data)

        sitebuild.main()

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b"{}")

    def log_message(self, format, *args):
        pass


def main():
    sitebuild.main()
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    url = f"http://127.0.0.1:{PORT}/"
    print(f"My Library running at {url}")
    print("Press Ctrl+C in this window to stop.")
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
