from django.db import models
from django.contrib.auth.models import User
from .filme import Filme


class Avaliacao(models.Model):
    usuario = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="avaliacoes"
    )
    filme = models.ForeignKey(
        Filme, on_delete=models.CASCADE, related_name="avaliacoes"
    )
    nota = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comentario = models.TextField(blank=True, null=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (
            "usuario",
            "filme",
        )  # Um usuário só pode avaliar um filme uma vez

    def __str__(self):
        return f"{self.usuario.username} - {self.filme.titulo}: {self.nota}"

