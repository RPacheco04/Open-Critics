from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Genero, Filme, Avaliacao


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            "username",
            "password",
            "password2",
            "email",
            "first_name",
            "last_name",
        )
        extra_kwargs = {
            "email": {"required": True},
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "As senhas não conferem"})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class GeneroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genero
        fields = "__all__"


class FilmeListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de filmes"""

    generos = GeneroSerializer(many=True, read_only=True)
    media_avaliacoes = serializers.ReadOnlyField()
    quantidade_avaliacoes = serializers.ReadOnlyField()

    class Meta:
        model = Filme
        fields = (
            "id",
            "titulo",
            "ano",
            "generos",
            "media_avaliacoes",
            "quantidade_avaliacoes",
        )


class FilmeDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalhes do filme"""

    generos = GeneroSerializer(many=True, read_only=True)
    generos_ids = serializers.PrimaryKeyRelatedField(
        queryset=Genero.objects.all(), write_only=True, many=True, source="generos"
    )
    media_avaliacoes = serializers.ReadOnlyField()
    quantidade_avaliacoes = serializers.ReadOnlyField()

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
            "quantidade_avaliacoes",
            "data_cadastro",
        )


class AvaliacaoSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    filme_titulo = serializers.CharField(source="filme.titulo", read_only=True)

    class Meta:
        model = Avaliacao
        fields = (
            "id",
            "usuario",
            "filme",
            "filme_titulo",
            "nota",
            "comentario",
            "data_avaliacao",
        )
        read_only_fields = ("usuario",)

    def create(self, validated_data):
        # atribui o usuário atual à avaliação
        validated_data["usuario"] = self.context["request"].user

        # verifica se o usuário já avaliou esse filme
        usuario = validated_data["usuario"]
        filme = validated_data["filme"]

        if Avaliacao.objects.filter(usuario=usuario, filme=filme).exists():
            raise serializers.ValidationError("Você já avaliou este filme.")

        return super().create(validated_data)
