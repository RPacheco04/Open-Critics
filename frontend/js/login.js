/**
 * Script específico para a página de login
 */
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const passwordField = document.getElementById("password");

  checkExistingSession();

  // Funcionalidade para mostrar/ocultar senha
  if (togglePasswordBtn && passwordField) {
    togglePasswordBtn.addEventListener("click", function () {
      const type =
        passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);

      this.querySelector("i").classList.toggle("fa-eye");
      this.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Validação do formulário
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value;
      const rememberMe = document.getElementById("remember-me")
        ? document.getElementById("remember-me").checked
        : false;

      // Verificar campos vazios
      if (!username) {
        showMessage("O nome de usuário é obrigatório", "error");
        document.getElementById("username").focus();
        return;
      }

      if (!password) {
        showMessage("A senha é obrigatória", "error");
        document.getElementById("password").focus();
        return;
      }

      showMessage("Autenticando...", "info");

      ApiService.auth
        .login(username, password, rememberMe)
        .then((response) => {
          showMessage("Login realizado com sucesso!", "success");

          // Armazenar dados de autenticação
          localStorage.setItem("auth_token", response.token);
          localStorage.setItem("auth_username", response.user.username);

          if (rememberMe) {
            // 30 dias de expiração
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);
            localStorage.setItem(
              "auth_expiration",
              expirationDate.getTime().toString()
            );
          } else {
            // 1 hora de expiração
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);
            localStorage.setItem(
              "auth_expiration",
              expirationDate.getTime().toString()
            );
          }

          localStorage.setItem("user_info", JSON.stringify(response.user));

          setTimeout(function () {
            window.location.href = "dashboard.html";
          }, 1000);
        })
        .catch((error) => {
          console.error("Erro de autenticação:", error);
          showMessage("Nome de usuário ou senha incorretos", "error");
        });
    });
  }

  // Verificar parâmetros da URL para exibir mensagens
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error === "session_expired") {
      showMessage(
        "Sua sessão expirou. Por favor, faça login novamente.",
        "error"
      );
    }
  }

  // Verificar se já existe uma sessão ativa
  function checkExistingSession() {
    const authToken = localStorage.getItem("auth_token");
    const expiration = localStorage.getItem("auth_expiration");
    const username = localStorage.getItem("auth_username");

    if (!authToken || !expiration || !username) {
      clearAuthData();
      return false;
    }

    const expirationTime = parseInt(expiration);

    if (isNaN(expirationTime)) {
      clearAuthData();
      return false;
    }

    // Se há um token válido que não expirou, redirecionar para o dashboard
    if (Date.now() < expirationTime) {
      window.location.href = "dashboard.html";
      return true;
    } else {
      // Se o token expirou, limpar dados
      clearAuthData();
      return false;
    }
  }

  // Função para limpar todos os dados de autenticação
  function clearAuthData() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_expiration");
    localStorage.removeItem("auth_username");
    localStorage.removeItem("user_info");
  }

  // Função para exibir mensagens de sucesso ou erro
  function showMessage(message, type) {
    const existingMessage = document.querySelector(".message");
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", type);
    messageElement.textContent = message;

    const loginContainer = document.querySelector(".login-container");
    loginContainer.insertBefore(messageElement, loginForm);

    if (type !== "info") {
      setTimeout(function () {
        messageElement.remove();
      }, 5000);
    }
  }

  checkUrlParams();
});
