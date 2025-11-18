const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

function validarLogin() {
  event.preventDefault();
  const usuario = document.getElementById("usuario").value;
  const contrasena = document.getElementById("clave").value;

  if (usuario === "admin" && contrasena === "admin123") {
    localStorage.setItem("usuarioActivo", usuario);
    window.location.href = "vistaAdmin.html";
  } else if (usuario && contrasena) {
    // Permite cualquier usuario y contraseña (excepto admin)
    localStorage.setItem("usuarioActivo", usuario);
    window.location.href = "vistaUsuario.html";
  } else {
    alert("Usuario o contraseña incorrectos");
  }
}