import barcode
from barcode import writer
from barcode.writer import SVGWriter
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os


class LabelGenerator:
    def generate_barcode(self, barcode_input):
        generated_barcode = barcode.get("code128", str(barcode_input), writer=SVGWriter())
        generated_barcode.save("test")


if __name__ == "__main__":
    LG = LabelGenerator()

    LG.generate_barcode("bartsuper123")
