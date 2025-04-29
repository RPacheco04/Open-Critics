#!/usr/bin/env python
import os
import sys
import django
from django.db import connection

# Configurar o ambiente Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "filmes_project.settings")
django.setup()

from catalogo.models import Filme, Genero
from django.db.utils import IntegrityError


def resetar_sequencia(model_name):
    """Reseta a sequência de IDs para um modelo específico"""
    with connection.cursor() as cursor:
        cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{model_name}';")


def criar_generos():
    """Cria gêneros de exemplo com IDs específicos"""
    # Limpar gêneros existentes (opcional, depende da estratégia)
    Genero.objects.all().delete()

    # Resetar sequência para garantir que os IDs começam do 1
    resetar_sequencia("catalogo_genero")

    generos = [
        {"id": 1, "nome": "Ação"},
        {"id": 2, "nome": "Aventura"},
        {"id": 3, "nome": "Comédia"},
        {"id": 4, "nome": "Drama"},
        {"id": 5, "nome": "Ficção Científica"},
        {"id": 6, "nome": "Terror"},
        {"id": 7, "nome": "Romance"},
        {"id": 8, "nome": "Fantasia"},
        {"id": 9, "nome": "Animação"},
        {"id": 10, "nome": "Documentário"},
        {"id": 11, "nome": "Crime"},
        {"id": 12, "nome": "Suspense"},
    ]

    # Usar SQL direto para inserir gêneros com IDs específicos
    with connection.cursor() as cursor:
        for genero in generos:
            try:
                # Tenta criar com ID específico
                cursor.execute(
                    "INSERT INTO catalogo_genero (id, nome) VALUES (?, ?);",
                    [genero["id"], genero["nome"]],
                )
            except IntegrityError:
                # Se já existir, atualiza
                cursor.execute(
                    "UPDATE catalogo_genero SET nome = ? WHERE id = ?;",
                    [genero["nome"], genero["id"]],
                )

    print(f"Gêneros cadastrados: {Genero.objects.count()}")


def criar_filmes():
    """Cria filmes de exemplo com IDs específicos"""
    # Limpar filmes existentes (opcional, depende da estratégia)
    Filme.objects.all().delete()

    # Resetar sequência para garantir que os IDs começam do 1
    resetar_sequencia("catalogo_filme")

    filmes = [
        {
            "id": 1,
            "titulo": "A Origem",
            "sinopse": "Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente durante o estado de sono.",
            "ano": 2010,
            "generos": [1, 5],  # Ação, Ficção Científica
        },
        {
            "id": 2,
            "titulo": "Interestelar",
            "sinopse": "Um grupo de astronautas viaja através de um buraco de minhoca em busca de um novo lar para a humanidade.",
            "ano": 2014,
            "generos": [2, 4, 5],  # Aventura, Drama, Ficção Científica
        },
        {
            "id": 3,
            "titulo": "Pulp Fiction",
            "sinopse": "As vidas de dois assassinos, um boxeador, um gângster e sua esposa, e um par de bandidos se entrelaçam em quatro histórias de violência e redenção.",
            "ano": 1994,
            "generos": [4, 11],  # Drama, Crime
        },
        {
            "id": 4,
            "titulo": "O Senhor dos Anéis: A Sociedade do Anel",
            "sinopse": "Um hobbit pacato e sua jornada para destruir um poderoso anel que pode levar à queda da civilização.",
            "ano": 2001,
            "generos": [2, 8],  # Aventura, Fantasia
        },
        {
            "id": 5,
            "titulo": "O Poderoso Chefão",
            "sinopse": "A história de Don Vito Corleone, o chefe de uma família mafiosa de Nova York, e seu filho Michael, que reluta em entrar nos negócios da família.",
            "ano": 1972,
            "generos": [11, 4],  # Crime, Drama
        },
        {
            "id": 6,
            "titulo": "Vingadores: Ultimato",
            "sinopse": "Após os eventos devastadores, o universo está em ruínas. Com a ajuda de aliados, os Vingadores se reúnem para desfazer as ações de Thanos.",
            "ano": 2019,
            "generos": [1, 2, 5],  # Ação, Aventura, Ficção Científica
        },
        {
            "id": 7,
            "titulo": "Coringa",
            "sinopse": "Em Gotham City, o comediante Arthur Fleck é isolado e desconsiderado pela sociedade, o que o leva a uma espiral descendente de revolução e crime.",
            "ano": 2019,
            "generos": [11, 4, 12],  # Crime, Drama, Suspense
        },
        {
            "id": 8,
            "titulo": "Star Wars: Episódio IV - Uma Nova Esperança",
            "sinopse": "Luke Skywalker une forças com um cavaleiro Jedi, um arrogante piloto e dois droides para salvar a galáxia.",
            "ano": 1977,
            "generos": [1, 2, 8],  # Ação, Aventura, Fantasia
        },
        {
            "id": 9,
            "titulo": "Toy Story",
            "sinopse": "Um cowboy de brinquedo descobre que tem um novo concorrente na afeição de seu dono quando um novo brinquedo espacial chega.",
            "ano": 1995,
            "generos": [9, 2, 3],  # Animação, Aventura, Comédia
        },
        {
            "id": 10,
            "titulo": "Matrix",
            "sinopse": "Um hacker descobre a chocante verdade sobre a realidade e seu papel na guerra contra seus controladores.",
            "ano": 1999,
            "generos": [1, 5],  # Ação, Ficção Científica
        },
    ]

    # Usar SQL direto para inserir filmes com IDs específicos
    with connection.cursor() as cursor:
        for filme in filmes:
            try:
                # Tenta criar filme com ID específico
                cursor.execute(
                    "INSERT INTO catalogo_filme (id, titulo, sinopse, ano, data_cadastro) VALUES (?, ?, ?, ?, datetime('now'));",
                    [filme["id"], filme["titulo"], filme["sinopse"], filme["ano"]],
                )
            except IntegrityError:
                # Se já existir, atualiza
                cursor.execute(
                    "UPDATE catalogo_filme SET titulo = ?, sinopse = ?, ano = ? WHERE id = ?;",
                    [filme["titulo"], filme["sinopse"], filme["ano"], filme["id"]],
                )

            # Limpa relações de gênero existentes e adiciona novas
            cursor.execute(
                "DELETE FROM catalogo_filme_generos WHERE filme_id = ?;", [filme["id"]]
            )

            for genero_id in filme["generos"]:
                cursor.execute(
                    "INSERT INTO catalogo_filme_generos (filme_id, genero_id) VALUES (?, ?);",
                    [filme["id"], genero_id],
                )

    print(f"Filmes cadastrados: {Filme.objects.count()}")


if __name__ == "__main__":
    print("Iniciando a população do banco de dados...")
    criar_generos()
    criar_filmes()
    print("Banco de dados populado com sucesso!")
