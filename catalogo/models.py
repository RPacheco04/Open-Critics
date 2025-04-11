# Este arquivo é mantido para compatibilidade
# Os modelos foram migrados para a pasta catalogo/models/

from catalogo.models.genero import Genero
from catalogo.models.filme import Filme
from catalogo.models.avaliacao import Avaliacao

__all__ = ["Genero", "Filme", "Avaliacao"]
