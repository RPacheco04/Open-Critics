/**
 * JavaScript para a página de detalhes do filme
 */
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticação
  const token = localStorage.getItem("auth_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Pegar ID do filme da URL
  const urlParams = new URLSearchParams(window.location.search);
  const filmeId = urlParams.get("id");

  if (!filmeId) {
    alert("ID do filme não especificado.");
    window.location.href = "dashboard.html";
    return;
  }

  // Configurar eventos da página
  setupEvents();

  // Carregar dados do filme
  loadFilmeDetails(filmeId);

  /**
   * Configura eventos da página
   */
  function setupEvents() {
    // Botão de logout
    document.getElementById("logout-btn").addEventListener("click", logout);

    // Exibir formulário de avaliação
    document
      .getElementById("btn-avaliar")
      .addEventListener("click", function () {
        const avaliacaoForm = document.getElementById("avaliacao-form-section");
        avaliacaoForm.classList.remove("hidden");
        avaliacaoForm.scrollIntoView({ behavior: "smooth" });
      });

    // Cancelar avaliação
    document
      .getElementById("cancel-review")
      .addEventListener("click", function () {
        document
          .getElementById("avaliacao-form-section")
          .classList.add("hidden");
      });

    // Seleção de estrelas
    const stars = document.querySelectorAll(".stars-select i");
    stars.forEach((star) => {
      star.addEventListener("click", function () {
        const value = this.getAttribute("data-value");
        document.getElementById("rating-value").textContent = `${value}/5`;

        // Atualizar visual das estrelas
        stars.forEach((s) => {
          const starValue = s.getAttribute("data-value");
          if (starValue <= value) {
            s.className = "fas fa-star";
          } else {
            s.className = "far fa-star";
          }
        });
      });
    });

    // Envio do formulário de avaliação
    document
      .getElementById("form-avaliacao")
      .addEventListener("submit", function (e) {
        e.preventDefault();
        submitAvaliacao(filmeId);
      });
  }

  /**
   * Carrega os detalhes do filme
   * @param {number} filmeId - ID do filme
   */
  async function loadFilmeDetails(filmeId) {
    try {
      // Carregar detalhes do filme
      const filme = await ApiService.filmes.obterPorId(filmeId);
      updateFilmeUI(filme);

      // Carregar avaliações
      const avaliacoes = await ApiService.avaliacoes.obterPorFilme(filmeId);
      updateAvaliacoesUI(avaliacoes);

      // Carregar filmes relacionados (mesmos gêneros)
      if (filme.generos && filme.generos.length > 0) {
        const generoIds = filme.generos.map((g) => g.id);

        // Usar o primeiro gênero para buscar filmes relacionados
        const filtro = { genero: generoIds[0] };
        const filmesRelacionados = await ApiService.filmes.filtrar(filtro);

        // Filtrar o filme atual da lista de relacionados
        const relacionadosFiltrados = filmesRelacionados.filter(
          (f) => f.id !== filme.id
        );

        updateRelacionadosUI(relacionadosFiltrados.slice(0, 5));
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do filme:", error);
      alert("Erro ao carregar dados do filme. Por favor, tente novamente.");
    }
  }

  /**
   * Atualiza a interface com os detalhes do filme
   * @param {Object} filme - Dados do filme
   */
  function updateFilmeUI(filme) {
    // Título da página
    document.title = `${filme.titulo} - CineReview`;

    // Informações básicas
    document.getElementById("filme-titulo").textContent = filme.titulo;
    document.getElementById("filme-ano").textContent = `Ano: ${filme.ano}`;
    document.getElementById("filme-duracao").textContent = "";
    document.getElementById("filme-nota").textContent = `Nota: ${
      filme.media_avaliacoes ? filme.media_avaliacoes.toFixed(1) : "--"
    }`;
    document.getElementById("filme-total-avaliacoes").textContent = `(${
      filme.quantidade_avaliacoes || 0
    } avaliações)`;

    // Atualizar imagem usando uma imagem local baseada no ID
    const filmeCapa = document.getElementById("filme-capa");
    filmeCapa.src = `img/filmes/filme${filme.id}.jpg`;
    filmeCapa.alt = filme.titulo;
    filmeCapa.onerror = function () {
      this.src = "img/filmes/default.jpg";
      // Prevent further error attempts
      this.onerror = null;
    };

    // Sinopse e equipe
    document.getElementById("filme-sinopse-texto").textContent =
      filme.sinopse || "Sem sinopse disponível.";
    document.getElementById("filme-diretor").textContent = "Não informado";
    document.getElementById("filme-elenco").textContent = "Não informado";

    // Gêneros
    const generosContainer = document.getElementById("filme-generos");
    generosContainer.innerHTML = "";

    if (filme.generos && filme.generos.length > 0) {
      filme.generos.forEach((genero) => {
        const generoTag = document.createElement("span");
        generoTag.className = "genero-tag";
        generoTag.textContent = genero.nome;
        generosContainer.appendChild(generoTag);
      });
    } else {
      const generoTag = document.createElement("span");
      generoTag.className = "genero-tag";
      generoTag.textContent = "Sem gênero";
      generosContainer.appendChild(generoTag);
    }

    // Atualizar estrelas de avaliação
    updateStars(filme.media_avaliacoes || 0);
  }

  /**
   * Atualiza as estrelas de avaliação
   * @param {number} rating - Valor da avaliação
   */
  function updateStars(rating) {
    const stars = document.querySelectorAll(".filme-stars i");

    stars.forEach((star, index) => {
      if (index < Math.floor(rating)) {
        star.className = "fas fa-star";
      } else if (index < Math.ceil(rating) && rating % 1 >= 0.5) {
        star.className = "fas fa-star-half-alt";
      } else {
        star.className = "far fa-star";
      }
    });
  }

  /**
   * Atualiza a interface com as avaliações do filme
   * @param {Array} avaliacoes - Lista de avaliações
   */
  function updateAvaliacoesUI(avaliacoes) {
    const avaliacoesContainer = document.getElementById("avaliacoes-lista");
    avaliacoesContainer.innerHTML = "";

    if (avaliacoes.length === 0) {
      const noAvaliacoes = document.createElement("div");
      noAvaliacoes.className = "no-avaliacoes";
      noAvaliacoes.textContent =
        "Nenhuma avaliação encontrada para este filme.";
      avaliacoesContainer.appendChild(noAvaliacoes);
      return;
    }

    avaliacoes.forEach((avaliacao) => {
      const avaliacaoCard = document.createElement("div");
      avaliacaoCard.className = "avaliacao-card";

      // Cabeçalho da avaliação
      const header = document.createElement("div");
      header.className = "avaliacao-header";

      const userInfo = document.createElement("div");
      userInfo.className = "user-info";
      userInfo.innerHTML = `
        <i class="fas fa-user-circle"></i>
        <span>${avaliacao.usuario.username}</span>
      `;

      const ratingInfo = document.createElement("div");
      ratingInfo.className = "rating-info";

      const stars = document.createElement("div");
      stars.className = "mini-stars";

      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i");
        if (i <= avaliacao.nota) {
          star.className = "fas fa-star";
        } else {
          star.className = "far fa-star";
        }
        stars.appendChild(star);
      }

      ratingInfo.appendChild(stars);
      ratingInfo.innerHTML += `<span class="data-avaliacao">${formatDate(
        avaliacao.data_avaliacao
      )}</span>`;

      header.appendChild(userInfo);
      header.appendChild(ratingInfo);

      // Conteúdo da avaliação
      const content = document.createElement("div");
      content.className = "avaliacao-content";
      content.textContent = avaliacao.comentario || "Sem comentários.";

      avaliacaoCard.appendChild(header);
      avaliacaoCard.appendChild(content);

      avaliacoesContainer.appendChild(avaliacaoCard);
    });
  }

  /**
   * Atualiza a interface com filmes relacionados
   * @param {Array} filmes - Lista de filmes relacionados
   */
  function updateRelacionadosUI(filmes) {
    const relacionadosContainer = document.getElementById(
      "related-movies-list"
    );
    relacionadosContainer.innerHTML = "";

    if (filmes.length === 0) {
      relacionadosContainer.innerHTML =
        "<p>Nenhum filme relacionado encontrado.</p>";
      return;
    }

    filmes.forEach((filme) => {
      const movieCard = document.createElement("div");
      movieCard.className = "related-movie-card";
      movieCard.dataset.id = filme.id;

      // Usar imagem local baseada no ID
      const posterUrl = `img/filmes/filme${filme.id}.jpg`;

      movieCard.innerHTML = `
        <img src="${posterUrl}" alt="${
        filme.titulo
      }" class="related-movie-poster" onerror="this.onerror=null; this.src='img/filmes/default.jpg'">
        <div class="related-movie-info">
          <h4>${filme.titulo}</h4>
          <span>${filme.ano}</span>
          <div class="mini-stars">
            ${getStarsHTML(filme.media_avaliacoes || 0)}
          </div>
        </div>
      `;

      movieCard.addEventListener("click", function () {
        window.location.href = `filme_detail.html?id=${filme.id}`;
      });

      relacionadosContainer.appendChild(movieCard);
    });
  }

  /**
   * Gera HTML para estrelas de avaliação
   * @param {number} rating - Valor da avaliação
   * @returns {string} HTML das estrelas
   */
  function getStarsHTML(rating) {
    let html = "";

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<i class="fas fa-star"></i>';
      } else if (i === Math.ceil(rating) && rating % 1 >= 0.5) {
        html += '<i class="fas fa-star-half-alt"></i>';
      } else {
        html += '<i class="far fa-star"></i>';
      }
    }

    return html;
  }

  /**
   * Formata data para exibição
   * @param {string} dateString - String de data
   * @returns {string} Data formatada
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  /**
   * Envia uma nova avaliação
   * @param {number} filmeId - ID do filme
   */
  async function submitAvaliacao(filmeId) {
    const token = localStorage.getItem("auth_token");

    // Encontra todas as estrelas selecionadas
    const selectedStars = document.querySelectorAll(".stars-select i.fas");

    // Verifica se pelo menos uma estrela foi selecionada
    if (!selectedStars || selectedStars.length === 0) {
      alert("Por favor, selecione uma nota para o filme.");
      return;
    }

    // Pega o valor da última estrela selecionada (a maior nota)
    const starValue =
      selectedStars[selectedStars.length - 1].getAttribute("data-value");
    const comentario = document.getElementById("comentario").value;

    if (!starValue) {
      alert("Por favor, selecione uma nota para o filme.");
      return;
    }

    try {
      const avaliacaoData = {
        filme: filmeId,
        nota: parseInt(starValue),
        comentario: comentario,
      };

      await ApiService.avaliacoes.adicionar(avaliacaoData, token);

      alert("Avaliação enviada com sucesso!");

      // Recarregar página para mostrar a nova avaliação
      window.location.reload();
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);

      if (error.message && error.message.includes("já avaliou")) {
        alert(
          "Você já avaliou este filme. Só é permitida uma avaliação por usuário."
        );
      } else {
        alert("Erro ao enviar avaliação. Por favor, tente novamente.");
      }
    }
  }

  /**
   * Realiza logout
   */
  async function logout() {
    try {
      const token = localStorage.getItem("auth_token");
      await ApiService.auth.logout(token);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Limpa dados de autenticação
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_expiration");
      localStorage.removeItem("auth_username");
      localStorage.removeItem("user_info");

      // Redireciona para login
      window.location.href = "login.html";
    }
  }
});
