from django.db import models
from .genero import Genero
from django.db.models import Avg


class Filme(models.Model):
    titulo = models.CharField(max_length=200)
    sinopse = models.TextField()
    ano = models.IntegerField()
    generos = models.ManyToManyField(Genero, related_name="filmes")
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

    def media_avaliacoes(self):
        # Usa o agregador do Django para otimizar o cálculo em banco
        result = self.avaliacoes.aggregate(media=Avg("nota"))
        return result["media"] or 0

    def quantidade_avaliacoes(self):
        return self.avaliacoes.count()
