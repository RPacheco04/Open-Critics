# Generated manually

from django.db import migrations
import os
import sys
import importlib.util


def load_and_run_data_script(apps, schema_editor):
    """
    Carrega e executa o script de população do banco de dados
    """
    # Caminho para o script de população
    script_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "scripts",
        "popular_banco.py",
    )

    # Carrega o script como um módulo
    spec = importlib.util.spec_from_file_location("popular_banco", script_path)
    popular_banco = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(popular_banco)

    # Executa as funções do script
    popular_banco.criar_generos()
    popular_banco.criar_filmes()


class Migration(migrations.Migration):

    dependencies = [
        ("catalogo", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(load_and_run_data_script, migrations.RunPython.noop),
    ]
