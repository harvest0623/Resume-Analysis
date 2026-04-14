import pdfplumber
import re
from typing import Dict, Any, List


class PDFParser:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text = ""
        self.lines = []

    def extract_text(self) -> str:
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for page in pdf.pages:
                    self.text += page.extract_text() or ""
                    self.lines.extend(page.extract_text().split("\n") if page.extract_text() else [])
            return self.text
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return ""

    def get_text(self) -> str:
        if not self.text:
            self.extract_text()
        return self.text

    def get_lines(self) -> List[str]:
        if not self.lines:
            self.extract_text()
        return self.lines
