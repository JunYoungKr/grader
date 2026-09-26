"""Read-only HTTP smoke audit. Usage: python3 scripts/audit-growth.py [base URL]."""
import concurrent.futures
import json
import re
import struct
import subprocess
import sys
import urllib.parse
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://grader.co.kr").rstrip("/")
CANONICAL = "https://grader.co.kr"


def fetch(path):
    result = subprocess.run(
        ["curl", "-fsS", "--max-time", "25", BASE + path],
        capture_output=True, check=True,
    )
    return result.stdout


class Page(HTMLParser):
    def __init__(self, raw):
        super().__init__()
        self.meta, self.canonical, self.ld, self.links = {}, [], [], []
        self.assets = set()
        self.h1, self.hidden, self.inld = 0, False, False
        self.visible = []
        self.feed(raw)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        resource = a.get("src") if tag == "script" else a.get("href") if tag == "link" and a.get("rel") == "stylesheet" else None
        if resource and resource.startswith("/_next/static/"):
            self.assets.add(resource)
        if tag == "meta":
            self.meta[a.get("name") or a.get("property")] = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href", ""))
        if tag == "script":
            self.inld = a.get("type") == "application/ld+json"
        if tag in ("script", "style"):
            self.hidden = True
        if tag == "h1":
            self.h1 += 1
        if tag == "a" and a.get("data-ga") == "affiliate":
            self.links.append(a)

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.hidden = self.inld = False

    def handle_data(self, data):
        if self.inld:
            self.ld.append(json.loads(data))
        if not self.hidden:
            self.visible.append(data)


def check(url):
    path = urllib.parse.urlsplit(url).path or "/"
    raw = fetch(path).decode()
    p = Page(raw)
    assert [x.rstrip("/") for x in p.canonical] == [(CANONICAL + path).rstrip("/")], (path, "canonical")
    assert p.meta.get("og:url", "").rstrip("/") == (CANONICAL + path).rstrip("/"), (path, "og:url")
    assert p.meta.get("og:image") == CANONICAL + "/og", (path, "og:image")
    assert p.meta.get("twitter:card") == "summary_large_image", (path, "twitter")
    assert "noindex" not in p.meta.get("robots", ""), (path, "index")
    assert p.h1 == 1, (path, "h1", p.h1)
    assert not re.search(r"[·•‧・∙⋅—–]", "".join(p.visible)), (path, "copy separators")
    nodes = [node for ld in p.ld for node in ld.get("@graph", [ld])]
    types = [node.get("@type") for node in nodes]
    assert "Organization" in types and "WebSite" in types, (path, types)
    if path.startswith("/category/"):
        assert "BreadcrumbList" in types, path
    if path not in ("/", "/about", "/privacy", "/browse") and not path.startswith("/category/"):
        assert "Article" in types and "BreadcrumbList" in types, path
        assert next(n for n in nodes if n.get("@type") == "Article").get("dateModified"), path
        assert "페이지 수정일" in "".join(p.visible), path
    for link in p.links:
        assert link.get("href", "").startswith("https://"), (path, "affiliate URL")
        assert {"sponsored", "nofollow", "noopener"} <= set(link.get("rel", "").split()), (path, "affiliate rel")
        assert link.get("data-ga-placement"), (path, "placement")
    if BASE == CANONICAL:
        assert p.meta.get("naver-site-verification") == "32157ad170e0eeeadae236dcea5cf80e108740df", (path, "naver")
        assert "G-5BFCE8KNPS" in raw, (path, "GA")
    return {"path": path, "schema": types, "affiliate_links": len(p.links), "assets": sorted(p.assets)}


root = ET.fromstring(fetch("/sitemap.xml"))
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [node.text for node in root.findall("s:url/s:loc", ns)]
assert len(urls) == len(set(urls)), "duplicate sitemap URL"
assert {CANONICAL + "/browse", CANONICAL + "/about", CANONICAL + "/privacy"} <= set(urls)
assert not any("/saved" in u or "?" in u or "/admin" in u for u in urls)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(check, urls))
assets = sorted({asset for result in results for asset in result.pop("assets")})
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for asset, content in zip(assets, pool.map(fetch, assets)):
        assert content and not content.lstrip().lower().startswith(b"<!doctype html"), (asset, "static asset")
for path, canonical in [("/saved", "/saved"), ("/browse?q=audit-no-match-629", "/browse"), ("/browse?category=food", "/browse")]:
    p = Page(fetch(path).decode())
    assert "noindex" in p.meta.get("robots", ""), (path, "noindex")
    assert p.canonical == [CANONICAL + canonical], (path, "canonical")
png = fetch("/og")
assert png.startswith(b"\x89PNG\r\n\x1a\n") and struct.unpack(">II", png[16:24]) == (1200, 630)
rss_items = ET.fromstring(fetch("/feed.xml")).findall("channel/item")
assert len(rss_items) > 0, "RSS is empty"
robots = fetch("/robots.txt").decode()
assert "Disallow: /admin" in robots and CANONICAL + "/sitemap.xml" in robots
headers = subprocess.check_output(["curl", "-sSI", "--max-time", "25", BASE + "/admin/login"]).decode().lower()
assert "x-robots-tag: noindex, nofollow" in headers
missing = subprocess.check_output(["curl", "-sS", "--max-time", "25", "-o", "/dev/null", "-w", "%{http_code}", BASE + "/growth-audit-nonexistent-page"]).decode()
assert missing == "404", missing
print(json.dumps({"status": "passed", "base": BASE, "pages": len(results), "static_assets": len(assets), "feed_items": len(rss_items), "private_variants": "noindex", "og": "1200x630 PNG", "checks": results}, ensure_ascii=False, indent=2))
