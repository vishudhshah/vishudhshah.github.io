#!/usr/bin/env python3
"""Discover linked HTML pages from local source and same-origin project sites."""
import argparse
from collections import deque
from html.parser import HTMLParser
from pathlib import Path
import subprocess
from urllib.parse import urljoin, urlsplit, urlunsplit, unquote
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.base = None
        self.noindex = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'base':
            self.base = attrs.get('href')
        if tag == 'meta' and attrs.get('name', '').lower() in ('robots', 'googlebot'):
            self.noindex |= 'noindex' in attrs.get('content', '').lower().replace(',', ' ').split()
        key = 'href' if tag == 'a' else 'src'
        if tag in ('a', 'iframe', 'frame') and attrs.get(key):
            self.links.append(attrs[key])


def generate(base, root, output, max_pages=1000):
    root = root.resolve()
    origin = urlsplit(base)

    def normalize(url):
        parts = urlsplit(url)
        if parts.scheme not in ('http', 'https') or parts.netloc != origin.netloc:
            return None
        if parts.query:
            return None
        return urlunsplit((origin.scheme, origin.netloc, parts.path or '/', '', ''))

    def load(url):
        path = (root / unquote(urlsplit(url).path).lstrip('/')).resolve()
        if not path.is_relative_to(root):
            raise ValueError(f'Path outside site root: {url}')
        if path.is_dir():
            path = path / 'index.html'
        if path.is_file():
            if path.suffix.lower() not in ('.html', '.htm'):
                return None
            canonical_path = '/' + path.relative_to(root).as_posix()
            if canonical_path.endswith('/index.html'):
                canonical_path = canonical_path[:-10]
            return urljoin(base, canonical_path), path.read_text(encoding='utf-8')
        result = subprocess.run(
            ['curl', '--fail', '--silent', '--show-error', '--location',
             '--retry', '2', '--max-time', '30', '--max-redirs', '5',
             '--proto', '=https', '--proto-redir', '=https',
             '--write-out', '\nSITEMAP_META:%{content_type}\t%{url_effective}', url],
            capture_output=True, text=True, check=True)
        body, meta = result.stdout.rsplit('\nSITEMAP_META:', 1)
        content_type, effective = meta.split('\t')
        canonical = normalize(effective)
        if canonical and 'text/html' in content_type:
            return canonical, body
        return None

    robots = RobotFileParser()
    robots_file = root / 'robots.txt'
    robots.parse(robots_file.read_text().splitlines() if robots_file.exists() else [])
    queue = deque([base])
    seen, parsed, pages = set(), set(), set()
    while queue:
        url = queue.popleft()
        if url in seen:
            continue
        if len(seen) >= max_pages:
            raise RuntimeError('Crawl limit reached; refusing to publish a partial sitemap')
        seen.add(url)
        if not robots.can_fetch('SitemapGenerator', url):
            continue
        suffix = Path(urlsplit(url).path).suffix.lower()
        if suffix and suffix not in ('.html', '.htm'):
            continue
        loaded = load(url)
        if loaded is None:
            continue
        canonical, body = loaded
        if canonical in parsed or not robots.can_fetch('SitemapGenerator', canonical):
            continue
        parsed.add(canonical)
        parser = Links()
        parser.feed(body)
        if not parser.noindex:
            pages.add(canonical)
        link_base = urljoin(canonical, parser.base) if parser.base else canonical
        for href in parser.links:
            target = normalize(urljoin(link_base, href))
            if target and target not in seen:
                queue.append(target)
    if not pages:
        raise RuntimeError('No HTML pages discovered')
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    ns = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    sitemap = ET.Element(ns + 'urlset')
    for url in sorted(pages):
        ET.SubElement(ET.SubElement(sitemap, ns + 'url'), ns + 'loc').text = url
    ET.indent(sitemap, space='  ')
    output.parent.mkdir(parents=True, exist_ok=True)
    ET.ElementTree(sitemap).write(output, encoding='utf-8', xml_declaration=True)
    print(f'Generated {output} with {len(pages)} pages:')
    print('\n'.join(sorted(pages)))
    return pages


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base-url', default='https://vishudhshah.github.io/')
    parser.add_argument('--root', type=Path, default=Path('.'))
    parser.add_argument('--output', type=Path, default=Path('_site/sitemap.xml'))
    args = parser.parse_args()
    generate(args.base_url, args.root, args.output)
