"""Genera dos PDFs placeholder (ES/EN) para el boton de descargar CV.

Minimal PDF 1.4 a mano, sin dependencias. Es descartable: se reemplazan por el
CV real sobrescribiendo los mismos archivos.
"""

import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "cv"

ES = [
    "ESTE ES UN ARCHIVO DE EJEMPLO",
    "",
    "Reemplazalo por tu CV real en PDF con el mismo nombre de archivo:",
    "assets/cv/bautista-avila-cv-es.pdf",
    "assets/cv/bautista-avila-cv-en.pdf",
    "",
    "El boton 'Descargar CV' del sitio ya apunta a estos archivos.",
]

EN = [
    "THIS IS A PLACEHOLDER FILE",
    "",
    "Replace it with your real CV in PDF, keeping the same file name:",
    "assets/cv/bautista-avila-cv-es.pdf",
    "assets/cv/bautista-avila-cv-en.pdf",
    "",
    "The 'Download CV' button on the site already points to these files.",
]


def escape(text: str) -> str:
    return text.replace("\\", r"\\").replace("(", r"\(").replace(")", r"\)")


def build(lines: list[str]) -> bytes:
    body = "BT\n/F1 12 Tf\n72 742 Td\n18 TL\n"
    body += "".join(f"({escape(line)}) Tj T*\n" for line in lines)
    body += "ET\n"
    stream = body.encode("ascii")

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] "
        b"/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"endstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = []

    for number, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += f"{number} 0 obj\n".encode() + obj + b"\nendobj\n"

    xref_at = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n".encode()
    pdf += b"0000000000 65535 f \n"
    for offset in offsets:
        pdf += f"{offset:010d} 00000 n \n".encode()

    pdf += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_at}\n%%EOF\n"
    ).encode()

    return bytes(pdf)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for name, lines in (("bautista-avila-cv-es.pdf", ES), ("bautista-avila-cv-en.pdf", EN)):
        path = OUT / name
        path.write_bytes(build(lines))
        print(f"{path} -> {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
