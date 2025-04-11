from django.contrib import admin
from .models import Genero, Filme, Avaliacao


@admin.register(Genero)
class GeneroAdmin(admin.ModelAdmin):
    list_display = ("nome",)
    search_fields = ("nome",)


@admin.register(Filme)
class FilmeAdmin(admin.ModelAdmin):
    list_display = ("titulo", "ano", "get_generos", "media_avaliacoes")
    list_filter = ("generos", "ano")
    search_fields = ("titulo", "sinopse")
    filter_horizontal = ("generos",)

    def get_generos(self, obj):
        return ", ".join([g.nome for g in obj.generos.all()])

    get_generos.short_description = "Gêneros"


@admin.register(Avaliacao)
class AvaliacaoAdmin(admin.ModelAdmin):
    list_display = ("usuario", "filme", "nota", "data_avaliacao")
    list_filter = ("nota", "data_avaliacao")
    search_fields = ("filme__titulo", "usuario__username", "comentario")
