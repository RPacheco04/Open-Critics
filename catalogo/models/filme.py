from django.db import models
from .genero import Genero


class Filme(models.Model):
    titulo = models.CharField(max_length=200)
    sinopse = models.TextField()
    ano = models.IntegerField() 
    generos = models.ManyToManyField(Genero, related_name="filmes")
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titulo

    def media_avaliacoes(self):
        avaliacoes = self.avaliacoes.all()
        if avaliacoes:
            return sum(a.nota for a in avaliacoes) / avaliacoes.count()
        return 0

