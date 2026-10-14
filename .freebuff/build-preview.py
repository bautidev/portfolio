"""Genera .freebuff/preview/index.html: la home con CSS, JS e imagenes embebidas.

El panel Preview sirve un solo archivo, asi que esto arma una copia autonoma.
Es descartable; el sitio real sigue siendo index.html + assets/.
"""

import base64
import mimetypes
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
PREVIEW = ROOT / ".freebuff" / "preview"
STYLES = ROOT / "assets" / "css" / "styles.css"
SCRIPTS = ROOT / "assets" / "js"


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    if path.suffix == ".webp":
        mime = "image/webp"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def inline_assets(text, base):
    """Embebe los assets, resolviendo rutas contra el archivo que las declara."""
    return re.sub(
        r'(["\'])((?:\.\./)*(?:assets)/[^"\']+)\1',
        lambda m: f'{m.group(1)}{data_uri(base / m.group(2))}{m.group(1)}',
        text,
    )


def build(page):
    html = (ROOT / page).read_text(encoding="utf-8")
    css = inline_assets(STYLES.read_text(encoding="utf-8"), STYLES.parent)
    i18n = (SCRIPTS / "i18n.js").read_text(encoding="utf-8")
    js = (SCRIPTS / "script.js").read_text(encoding="utf-8")

    html = html.replace(
        '<link rel="stylesheet" href="assets/css/styles.css">', f"<style>\n{css}\n</style>"
    )
    # El inline no se difiere, asi que va al final del body para que el DOM ya exista.
    html = html.replace('<script src="assets/js/i18n.js" defer></script>', "")
    html = html.replace('<script src="assets/js/script.js" defer></script>', "")
    inline = f"        <script>\n{i18n}\n{js}\n        </script>\n    </body>"
    html = html.replace("    </body>", inline)
    html = inline_assets(html, ROOT)

    target = PREVIEW / page
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8")
    print(f"{target} ({target.stat().st_size // 1024} KB)")


def main():
    for page in ("index.html", "404.html"):
        build(page)


if __name__ == "__main__":
    main()
