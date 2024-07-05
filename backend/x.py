import subprocess
import uuid


pdf_id = uuid.uuid4().hex
pdf_id = "b45a36001c744b1f9bb962c616271b22"
pdfs_directory = "outputs"
# with open(f"{pdfs_directory}/{pdf_id}.tex", "w") as tex_file:
#     tex_file.write(r"""
# \documentclass{article}

# \begin{document}
# Hello World
# \end{document}
# """)

subprocess.call(["pdflatex", f"{pdfs_directory}/{pdf_id}.tex"])