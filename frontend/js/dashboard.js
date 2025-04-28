/**
 * Script específico para a página de dashboard
 */
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticação do usuário
  if (!checkAuthentication()) {
    return; // Sai da função se o usuário não estiver autenticado
  }

  loadDashboardData();

  setupEventos();

  /**
   * Carrega todos os dados necessários para o dashboard
   */
  async function loadDashboardData() {
    try {
      // Carregar gêneros para o filtro
      const generos = await ApiService.generos.listar();
      carregarCategorias(generos);

      // Obter filmes em tendência
      const filmesTendencia = await ApiService.filmes.obterTendencias();
      carregarFilmesTendencia(filmesTendencia);

      // Obter sugestões de filmes
      const token = localStorage.getItem("auth_token");
      const filmesSugeridos = await ApiService.filmes.obterSugestoes(token);
      carregarFilmesSugeridos(filmesSugeridos);

      // Obter estatísticas do site
      const estatisticas = await ApiService.estatisticas.obter();
      atualizarEstatisticas(estatisticas);

      // Carregar anos para o filtro (baseado nos anos dos filmes disponíveis)
      const anos = [
        ...new Set(
          filmesTendencia.concat(filmesSugeridos).map((filme) => filme.ano)
        ),
      ].sort((a, b) => b - a);
      carregarAnos(anos);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      // Exibir mensagem de erro para o usuário
      alert(
        "Houve um erro ao carregar os dados. Por favor, tente novamente mais tarde."
      );
    }
  }

  /**
   * Verifica a autenticação do usuário
   */
  function checkAuthentication() {
    const authToken = localStorage.getItem("auth_token");
    const expiration = localStorage.getItem("auth_expiration");
    const username = localStorage.getItem("auth_username");

    // Verificações de segurança
    if (!authToken || !expiration || !username) {
      clearAuthData();
      redirectToLogin();
      return false;
    }

    const expirationTime = parseInt(expiration);

    // Verificar se o token expirou
    if (Date.now() > expirationTime) {
      clearAuthData();
      redirectToLogin("session_expired");
      return false;
    }

    // Exibir nome do usuário logado
    updateUserDisplay(username);
    return true;
  }

  /**
   * Limpa dados de autenticação
   */
  function clearAuthData() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiration");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("user_info");
  }

  /**
   * Redireciona para a página de login
   */
  function redirectToLogin(reason) {
    const url = reason ? `login.html?error=${reason}` : "login.html";
    window.location.href = url;
  }

  /**
   * Carrega as categorias/gêneros na sidebar
   */
  function carregarCategorias(generos) {
    const categoryList = document.getElementById("categoryList");

    if (categoryList) {
      // Limpar o conteúdo atual
      categoryList.innerHTML = "";

      generos.forEach((genero) => {
        const li = document.createElement("li");

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `genre-${genero.id}`;
        input.name = "genre";
        input.value = genero.id;
        input.className = "filter-checkbox";

        const label = document.createElement("label");
        label.htmlFor = `genre-${genero.id}`;
        label.textContent = genero.nome;

        li.appendChild(input);
        li.appendChild(label);
        categoryList.appendChild(li);
      });
    }
  }

  /**
   * Carrega as opções de anos para o filtro
   */
  function carregarAnos(anos) {
    const yearFilter = document.getElementById("year-filter");

    if (yearFilter) {
      // Manter a opção "Todos os anos"
      const allOption = yearFilter.options[0];
      yearFilter.innerHTML = "";
      yearFilter.appendChild(allOption);

      // Adicionar anos
      anos.forEach((ano) => {
        const option = document.createElement("option");
        option.value = ano;
        option.textContent = ano;
        yearFilter.appendChild(option);
      });
    }
  }

  /**
   * Carrega os filmes em tendência
   */
  function carregarFilmesTendencia(filmes) {
    const trendingMovies = document.getElementById("trending-movies");

    if (trendingMovies) {
      trendingMovies.innerHTML = "";

      if (filmes.length === 0) {
        trendingMovies.innerHTML =
          '<p class="no-results">Nenhum filme em tendência no momento.</p>';
        return;
      }

      filmes.forEach((filme) => {
        const movieCard = createMovieCard(filme);
        trendingMovies.appendChild(movieCard);
      });
    }
  }

  /**
   * Carrega os filmes sugeridos
   */
  function carregarFilmesSugeridos(filmes) {
    const suggestedMovies = document.getElementById("suggested-movies");

    if (suggestedMovies) {
      suggestedMovies.innerHTML = "";

      if (filmes.length === 0) {
        suggestedMovies.innerHTML =
          '<p class="no-results">Nenhuma sugestão de filme no momento.</p>';
        return;
      }

      filmes.forEach((filme) => {
        const movieCard = createMovieCard(filme);
        suggestedMovies.appendChild(movieCard);
      });
    }
  }

  /**
   * Cria um card de filme
   */
  function createMovieCard(filme) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.dataset.id = filme.id;

    // Imagem do filme
    const img = document.createElement("img");
    img.src = filme.capa_url || "img/default-movie.jpg";
    img.alt = filme.titulo;
    img.className = "movie-poster";

    // Informações do filme
    const info = document.createElement("div");
    info.className = "movie-info";

    const title = document.createElement("h3");
    title.className = "movie-title";
    title.textContent = filme.titulo;

    const year = document.createElement("span");
    year.className = "movie-year";
    year.textContent = filme.ano;

    const rating = document.createElement("div");
    rating.className = "movie-rating";

    const stars = document.createElement("div");
    stars.className = "movie-stars";

    // Adicionar estrelas baseadas na média de avaliações
    const ratingValue = filme.media_avaliacoes || 0;
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("i");
      if (i <= Math.floor(ratingValue)) {
        star.className = "fas fa-star";
      } else if (i - 0.5 <= ratingValue) {
        star.className = "fas fa-star-half-alt";
      } else {
        star.className = "far fa-star";
      }
      stars.appendChild(star);
    }

    const ratingText = document.createElement("span");
    ratingText.textContent = `${ratingValue.toFixed(1)} (${
      filme.quantidade_avaliacoes
    })`;

    rating.appendChild(stars);
    rating.appendChild(ratingText);

    info.appendChild(title);
    info.appendChild(year);
    info.appendChild(rating);

    card.appendChild(img);
    card.appendChild(info);

    // Adicionar evento de clique para redirecionar para a página de detalhes
    card.addEventListener("click", function () {
      window.location.href = `filme_detail.html?id=${filme.id}`;
    });

    return card;
  }

  /**
   * Atualiza as estatísticas do site
   */
  function atualizarEstatisticas(estatisticas) {
    document.getElementById("stats-total-movies").textContent =
      estatisticas.total_filmes;
    document.getElementById("stats-total-ratings").textContent =
      estatisticas.total_avaliacoes;
    document.getElementById("stats-total-users").textContent =
      estatisticas.total_usuarios;
  }

  /**
   * Atualiza o display do usuário logado
   */
  function updateUserDisplay(username) {
    const usernameElement = document.getElementById("username");
    if (usernameElement) {
      usernameElement.textContent = username;
    }
  }

  /**
   * Configura eventos da página
   */
  function setupEventos() {
    // Botão de logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", logout);
    }

    // Botão de aplicar filtros
    const applyFiltersBtn = document.getElementById("apply-filters");
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener("click", aplicarFiltros);
    }

    // Atualizar valor do filtro de avaliação
    const ratingRange = document.getElementById("rating-range");
    const ratingValue = document.getElementById("rating-value");
    if (ratingRange && ratingValue) {
      ratingRange.addEventListener("input", function () {
        ratingValue.textContent = `${this.value}+`;
      });
    }
  }

  /**
   * Aplica os filtros selecionados
   */
  async function aplicarFiltros() {
    // Coletar os gêneros selecionados
    const generosSelecionados = [];
    document
      .querySelectorAll('input[name="genre"]:checked')
      .forEach((checkbox) => {
        generosSelecionados.push(checkbox.value);
      });

    // Obter o ano selecionado
    const anoSelecionado = document.getElementById("year-filter").value;

    // Obter a avaliação mínima
    const notaMinima = document.getElementById("rating-range").value;

    // Construir objeto de filtros
    const filtros = {};

    if (generosSelecionados.length > 0) {
      filtros.genero = generosSelecionados;
    }

    if (anoSelecionado) {
      filtros.ano = anoSelecionado;
    }

    if (notaMinima > 0) {
      filtros.nota_min = notaMinima;
    }

    try {
      // Chamar a API para filtrar filmes
      const filmesFiltrados = await ApiService.filmes.filtrar(filtros);

      // Exibir os resultados na seção de tendências (substituindo o conteúdo)
      const trendingSection = document.querySelector(".trending-section");
      if (trendingSection) {
        trendingSection.querySelector("h2").textContent =
          "Resultados do Filtro";
        carregarFilmesTendencia(filmesFiltrados);
      }
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
      alert("Houve um erro ao aplicar os filtros. Por favor, tente novamente.");
    }
  }

  /**
   * Função de logout
   */
  async function logout() {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        // Tenta fazer logout no servidor
        await ApiService.auth.logout(token);
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Mesmo se houver erro, limpa os dados locais e redireciona
      clearAuthData();
      window.location.href = "login.html";
    }
  }
});
