"""Mermaid diagram renderer - Converts Mermaid source to PNG images.

Part of the agic-docx skill.
"""

import subprocess
import tempfile
from pathlib import Path
from typing import Optional


class MermaidRenderer:
    """Renders Mermaid diagrams to PNG images using mermaid-cli (mmdc)."""
    
    def __init__(self, cli_path: Optional[str] = None):
        """Initialize Mermaid renderer.
        
        Args:
            cli_path: Path to mmdc command. If None, searches PATH.
        """
        self.mmdc_path = cli_path or "mmdc"
        self._available = None
    
    def is_available(self) -> bool:
        """Check if mermaid-cli (mmdc) is available.
        
        Returns:
            True if mmdc command can be executed
        """
        if self._available is not None:
            return self._available
        
        try:
            result = subprocess.run(
                [self.mmdc_path, "--version"],
                capture_output=True,
                timeout=5,
                text=True
            )
            self._available = result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            self._available = False
        
        return self._available
    
    def render_to_png(
        self,
        mermaid_source: str,
        output_path: Path,
        background: str = "transparent",
        scale: int = 2
    ) -> bool:
        """Render Mermaid source code to PNG image.
        
        Args:
            mermaid_source: Mermaid diagram source code
            output_path: Path where PNG should be saved
            background: Background color (default: "transparent")
            scale: Scale factor for rendering (default: 2)
        
        Returns:
            True if rendering succeeded, False otherwise
        """
        if not self.is_available():
            return False
        
        # Create temporary input file
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".mmd",
            delete=False,
            encoding="utf-8"
        ) as tmp:
            tmp.write(mermaid_source)
            tmp_path = Path(tmp.name)
        
        try:
            # Ensure output directory exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Run mmdc
            cmd = [
                self.mmdc_path,
                "-i", str(tmp_path),
                "-o", str(output_path),
                "--backgroundColor", background,
                "--scale", str(scale),
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                timeout=30,
                text=True
            )
            
            success = result.returncode == 0 and output_path.exists()
            
            if not success and result.stderr:
                print(f"Mermaid rendering failed: {result.stderr}")
            
            return success
            
        except (subprocess.TimeoutExpired, Exception) as e:
            print(f"Mermaid rendering error: {e}")
            return False
        finally:
            # Clean up temporary file
            try:
                tmp_path.unlink()
            except Exception:
                pass
    
    def render(self, mermaid_source: str) -> Optional[bytes]:
        """Render Mermaid source to PNG and return image bytes.
        
        Convenience method for markdown conversion pipeline.
        
        Args:
            mermaid_source: Mermaid diagram source code
        
        Returns:
            PNG image bytes if successful, None otherwise
        """
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = Path(tmp.name)
        
        try:
            if self.render_to_png(mermaid_source, tmp_path):
                with open(tmp_path, "rb") as f:
                    return f.read()
            return None
        finally:
            try:
                tmp_path.unlink()
            except Exception:
                pass
