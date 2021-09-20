from jinja2 import Environment,FileSystemLoader
import subprocess
from serverAction.db import getSupplier_db
from pathlib import Path

def supplierPdfReport(supplierId):
    if supplier := getSupplier_db(supplierId):
        templatePath = Path(__file__).parent.joinpath('templates')
        env = Environment(
            variable_start_string = r'\var{',
            variable_end_string = '}',
            loader=FileSystemLoader(templatePath)
        )

        template = env.get_template('supplierReport.tex.jinja')
        doc = template.render(title = "jinja test")
        with open('index.tex','w') as output:
            output.write(doc)
        finishedProcess = subprocess.run(['latexmk',"-auxdir=auxilary","-outdir=output","-pdf","-quiet",'index.tex'])