"""Genera imagenes placeholder (1200x675) para las galerias de proyectos.

Rasterizador minimalista en Python puro + cwebp. Es un script descartable:
una vez que las imagenes reales reemplacen a los placeholders, se puede borrar.
"""

import math
import pathlib
import shutil
import struct
import subprocess
import tempfile
import zlib

W, H = 1200, 675
OUT = pathlib.Path("assets/images/projects")

BLUE = (96, 165, 250)
TEAL = (94, 234, 212)
WHITE = (226, 232, 240)
MUTED = (100, 116, 139)
DIM = (51, 65, 85)
LINE = (30, 41, 59)
PANEL = (15, 23, 42)
DEEP = (8, 15, 30)


class Canvas:
    def __init__(self, top, bottom):
        self.px = bytearray(W * H * 3)
        for y in range(H):
            t = y / (H - 1)
            color = bytes(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
            self.px[y * W * 3:(y + 1) * W * 3] = color * W

    def blend(self, x, y, color, alpha=1.0):
        if x < 0 or y < 0 or x >= W or y >= H or alpha <= 0:
            return
        i = (y * W + x) * 3
        p = self.px
        rest = 1 - alpha
        p[i] = int(p[i] * rest + color[0] * alpha)
        p[i + 1] = int(p[i + 1] * rest + color[1] * alpha)
        p[i + 2] = int(p[i + 2] * rest + color[2] * alpha)

    def rect(self, x0, y0, x1, y1, color, alpha=1.0):
        for y in range(max(0, int(y0)), min(H, int(y1))):
            for x in range(max(0, int(x0)), min(W, int(x1))):
                self.blend(x, y, color, alpha)

    def disc(self, cx, cy, r, color, alpha=1.0):
        for y in range(int(cy - r), int(cy + r) + 1):
            dy = y - cy
            dx = math.sqrt(max(0.0, r * r - dy * dy))
            for x in range(int(cx - dx), int(cx + dx) + 1):
                self.blend(x, y, color, alpha)

    def rounded(self, x0, y0, x1, y1, r, color, alpha=1.0):
        self.rect(x0 + r, y0, x1 - r, y1, color, alpha)
        self.rect(x0, y0 + r, x1, y1 - r, color, alpha)
        for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
            self.disc(cx, cy, r, color, alpha)

    def panel(self, x0, y0, x1, y1, r, color, alpha=1.0, border=LINE, border_alpha=1.0):
        if border is not None:
            self.rounded(x0, y0, x1, y1, r, border, border_alpha)
            self.rounded(x0 + 1.5, y0 + 1.5, x1 - 1.5, y1 - 1.5, max(0, r - 1), color, alpha)
        else:
            self.rounded(x0, y0, x1, y1, r, color, alpha)

    def bar(self, x, y, w, h, color=DIM, alpha=1.0):
        self.rounded(x, y, x + w, y + h, h / 2, color, alpha)

    def ring(self, cx, cy, r, thickness, color, alpha=1.0):
        outer = r + thickness / 2
        inner = max(0.0, r - thickness / 2)
        for y in range(int(cy - outer), int(cy + outer) + 1):
            dy = y - cy
            if abs(dy) > outer:
                continue
            d_out = math.sqrt(max(0.0, outer * outer - dy * dy))
            d_in = math.sqrt(max(0.0, inner * inner - dy * dy))
            for x in range(int(cx - d_out), int(cx - d_in) + 1):
                self.blend(x, y, color, alpha)
            for x in range(int(cx + d_in), int(cx + d_out) + 1):
                self.blend(x, y, color, alpha)

    def wedge(self, cx, cy, r, start, end, color, alpha=0.55, steps=70):
        for i in range(steps):
            angle = start + (end - start) * i / (steps - 1)
            ca, sa = math.cos(angle), math.sin(angle)
            for step in range(int(r)):
                fade = alpha * (1 - step / r) ** 1.6
                self.blend(int(cx + step * ca), int(cy + step * sa), color, fade)

    def blip(self, cx, cy, r, color):
        self.disc(cx, cy, r * 2.4, color, 0.14)
        self.disc(cx, cy, r * 1.6, color, 0.28)
        self.disc(cx, cy, r, color, 0.95)

    def spread(self, x, y, rows, w=150, h=14, gap=34, alpha=0.9):
        for i in range(rows):
            self.bar(x, y + i * gap, w * (0.6 + 0.4 * ((rows - i) / rows)), h, DIM, alpha)

    def png_bytes(self):
        raw = bytearray()
        stride = W * 3
        for y in range(H):
            raw.append(0)
            raw += self.px[y * stride:(y + 1) * stride]

        def chunk(tag, data):
            return (
                struct.pack(">I", len(data))
                + tag
                + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
            )

        out = b"\x89PNG\r\n\x1a\n"
        out += chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0))
        out += chunk(b"IDAT", zlib.compress(bytes(raw), 6))
        out += chunk(b"IEND", b"")
        return out

    def save(self, name):
        tmp = pathlib.Path(tempfile.gettempdir()) / f"{name}.png"
        tmp.write_bytes(self.png_bytes())
        target = OUT / f"{name}.webp"
        subprocess.run(
            ["cwebp", "-quiet", "-q", "84", "-m", "6", str(tmp), "-o", str(target)],
            check=True,
        )
        tmp.unlink()
        print(f"{target} -> {target.stat().st_size // 1024} KB")


def chrome(canvas, accent=BLUE):
    """Barra superior + sidebar, iguales en las dos capturas del inventario."""
    canvas.rect(0, 0, W, 64, (13, 20, 36), 0.95)
    canvas.rect(0, 63, W, 65, LINE, 0.9)
    canvas.rounded(28, 18, 56, 46, 8, accent, 0.9)
    canvas.bar(72, 26, 96, 12, WHITE, 0.85)
    canvas.panel(1000, 18, 1168, 46, 8, (10, 17, 32), 0.9)


def sidebar(canvas, active=0):
    canvas.rect(0, 65, 210, H, (11, 17, 31), 0.92)
    canvas.rect(209, 65, 210, H, LINE, 0.8)
    for i in range(6):
        y = 96 + i * 46
        if i == active:
            canvas.rounded(20, y - 6, 190, y + 26, 8, accent_soft())
            canvas.bar(60, y + 3, 96, 12, (147, 197, 253), 0.95)
        else:
            canvas.bar(60, y + 3, 82, 12, DIM, 0.85)
        canvas.rounded(30, y + 1, 46, y + 17, 4, MUTED, 0.6)


def accent_soft():
    return (37, 99, 235)


def inventario_prestamos():
    canvas = Canvas((11, 17, 32), (16, 24, 43))
    chrome(canvas)
    sidebar(canvas, active=2)

    canvas.bar(232, 96, 210, 16, WHITE, 0.9)
    canvas.bar(232, 124, 300, 10, MUTED, 0.7)
    canvas.panel(1000, 96, 1168, 136, 10, (37, 99, 235), 0.9)
    canvas.bar(1024, 110, 120, 12, (219, 234, 254), 0.9)

    canvas.panel(232, 168, 1168, 640, 12, PANEL, 0.85)

    headers = (190, 470, 720, 940)
    widths = (150, 180, 130, 150)
    for x, w in zip(headers, widths):
        canvas.bar(x, 200, w, 10, MUTED, 0.9)

    rows = 6
    for i in range(rows):
        y = 240 + i * 64
        if i:
            canvas.rect(256, y - 22, 1144, y - 21, LINE, 0.75)
        canvas.rounded(190, y - 6, 226, y + 30, 8, DIM, 0.95)
        canvas.bar(196, y + 6, 20, 12, (148, 163, 184), 0.8)
        canvas.bar(248, y, 190, 12, WHITE, 0.75)
        canvas.bar(248, y + 20, 130, 9, MUTED, 0.6)
        canvas.bar(470, y + 4, 150, 11, WHITE, 0.6)
        canvas.bar(722, y + 4, 120, 11, MUTED, 0.75)
        # chip de estado: vencido (ambar) / a termino (azul)
        tone = (251, 191, 36) if i % 3 == 0 else BLUE
        canvas.rounded(940, y - 2, 1072, y + 26, 14, tone, 0.18)
        canvas.bar(952, y + 7, 108, 10, tone, 0.85)

    canvas.panel(190, 622, 470, 664, 10, (37, 99, 235), 0.9)
    canvas.bar(214, 638, 232, 12, (219, 234, 254), 0.9)
    return canvas


def inventario_form():
    canvas = Canvas((11, 17, 32), (16, 24, 43))
    chrome(canvas)
    sidebar(canvas, active=4)

    canvas.bar(232, 96, 190, 16, WHITE, 0.9)
    canvas.bar(232, 124, 260, 10, MUTED, 0.7)

    canvas.panel(232, 168, 1168, 640, 12, PANEL, 0.85)
    canvas.bar(268, 200, 190, 14, WHITE, 0.9)
    canvas.rect(268, 232, 1132, 233, LINE, 0.9)

    labels = ("Nombre del ítem", "Categoría", "Cantidad", "Fecha de alta")
    fields = ((276, 300), (724, 300), (276, 404), (724, 404))
    for label, (x, y) in zip(labels, fields):
        canvas.bar(x, y - 24, 130, 9, MUTED, 0.8)
        canvas.panel(x, y, x + 420, y + 46, 8, (8, 15, 30), 0.95)
        canvas.bar(x + 16, y + 17, 180 + (x % 60), 12, WHITE, 0.45)
        canvas.rounded(x + 396, y + 12, x + 408, y + 24, 3, MUTED, 0.6)

    canvas.panel(276, 486, 1004, 606, 10, (10, 17, 32), 0.9)
    canvas.bar(300, 506, 200, 11, WHITE, 0.7)
    canvas.bar(300, 528, 640, 9, MUTED, 0.55)
    canvas.bar(300, 546, 560, 9, MUTED, 0.45)
    canvas.bar(300, 570, 300, 9, MUTED, 0.35)

    canvas.rounded(276, 618, 520, 664, 8, (37, 99, 235), 1.0)
    canvas.bar(340, 634, 116, 14, (224, 236, 255), 0.95)
    return canvas


def radar_pantalla():
    canvas = Canvas((4, 14, 22), (9, 30, 36))
    canvas.rect(0, 0, W, 64, (6, 20, 26), 0.9)
    canvas.rect(0, 63, W, 65, (17, 58, 62), 0.9)
    canvas.rounded(28, 18, 56, 46, 8, TEAL, 0.85)
    canvas.bar(72, 26, 220, 12, (204, 251, 241), 0.85)

    cx, cy, radius = 430, 356, 276
    canvas.disc(cx, cy, radius, (11, 38, 43), 0.85)
    for factor in (0.28, 0.52, 0.76, 1.0):
        canvas.ring(cx, cy, radius * factor, 2.5, (45, 212, 191), 0.35)
    canvas.rect(cx - radius, cy - 1, cx + radius, cy + 1, (45, 212, 191), 0.25)
    canvas.rect(cx - 1, cy - radius, cx + 1, cy + radius, (45, 212, 191), 0.25)

    canvas.wedge(cx, cy, radius, -1.95, -1.25, TEAL, 0.5)
    canvas.rect(cx, cy - 2, cx + radius, cy + 2, (204, 251, 241), 0.85)

    for angle, dist, size in ((-0.4, 0.68, 7), (0.55, 0.42, 6), (1.9, 0.86, 8), (2.6, 0.55, 5)):
        canvas.blip(cx + radius * dist * math.cos(angle), cy + radius * dist * math.sin(angle), size, TEAL)

    canvas.panel(800, 100, 1170, 610, 14, (7, 26, 30), 0.9, border=(17, 58, 62))
    canvas.bar(836, 132, 170, 13, (204, 251, 241), 0.9)
    canvas.bar(836, 158, 260, 9, (94, 234, 212), 0.5)

    for i, height in enumerate((70, 120, 168, 96, 140, 184)):
        x = 844 + i * 52
        canvas.rounded(x, 480 - height, x + 34, 480, 6, (17, 94, 89), 0.9)
        canvas.rounded(x, 480 - height, x + 34, 480 - height + 14, 6, TEAL, 0.85)

    canvas.bar(836, 512, 300, 12, WHITE, 0.6)
    canvas.bar(836, 540, 210, 9, MUTED, 0.6)
    canvas.bar(836, 566, 260, 9, MUTED, 0.45)
    return canvas


def radar_cuerpo():
    canvas = Canvas((9, 15, 29), (19, 28, 43))
    canvas.rect(0, 0, W, H, (30, 41, 59), 0.0)

    for x in range(0, W, 80):
        canvas.rect(x, 0, x + 1, H, WHITE, 0.03)
    for y in range(0, H, 80):
        canvas.rect(0, y, W, y + 1, WHITE, 0.03)

    canvas.disc(600, 600, 400, (2, 6, 23), 0.55)
    canvas.rounded(300, 548, 900, 604, 26, (24, 34, 50), 0.95)

    # cabeza del radar, con capas de impresion 3D
    canvas.disc(600, 330, 176, (46, 62, 82), 0.95)
    canvas.disc(600, 322, 168, (58, 78, 101), 0.9)
    for i in range(9):
        canvas.rect(444, 244 + i * 20, 756, 246 + i * 20, (15, 23, 42), 0.18)
    canvas.disc(600, 330, 176, TEAL, 0.0)
    canvas.ring(600, 330, 176, 3, (125, 211, 252), 0.35)

    # ojos
    canvas.disc(544, 300, 26, (9, 15, 29), 0.95)
    canvas.disc(656, 300, 26, (9, 15, 29), 0.95)
    canvas.disc(538, 292, 8, (203, 213, 225), 0.5)
    canvas.disc(650, 292, 8, (203, 213, 225), 0.5)

    # luz de indicacion de distancia
    canvas.disc(470, 470, 30, (251, 191, 36), 0.16)
    canvas.disc(470, 470, 16, (251, 191, 36), 0.85)

    # soporte y sensor ultrasonico
    canvas.rounded(576, 128, 624, 202, 8, (148, 163, 184), 0.5)
    canvas.panel(470, 40, 730, 148, 20, (51, 65, 85), 0.98, border=(148, 163, 184), border_alpha=0.6)
    for cx in (536, 664):
        canvas.disc(cx, 94, 38, (15, 23, 42), 0.9)
        canvas.disc(cx, 94, 32, (203, 213, 225), 0.85)
        canvas.disc(cx, 94, 20, (148, 163, 184), 0.7)
        canvas.disc(cx, 94, 8, (71, 85, 105), 0.9)
    return canvas


def main():
    if not shutil.which("cwebp"):
        raise SystemExit("Falta cwebp (brew install webp)")
    OUT.mkdir(parents=True, exist_ok=True)
    inventario_prestamos().save("inventario-2")
    inventario_form().save("inventario-3")
    radar_pantalla().save("radar-2")
    radar_cuerpo().save("radar-3")


if __name__ == "__main__":
    main()
