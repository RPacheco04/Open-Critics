from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Genero, Filme, Avaliacao


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = "__all__"


class FilmeSerializer(serializers.ModelSerializer):
    generos = GeneroSerializer(many=True, read_only=True)
    generos_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genero.objects.all(), write_only=True, many=True, source="generos"
    )
    media_avaliacoes = serializers.ReadOnlyField()

    class Meta:
        model = Filme
        fields = (
            "id",
            "titulo",
            "sinopse",
            "ano",
            "generos",
            "generos_ids",
            "media_avaliacoes",
            "data_cadastro",
        )


class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)

    class Meta:
        model = Avaliacao
        fields = ("id", "usuario", "filme", "nota", "comentario", "data_avaliacao")
        read_only_fields = ("usuario",)

    def create(self, validated_data):
        # Atribui o usuário atual à avaliação
        validated_data["usuario"] = self.context["request"].user
        return super().create(validated_data)
