from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Genero, Filme, Avaliacao
from .serializers import (
    GeneroSerializer,
    FilmeSerializer,
    AvaliacaoSerializer,
    UserSerializer,
)

# Create your views here.


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Por favor, forneça username e senha"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if not user:
        return Response(
            {"error": "Credenciais inválidas"}, status=status.HTTP_401_UNAUTHORIZED
        )

    token, _ = Token.objects.get_or_create(user=user)
    return Response(
        {
            "token": token.key,
            "user": {"id": user.id, "username": user.username, "email": user.email},
        }
    )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GeneroViewSet(viewsets.ModelViewSet):
    queryset = Genero.objects.all()
    serializer_class = GeneroSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["nome"]


class FilmeViewSet(viewsets.ModelViewSet):
    queryset = Filme.objects.all()
    serializer_class = FilmeSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["titulo", "sinopse"]
    ordering_fields = ["titulo", "ano", "data_cadastro"]


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer

    def get_queryset(self):
        queryset = Avaliacao.objects.all()
        filme_id = self.request.query_params.get("filme")
        if filme_id is not None:
            queryset = queryset.filter(filme__id=filme_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
