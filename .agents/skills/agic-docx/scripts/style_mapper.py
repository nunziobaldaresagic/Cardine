"""AGIC Style Mapper - Maps markdown elements to AGIC template styles.

Part of the agic-docx skill.
"""

from pathlib import Path
from typing import Dict, Optional
import json


class AGICStyleMapper:
    """Maps markdown elements to AGIC Word template styles."""
    
    # Default style mappings (based on template-styles.json)
    STYLE_MAP = {
        # Headings
        "h2": "AGICTitoloParagrafo",  # AGIC Titolo Paragrafo
        "h3": "AGICTitolo2",          # AGIC Titolo 2
        "h4": "AGICTitolo3",          # AGIC Titolo 3
        "h5": "AGICTitolo3",
        "h6": "AGICTitolo3",
        
        # Paragraph styles
        "paragraph": "AGICcorpo",       # AGIC corpo (normal text)
        "list_bullet": "AMElencopuntato",  # AM Elenco puntato
        "list_number": "AMElencopuntato",  # Reuse bullet style for numbered
        
        # Code/preformatted
        "code_block": "AGICcorpo",      # Use normal style with monospace font
        
        # Tables use default table styling
        "table": None,  # Will use Word's built-in table grid
    }
    
    def __init__(self, template_styles_path: Optional[Path] = None):
        """Initialize mapper with optional custom template styles.
        
        Args:
            template_styles_path: Path to template-styles.json (optional)
        """
        self.available_styles = {}
        
        if template_styles_path and template_styles_path.exists():
            self._load_styles(template_styles_path)
    
    def _load_styles(self, json_path: Path):
        """Load available styles from template-styles.json."""
        with open(json_path, "r", encoding="utf-8") as f:
            styles = json.load(f)
            for style in styles:
                if style.get("type") == "paragraph":
                    self.available_styles[style.get("styleId")] = style.get("name")
    
    def get_style_for_heading(self, level: int) -> str:
        """Get AGIC style for heading level (1-6).
        
        Args:
            level: Heading level (1-6)
        
        Returns:
            Style ID string
        """
        if level <= 1:
            raise ValueError(
                "Heading level 1 is reserved for the document title/cover page."
            )
        key = f"h{min(level, 6)}"
        return self.STYLE_MAP.get(key, "AGICcorpo")
    
    def get_style_for_paragraph(self) -> str:
        """Get AGIC style for normal paragraph."""
        return self.STYLE_MAP["paragraph"]
    
    def get_style_for_list(self, ordered: bool = False) -> str:
        """Get AGIC style for list items.
        
        Args:
            ordered: True for numbered list, False for bullet list
        
        Returns:
            Style ID string
        """
        key = "list_number" if ordered else "list_bullet"
        return self.STYLE_MAP.get(key, "AGICcorpo")
    
    def get_style_for_code_block(self) -> str:
        """Get AGIC style for code blocks."""
        return self.STYLE_MAP["code_block"]
    
    def validate_style(self, style_id: str) -> bool:
        """Check if a style ID exists in the template.
        
        Args:
            style_id: Style ID to validate
        
        Returns:
            True if style exists (or no styles loaded), False otherwise
        """
        if not self.available_styles:
            return True  # Assume valid if we haven't loaded the style catalog
        return style_id in self.available_styles
