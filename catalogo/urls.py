from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"generos", views.GeneroViewSet)
router.register(r"filmes", views.FilmeViewSet)
router.register(r"avaliacoes", views.AvaliacaoViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("login/", views.login, name="login"),
]
