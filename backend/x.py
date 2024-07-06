import subprocess
import uuid


pdf_id = uuid.uuid4().hex
pdf_id = "ec197f65892347a29f72062476079f7e"
pdfs_directory = "outputs"
# with open(f"{pdfs_directory}/{pdf_id}.tex", "w") as tex_file:
#     tex_file.write(r"""
# \documentclass{article}

# \begin{document}
# Hello World
# \end{document}
# """)

subprocess.call(["pdflatex", "-interaction=nonstopmode", "-halt-on-error",  f"{pdfs_directory}/{pdf_id}.tex"])