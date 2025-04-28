from django.db import models
from .genero import Genero
from django.db.models import Avg


class Filme(models.Model):
    titulo = models.CharField(max_length=200)
    sinopse = models.TextField()
    ano = models.IntegerField()
    generos = models.ManyToManyField(Genero, related_name="filmes")
    capa_url = models.URLField(max_length=500, blank=True, null=True)
    diretor = models.CharField(max_length=200, blank=True, null=True)
    elenco = models.TextField(blank=True, null=True)
    duracao = models.IntegerField(blank=True, null=True, help_text="Duração em minutos")
    data_cadastro = models.DateTimeField(auto_now_add=True)
    is_trending = models.BooleanField(
        default=False, help_text="Indica se o filme está em tendência"
    )
    visualizacoes = models.PositiveIntegerField(
        default=0, help_text="Contador de visualizações da página do filme"
    )

    def __str__(self):
        return self.titulo

    def media_avaliacoes(self):
        # Usa o agregador do Django para otimizar o cálculo em banco
        result = self.avaliacoes.aggregate(media=Avg("nota"))
        return result["media"] or 0

    def quantidade_avaliacoes(self):
        return self.avaliacoes.count()

    def atualizar_visualizacoes(self):
        self.visualizacoes += 1
        self.save(update_fields=["visualizacoes"])
