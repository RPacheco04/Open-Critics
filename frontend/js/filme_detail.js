/**
 * Script específico para a página de detalhes do filme
 */
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticação
  const isLoggedIn = checkAuthentication();

  // Obter ID do filme da URL
  const urlParams = new URLSearchParams(window.location.search);
  const filmeId = urlParams.get("id");

  if (!filmeId) {
    alert("ID do filme não encontrado");
    window.location.href = "dashboard.html";
    return;
  }

  // Simulação de dados do filme
  const filmeData = {
    id: filmeId,
    titulo: "Matrix",
    ano: 1999,
    generos: ["Ação", "Ficção Científica"],
    sinopse:
      "Um hacker descobre que a realidade como a conhecemos é uma simulação chamada Matrix, criada por máquinas para subjugar a raça humana. Junto com um grupo de rebeldes, ele luta para libertar a humanidade.",
    capa_url: "img/matrix.jpg",
    media_avaliacoes: 4.8,
    avaliacoes: [
      {
        usuario: "user123",
        nota: 5,
        comentario:
          "Um filme revolucionário que mudou a indústria cinematográfica. Efeitos visuais impressionantes e conceito filosófico profundo.",
        data: "2023-05-15",
      },
      {
        usuario: "cinefilo87",
        nota: 4,
        comentario:
          "Excelente filme com uma premissa original. As sequências de ação são espetaculares, mas algumas partes do roteiro são um pouco confusas.",
        data: "2023-06-22",
      },
    ],
  };

  // Exibir dados do filme
  exibirDadosFilme(filmeData);

  // Inicializar sistema de avaliação
  initStarRating();

  // Manipular envio do formulário de avaliação
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!isLoggedIn) {
        alert("Você precisa estar logado para avaliar filmes.");
        return;
      }

      const ratingValue = document.getElementById("ratingValue").value;
      const reviewText = document.getElementById("reviewText").value;

      if (!ratingValue) {
        alert("Por favor, selecione uma nota para o filme.");
        return;
      }

      // Em um sistema real, enviaríamos a avaliação para o servidor
      console.log("Avaliação enviada:", {
        filmeId,
        nota: ratingValue,
        comentario: reviewText,
        usuario: localStorage.getItem("auth_username") || "usuário",
      });

      // Simulação de sucesso
      alert("Avaliação enviada com sucesso!");

      // Limpar formulário
      document.getElementById("ratingValue").value = "";
      document.querySelectorAll(".rating-stars .star").forEach((star) => {
        star.classList.remove("selected");
        star.classList.remove("filled");
      });
      document.getElementById("reviewText").value = "";
    });
  }

  // Função para exibir os dados do filme
  function exibirDadosFilme(filme) {
    document.title = `OpenCritics - ${filme.titulo}`;

    const filmePoster = document.getElementById("filmePoster");
    const filmeTitulo = document.getElementById("filmeTitulo");
    const filmeAno = document.getElementById("filmeAno");
    const filmeGeneros = document.getElementById("filmeGeneros");
    const filmeSinopse = document.getElementById("filmeSinopse");
    const mediaAvaliacoes = document.getElementById("mediaAvaliacoes");
    const totalAvaliacoes = document.getElementById("totalAvaliacoes");
    const avaliacoesContainer = document.getElementById("avaliacoesContainer");
    const nenhumaAvaliacaoMsg = document.getElementById("nenhumaAvaliacaoMsg");

    if (filmePoster) filmePoster.src = filme.capa_url;
    if (filmePoster) filmePoster.alt = filme.titulo;
    if (filmeTitulo) filmeTitulo.textContent = filme.titulo;
    if (filmeAno) filmeAno.textContent = filme.ano;
    if (filmeGeneros) filmeGeneros.textContent = filme.generos.join(", ");
    if (filmeSinopse) filmeSinopse.textContent = filme.sinopse;

    // Atualizar média de avaliações
    if (mediaAvaliacoes) {
      mediaAvaliacoes.textContent = filme.media_avaliacoes.toFixed(1);

      // Preencher estrelas conforme a média
      const ratingStars = document.querySelectorAll(".rating-display .star");
      ratingStars.forEach((star, index) => {
        if (index < Math.floor(filme.media_avaliacoes)) {
          star.classList.add("filled");
        } else {
          star.classList.remove("filled");
        }
      });
    }

    // Atualizar total de avaliações
    if (totalAvaliacoes)
      totalAvaliacoes.textContent = `(${filme.avaliacoes.length} avaliações)`;

    // Exibir avaliações
    if (avaliacoesContainer && nenhumaAvaliacaoMsg) {
      if (filme.avaliacoes.length > 0) {
        nenhumaAvaliacaoMsg.style.display = "none";
        avaliacoesContainer.innerHTML = "";

        filme.avaliacoes.forEach((avaliacao) => {
          const avaliacaoElement = document.createElement("div");
          avaliacaoElement.className = "review-item";

          const headerElement = document.createElement("div");
          headerElement.className = "review-header";

          const userElement = document.createElement("span");
          userElement.className = "reviewer";
          userElement.textContent = avaliacao.usuario;

          const ratingElement = document.createElement("div");
          ratingElement.className = "review-rating";

          // Adicionar estrelas
          for (let i = 1; i <= 5; i++) {
            const starElement = document.createElement("span");
            starElement.className = `star ${
              i <= avaliacao.nota ? "filled" : ""
            }`;
            starElement.innerHTML = "&#9733;";
            ratingElement.appendChild(starElement);
          }

          const dateElement = document.createElement("span");
          dateElement.className = "review-date";
          dateElement.textContent = avaliacao.data;

          const commentElement = document.createElement("p");
          commentElement.textContent = avaliacao.comentario;

          headerElement.appendChild(userElement);
          headerElement.appendChild(ratingElement);
          headerElement.appendChild(dateElement);

          avaliacaoElement.appendChild(headerElement);
          avaliacaoElement.appendChild(commentElement);

          avaliacoesContainer.appendChild(avaliacaoElement);
        });
      } else {
        nenhumaAvaliacaoMsg.style.display = "block";
      }
    }
  }

  // Função para inicializar o sistema de avaliação por estrelas
  function initStarRating() {
    const stars = document.querySelectorAll(".rating-stars .star");
    const ratingValue = document.getElementById("ratingValue");

    stars.forEach((star, index) => {
      star.addEventListener("click", function () {
        const value = index + 1;
        ratingValue.value = value;

        // Atualizar visual das estrelas
        stars.forEach((s, i) => {
          if (i < value) {
            s.classList.add("selected");
            s.classList.add("filled");
          } else {
            s.classList.remove("selected");
            s.classList.remove("filled");
          }
        });
      });

      star.addEventListener("mouseover", function () {
        const value = index + 1;

        // Destacar estrelas no hover
        stars.forEach((s, i) => {
          if (i < value) {
            s.classList.add("hover");
          } else {
            s.classList.remove("hover");
          }
        });
      });

      star.addEventListener("mouseout", function () {
        // Remover destaque ao sair do hover
        stars.forEach((s) => {
          s.classList.remove("hover");
        });
      });
    });
  }

  // Função para verificar autenticação
  function checkAuthentication() {
    const authToken = localStorage.getItem("auth_token");
    const expiration = localStorage.getItem("auth_expiration");
    const username = localStorage.getItem("auth_username");

    // Verificações de segurança mais robustas
    if (!authToken || !expiration || !username) {
      // Limpar dados incompletos para evitar problemas
      clearAuthData();
      hideAuthenticatedContent();
      return false;
    }

    const expirationTime = parseInt(expiration);

    // Verificar se o timestamp é válido
    if (isNaN(expirationTime)) {
      clearAuthData();
      hideAuthenticatedContent();
      return false;
    }

    // Se o token expirou, limpar dados
    if (Date.now() > expirationTime) {
      clearAuthData();
      hideAuthenticatedContent();
      return false;
    }

    // Renovar o tempo de expiração a cada ação (se não for "lembrar de mim")
    if (expirationTime - Date.now() < 30 * 24 * 60 * 60 * 1000) {
      const newExpiration = Date.now() + 60 * 60 * 1000; // 1 hora
      localStorage.setItem("auth_expiration", newExpiration.toString());
    }

    // Mostrar conteúdo para usuários autenticados
    showAuthenticatedContent(username);
    return true;
  }

  // Esconder elementos que exigem autenticação
  function hideAuthenticatedContent() {
    // Esconder o formulário de avaliação
    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
      reviewForm.style.display = "none";
    }

    // Mostrar a mensagem de login
    const loginMessage = document.getElementById("loginMessage");
    if (loginMessage) {
      loginMessage.style.display = "block";
    }
  }

  // Mostrar elementos para usuários autenticados
  function showAuthenticatedContent(username) {
    // Mostrar o formulário de avaliação
    const reviewForm = document.getElementById("reviewForm");
    if (reviewForm) {
      reviewForm.style.display = "block";
    }

    // Esconder a mensagem de login
    const loginMessage = document.getElementById("loginMessage");
    if (loginMessage) {
      loginMessage.style.display = "none";
    }

    // Exibir nome do usuário no formulário se necessário
    const userDisplayElement = document.getElementById("currentUser");
    if (userDisplayElement) {
      userDisplayElement.textContent = username;
    }
  }

  // Função para limpar todos os dados de autenticação
  function clearAuthData() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiration");
    localStorage.removeItem("auth_username");
    sessionStorage.clear();
  }
});
