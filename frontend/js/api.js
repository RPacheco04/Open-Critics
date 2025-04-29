/**
 * API Service para integração com o backend
 */
const API_URL = "http://localhost:8001/api";

const ApiService = {
  // Métodos de autenticação
  auth: {
    /**
     * Realiza login do usuário
     * @param {string} username - Nome de usuário
     * @param {string} password - Senha do usuário
     * @param {boolean} rememberMe - Se deve manter o usuário logado
     * @returns {Promise} - Promise com resposta da API
     */
    login: async (username, password, rememberMe = false) => {
      try {
        const response = await fetch(`${API_URL}/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password, remember_me: rememberMe }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao fazer login");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de login:", error);
        throw error;
      }
    },

    /**
     * Realiza logout do usuário
     * @param {string} token - Token de autenticação
     * @returns {Promise} - Promise com resposta da API
     */
    logout: async (token) => {
      try {
        const response = await fetch(`${API_URL}/logout/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao fazer logout");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de logout:", error);
        throw error;
      }
    },

    /**
     * Registra um novo usuário
     * @param {Object} userData - Dados do usuário para registro
     * @returns {Promise} - Promise com resposta da API
     */
    register: async (userData) => {
      try {
        const response = await fetch(`${API_URL}/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao registrar usuário");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de registro:", error);
        throw error;
      }
    },
  },

  // Métodos para filmes
  filmes: {
    /**
     * Obtém todos os filmes
     * @param {Object} params - Parâmetros de filtro (opcional)
     * @returns {Promise} - Promise com resposta da API
     */
    listar: async (params = {}) => {
      try {
        const queryParams = new URLSearchParams(params).toString();
        const url = `${API_URL}/filmes/${queryParams ? `?${queryParams}` : ""}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Erro ao buscar filmes");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de filmes:", error);
        throw error;
      }
    },

    /**
     * Obtém detalhes de um filme específico
     * @param {number} id - ID do filme
     * @returns {Promise} - Promise com resposta da API
     */
    obterPorId: async (id) => {
      try {
        const response = await fetch(`${API_URL}/filmes/${id}/`);

        if (!response.ok) {
          throw new Error("Erro ao buscar detalhes do filme");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de filmes:", error);
        throw error;
      }
    },

    /**
     * Obtém filmes em tendência
     * @returns {Promise} - Promise com resposta da API
     */
    obterTendencias: async () => {
      try {
        const response = await fetch(`${API_URL}/filmes/trending/`);

        if (!response.ok) {
          throw new Error("Erro ao buscar filmes em tendência");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de filmes em tendência:", error);
        throw error;
      }
    },

    /**
     * Obtém sugestões de filmes para o usuário
     * @param {string} token - Token de autenticação (opcional para personalização)
     * @returns {Promise} - Promise com resposta da API
     */
    obterSugestoes: async (token = null) => {
      try {
        const headers = {};
        if (token) {
          headers["Authorization"] = `Token ${token}`;
        }

        const response = await fetch(`${API_URL}/filmes/suggested/`, {
          headers,
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar sugestões de filmes");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de sugestões de filmes:", error);
        throw error;
      }
    },

    /**
     * Filtra filmes com critérios específicos
     * @param {Object} filtros - Critérios de filtragem
     * @returns {Promise} - Promise com resposta da API
     */
    filtrar: async (filtros) => {
      try {
        const queryParams = new URLSearchParams(filtros).toString();
        const response = await fetch(
          `${API_URL}/filmes/filter/?${queryParams}`
        );

        if (!response.ok) {
          throw new Error("Erro ao filtrar filmes");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de filtro de filmes:", error);
        throw error;
      }
    },
  },

  // Métodos para gêneros
  generos: {
    /**
     * Obtém todos os gêneros de filmes
     * @returns {Promise} - Promise com resposta da API
     */
    listar: async () => {
      try {
        const response = await fetch(`${API_URL}/generos/`);

        if (!response.ok) {
          throw new Error("Erro ao buscar gêneros");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de gêneros:", error);
        throw error;
      }
    },
  },

  // Métodos para avaliações
  avaliacoes: {
    /**
     * Obtém avaliações de um filme específico
     * @param {number} filmeId - ID do filme
     * @returns {Promise} - Promise com resposta da API
     */
    obterPorFilme: async (filmeId) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${API_URL}/avaliacoes/?filme=${filmeId}`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar avaliações do filme");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de avaliações:", error);
        throw error;
      }
    },

    /**
     * Obtém avaliações do usuário atual
     * @param {string} token - Token de autenticação
     * @returns {Promise} - Promise com resposta da API
     */
    minhasAvaliacoes: async (token) => {
      try {
        const response = await fetch(`${API_URL}/avaliacoes/minhas/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar suas avaliações");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de avaliações do usuário:", error);
        throw error;
      }
    },

    /**
     * Adiciona uma avaliação para um filme
     * @param {Object} dados - Dados da avaliação
     * @param {string} token - Token de autenticação
     * @returns {Promise} - Promise com resposta da API
     */
    adicionar: async (dados, token) => {
      try {
        const response = await fetch(`${API_URL}/avaliacoes/`, {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao adicionar avaliação");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de adição de avaliação:", error);
        throw error;
      }
    },

    /**
     * Exclui uma avaliação
     * @param {number} id - ID da avaliação
     * @param {string} token - Token de autenticação
     * @returns {Promise} - Promise com resposta da API
     */
    excluir: async (id, token) => {
      try {
        const response = await fetch(`${API_URL}/avaliacoes/${id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir avaliação");
        }

        return true;
      } catch (error) {
        console.error("Erro na API de exclusão de avaliação:", error);
        throw error;
      }
    },
  },

  // Métodos para estatísticas
  estatisticas: {
    /**
     * Obtém estatísticas gerais do site
     * @returns {Promise} - Promise com resposta da API
     */
    obter: async () => {
      try {
        const response = await fetch(`${API_URL}/estatisticas/`);

        if (!response.ok) {
          throw new Error("Erro ao buscar estatísticas");
        }

        return await response.json();
      } catch (error) {
        console.error("Erro na API de estatísticas:", error);
        throw error;
      }
    },
  },
};

// Exportar o serviço para uso em outros arquivos
window.ApiService = ApiService;
