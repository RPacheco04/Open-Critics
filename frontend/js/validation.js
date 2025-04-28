/**
 * Funções de validação para formulários
 */

// Função para exibir mensagem de erro
function showError(field, message) {
  const errorElement = document.getElementById(`${field}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    document.getElementById(field).classList.add("error");
  }
}

// Função para limpar mensagem de erro
function clearError(field) {
  const errorElement = document.getElementById(`${field}-error`);
  if (errorElement) {
    errorElement.textContent = "";
    document.getElementById(field).classList.remove("error");
  }
}

// Função para validar campo de email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar campo requerido
function isRequired(value) {
  return value.trim() !== "";
}

// Função para validar comprimento mínimo
function hasMinLength(value, minLength) {
  return value.length >= minLength;
}

// Função para validar comprimento máximo
function hasMaxLength(value, maxLength) {
  return value.length <= maxLength;
}

// Função para validar se contém apenas letras e números
function isAlphanumeric(value) {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(value);
}

// Função para validar se contém apenas números
function isNumeric(value) {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(value);
}

// Função para validar se duas senhas são iguais
function passwordsMatch(password, confirmPassword) {
  return password === confirmPassword;
}

// Função para validar senha forte
function isStrongPassword(password) {
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

// Validar formulário de login
function validateLoginForm() {
  let isValid = true;

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Validar nome de usuário
  if (!isRequired(username)) {
    showError("username", "O nome de usuário é obrigatório");
    isValid = false;
  } else {
    clearError("username");
  }

  // Validar senha
  if (!isRequired(password)) {
    showError("password", "A senha é obrigatória");
    isValid = false;
  } else {
    clearError("password");
  }

  return isValid;
}

// Validar formulário de avaliação
function validateAvaliacaoForm() {
  let isValid = true;

  // Verificar se alguma estrela foi selecionada
  const ratingInputs = document.querySelectorAll('input[name="nota"]');
  let ratingSelected = false;

  ratingInputs.forEach((input) => {
    if (input.checked) {
      ratingSelected = true;
    }
  });

  if (!ratingSelected) {
    showError("rating", "Por favor, selecione uma avaliação de 1 a 5 estrelas");
    isValid = false;
  } else {
    clearError("rating");
  }

  // Verificar se o comentário tem pelo menos 10 caracteres
  const comentario = document.getElementById("comentario").value;
  if (!isRequired(comentario)) {
    showError("comentario", "O comentário é obrigatório");
    isValid = false;
  } else if (!hasMinLength(comentario, 10)) {
    showError("comentario", "O comentário deve ter pelo menos 10 caracteres");
    isValid = false;
  } else {
    clearError("comentario");
  }

  return isValid;
}

// Adicionar eventos de validação em tempo real
document.addEventListener("DOMContentLoaded", function () {
  // Eventos para o formulário de login
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  if (usernameInput) {
    usernameInput.addEventListener("input", function () {
      if (!isRequired(this.value)) {
        showError("username", "O nome de usuário é obrigatório");
      } else {
        clearError("username");
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      if (!isRequired(this.value)) {
        showError("password", "A senha é obrigatória");
      } else {
        clearError("password");
      }
    });
  }

  // Eventos para o formulário de avaliação
  const comentarioInput = document.getElementById("comentario");

  if (comentarioInput) {
    comentarioInput.addEventListener("input", function () {
      if (!isRequired(this.value)) {
        showError("comentario", "O comentário é obrigatório");
      } else if (!hasMinLength(this.value, 10)) {
        showError(
          "comentario",
          "O comentário deve ter pelo menos 10 caracteres"
        );
      } else {
        clearError("comentario");
      }
    });
  }

  // Eventos para a avaliação por estrelas
  const starInputs = document.querySelectorAll(".star-input");

  starInputs.forEach((input) => {
    input.addEventListener("change", function () {
      clearError("rating");
    });
  });
});
