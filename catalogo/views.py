from django.shortcuts import render, get_object_or_404
from django.db.models import Count, Avg, Q
from rest_framework import viewsets, permissions, filters, status, generics, mixins
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    AllowAny,
)
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Genero, Filme, Avaliacao
from .serializers import (
    GeneroSerializer,
    FilmeListSerializer,
    FilmeDetailSerializer,
    AvaliacaoSerializer,
    UserSerializer,
    UserRegisterSerializer,
)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permissão personalizada que só permite que os proprietários
    de um objeto editem ou deletem
    """

    def has_object_permission(self, request, view, obj):
        # permissões de leitura são permitidas para qualquer requisição
        if request.method in permissions.SAFE_METHODS:
            return True

        # permissões de escrita só são permitidas para o proprietário
        if hasattr(obj, "usuario"):
            return obj.usuario == request.user
        elif hasattr(obj, "user"):
            return obj.user == request.user
        return False


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def user_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    remember_me = request.data.get("remember_me", False)

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

    #se houver um token existente, deleta
    Token.objects.filter(user=user).delete()

    # cria um novo token
    token = Token.objects.create(user=user)

    return Response(
        {
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            "remember_me": remember_me,
        }
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    #Deleta o token do usuário para efetuar o logout
    Token.objects.filter(user=request.user).delete()
    return Response({"message": "Logout realizado com sucesso"})


class UserRegisterView(generics.CreateAPIView):
    """View para registrar novos usuários"""

    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Cria um token para o usuário recém-registrado
        token, created = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_201_CREATED,
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
    permission_classes = [IsAuthenticatedOrReadOnly]


class FilmeViewSet(viewsets.ModelViewSet):
    queryset = Filme.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["titulo", "sinopse", "diretor", "elenco"]
    ordering_fields = ["titulo", "ano", "data_cadastro", "visualizacoes"]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == "list":
            return FilmeListSerializer
        return FilmeDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        # Incrementa contador de visualizações
        filme = self.get_object()
        filme.atualizar_visualizacoes()
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def trending(self, request):
        """Endpoint para filmes em tendência"""
        # Obter filmes marcados como trending ou com muitas visualizações recentes
        trending_by_flag = Filme.objects.filter(is_trending=True)

        # Se não houver filmes marcados manualmente, seleciona os mais visualizados
        if not trending_by_flag:
            trending_by_views = Filme.objects.order_by("-visualizacoes")[:10]
            serializer = FilmeListSerializer(trending_by_views, many=True)
        else:
            serializer = FilmeListSerializer(trending_by_flag, many=True)

        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def suggested(self, request):
        """Endpoint para sugestões de filmes"""
        # Para usuários autenticados, busca recomendações personalizadas
        if request.user.is_authenticated:
            # Obtém gêneros dos filmes bem avaliados pelo usuário
            well_rated_genres = (
                Genero.objects.filter(
                    filmes__avaliacoes__usuario=request.user,
                    filmes__avaliacoes__nota__gte=4,
                )
                .annotate(count=Count("id"))
                .order_by("-count")
            )

            if well_rated_genres.exists():
                # Recomenda filmes desses gêneros que o usuário ainda não avaliou
                suggested_films = (
                    Filme.objects.filter(generos__in=well_rated_genres)
                    .exclude(avaliacoes__usuario=request.user)
                    .distinct()[:10]
                )

                serializer = FilmeListSerializer(suggested_films, many=True)
                return Response(serializer.data)

        # Caso padrão: retorna filmes com boas avaliações
        top_rated = (
            Filme.objects.annotate(avg_rating=Avg("avaliacoes__nota"))
            .filter(avg_rating__gte=4)
            .order_by("-avg_rating")[:10]
        )

        serializer = FilmeListSerializer(top_rated, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def filter(self, request):
        """Endpoint para filtragem avançada de filmes"""
        queryset = Filme.objects.all()

        # Filtragem por gênero
        generos_ids = request.query_params.getlist("genero")
        if generos_ids:
            queryset = queryset.filter(generos__id__in=generos_ids).distinct()

        # Filtragem por ano
        ano = request.query_params.get("ano")
        if ano:
            queryset = queryset.filter(ano=ano)

        # Filtragem por nota mínima
        nota_min = request.query_params.get("nota_min")
        if nota_min:
            queryset = queryset.annotate(avg_nota=Avg("avaliacoes__nota")).filter(
                avg_nota__gte=float(nota_min)
            )

        # Ordenação
        order_by = request.query_params.get("order_by", "-media_avaliacoes")
        if order_by == "media_avaliacoes":
            queryset = queryset.annotate(media=Avg("avaliacoes__nota")).order_by(
                "media"
            )
        elif order_by == "-media_avaliacoes":
            queryset = queryset.annotate(media=Avg("avaliacoes__nota")).order_by(
                "-media"
            )
        else:
            queryset = queryset.order_by(order_by)

        serializer = FilmeListSerializer(queryset, many=True)
        return Response(serializer.data)


class AvaliacaoViewSet(viewsets.ModelViewSet):
    queryset = Avaliacao.objects.all()
    serializer_class = AvaliacaoSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        queryset = Avaliacao.objects.all()

        # Filtrar por filme específico
        filme_id = self.request.query_params.get("filme")
        if filme_id is not None:
            queryset = queryset.filter(filme__id=filme_id)

        # Filtrar por usuário específico
        usuario_id = self.request.query_params.get("usuario")
        if usuario_id is not None:
            if usuario_id == "me":
                queryset = queryset.filter(usuario=self.request.user)
            else:
                queryset = queryset.filter(usuario__id=usuario_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=["get"])
    def minhas(self, request):
        """Endpoint para listar avaliações do usuário autenticado"""
        avaliacoes = Avaliacao.objects.filter(usuario=request.user).order_by(
            "-data_avaliacao"
        )
        serializer = self.get_serializer(avaliacoes, many=True)
        return Response(serializer.data)


class EstatisticasView(generics.RetrieveAPIView):
    """View para retornar estatísticas gerais do site"""

    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        total_filmes = Filme.objects.count()
        total_avaliacoes = Avaliacao.objects.count()
        total_usuarios = User.objects.count()
        media_global = Avaliacao.objects.aggregate(media=Avg("nota"))["media"] or 0

        # Gêneros mais populares (com mais filmes)
        generos_populares = (
            Genero.objects.annotate(num_filmes=Count("filmes"))
            .order_by("-num_filmes")[:5]
            .values("id", "nome", "num_filmes")
        )

        # Filmes mais avaliados
        filmes_mais_avaliados = (
            Filme.objects.annotate(num_avaliacoes=Count("avaliacoes"))
            .order_by("-num_avaliacoes")[:5]
            .values("id", "titulo", "num_avaliacoes")
        )

        return Response(
            {
                "total_filmes": total_filmes,
                "total_avaliacoes": total_avaliacoes,
                "total_usuarios": total_usuarios,
                "media_global": round(media_global, 1),
                "generos_populares": generos_populares,
                "filmes_mais_avaliados": filmes_mais_avaliados,
            }
        )
