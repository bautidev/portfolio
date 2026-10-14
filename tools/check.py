"""Chequeo del sitio. Corre con: python3 tools/check.py

Verifica lo que es facil romper a mano:
  1. Cada clave usada en el HTML existe en los dos idiomas.
  2. No quedan claves muertas en el diccionario.
  3. Cada asset local referenciado existe en disco.
  4. Cada URL absoluta al dominio apunta a un archivo que existe.

Sin dependencias. Sale con codigo 1 si algo falla.
"""

import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
HTML_FILES = sorted(ROOT.glob("*.html"))
I18N = ROOT / "assets" / "js" / "i18n.js"
SCRIPT = ROOT / "assets" / "js" / "script.js"
KEY_IN_HTML = re.compile(r'data-i18n(?:-[a-z-]+)?="([^"]+)"')
KEY_IN_DICT = re.compile(r"^ {4}'([^']+)':", re.M)
I18N_ATTR = re.compile(r'data-i18n(?:-[a-z-]+)?="[^"]*"')
ASSET = re.compile(r'(?:src|href)="([^"#:]+)"')
HOST_URL = re.compile(r"https://portfolio\.bautiavila\.com(/[^\"'\s>)]*)")
SKIP_PREFIX = ("http", "mailto:", "data:", "//")


def dictionary_keys(source: str) -> tuple[set[str], set[str]]:
    es_part, en_part = source.split("  en: {", 1)
    return set(KEY_IN_DICT.findall(es_part)), set(KEY_IN_DICT.findall(en_part))


def main() -> int:
    i18n = I18N.read_text(encoding="utf-8")
    script = SCRIPT.read_text(encoding="utf-8")
    es, en = dictionary_keys(i18n)

    pages = {page.name: page.read_text(encoding="utf-8") for page in HTML_FILES}
    used = {key for html in pages.values() for key in KEY_IN_HTML.findall(html)}

    problems = []

    for key in sorted(used - es):
        problems.append(f"falta en ES: {key}")
    for key in sorted(used - en):
        problems.append(f"falta en EN: {key}")
    for key in sorted((es | en) - used):
        # Algunas claves se arman por JS (rotulos de la galeria, aria del menu).
        if key not in script:
            problems.append(f"clave sin usar: {key}")

    for name, html in pages.items():
        clean = I18N_ATTR.sub("", html)

        for asset in ASSET.findall(clean):
            if asset.startswith(SKIP_PREFIX) or not asset:
                continue
            if not (ROOT / asset).exists():
                problems.append(f"{name}: asset inexistente {asset}")

        for path in HOST_URL.findall(clean):
            # "/" y "/?lang=en" apuntan a la home, no a un archivo.
            if path == "/" or path.startswith("/?"):
                continue
            if not (ROOT / path.lstrip("/")).exists():
                problems.append(f"{name}: URL absoluta inexistente https://portfolio.bautiavila.com{path}")

    for problem in problems:
        print(f"FALLA  {problem}")

    print(f"{len(used)} claves usadas, {len(es)} en ES, {len(en)} en EN, {len(pages)} paginas")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
