from django.core.management.base import BaseCommand
from catalogo.models import Genero


class Command(BaseCommand):
    help = "Importa gêneros iniciais para o banco de dados"

    def handle(self, *args, **options):
        generos = [
            "Ação",
            "Aventura",
            "Animação",
            "Comédia",
            "Crime",
            "Documentário",
            "Drama",
            "Família",
            "Fantasia",
            "História",
            "Terror",
            "Música",
            "Mistério",
            "Romance",
            "Ficção Científica",
            "Thriller",
            "Guerra",
            "Faroeste",
        ]

        count = 0
        for nome_genero in generos:
            genero, created = Genero.objects.get_or_create(nome=nome_genero)
            if created:
                count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Gênero "{nome_genero}" criado com sucesso!')
                )
            else:
                self.stdout.write(f'Gênero "{nome_genero}" já existe.')

        self.stdout.write(
            self.style.SUCCESS(f"Importação concluída! {count} gêneros foram criados.")
        )
