// REGISTRO
function registrar(nome, email, senha) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  if (usuarios.find(u => u.email === email)) {
    alert("Email já cadastrado!");
    return false;
  }

  usuarios.push({ nome, email, senha });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  alert("Conta criada com sucesso!");
  return true;
}

// LOGIN
function login(email, senha) {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    alert("Email ou senha incorretos!");
    return false;
  }

  localStorage.setItem("usuarioLogado", email);

  // 🔁 verifica se precisa voltar pro checkout
  const redirect = localStorage.getItem("redirectAposLogin");

  if (redirect) {
    localStorage.removeItem("redirectAposLogin");
    window.location.href = redirect;
  } else {
    window.location.href = "../html/site_cliente.html";
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.reload();
}

// USUÁRIO ATUAL
function getUsuario() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}