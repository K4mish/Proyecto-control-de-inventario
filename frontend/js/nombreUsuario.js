// Obtener usuario desde localStorage
const nombre = localStorage.getItem("usuarioActivo");
if (nombre) {
  document.getElementById("nombreUsuario").textContent = nombre;
} else {
  window.location.href = "index.html"; // redirige si no hay login
}