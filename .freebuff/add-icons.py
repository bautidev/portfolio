"""Agrega iconos al sprite SVG ya presente en index.html.

Uso: python3 .freebuff/add-icons.py close download check
"""

import pathlib
import re
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
CDN = "https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/{name}/default/24px.svg"


def fetch(name: str) -> str:
    with urllib.request.urlopen(CDN.format(name=name), timeout=15) as response:
        svg = response.read().decode("utf-8")

    view_box = re.search(r'viewBox="([^"]+)"', svg).group(1)
    paths = re.findall(r'<path[^>]*\bd="([^"]+)"[^>]*/?>', svg)
    body = "".join(f'<path d="{d}"/>' for d in paths)
    return f'<symbol id="i-{name}" viewBox="{view_box}">{body}</symbol>'


def main(names: list[str]) -> None:
    html = INDEX.read_text(encoding="utf-8")
    added = []

    for name in names:
        if f'id="i-{name}"' in html:
            print(f"{name}: ya estaba")
            continue
        html = html.replace("\n    </svg>", f"\n        {fetch(name)}\n    </svg>", 1)
        added.append(name)

    INDEX.write_text(html, encoding="utf-8")
    print(f"agregados: {added}")


if __name__ == "__main__":
    main(sys.argv[1:])
