// Botones y elementos
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Abrir/cerrar sidebar
menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
});

// Cerrar al hacer clic en el overlay
overlay.addEventListener("click", () => {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
});

const nombre = localStorage.getItem("usuarioActivo");
if (nombre) {
  document.getElementById("nombreUsuario").textContent = nombre;
}

let indice = 0;
const imagenes = document.querySelectorAll('.carrusel-img');
const btnPrev = document.querySelector('.carrusel-btn.prev');
const btnNext = document.querySelector('.carrusel-btn.next');
const textos = [
  "Bienvenido a InovaX: Controla tu inventario fácilmente.",
  "Gestiona productos y ventas de manera eficiente.",
  "¡Optimiza tu negocio con nuestras herramientas!"
];
const carruselTexto = document.querySelector('.carrusel-texto');

function mostrarImagen(n) {
  imagenes.forEach(img => img.classList.remove('activa'));
  imagenes[n].classList.add('activa');
  carruselTexto.textContent = textos[n];
}

// --- Carrusel automático con reinicio de temporizador ---
let intervaloCarrusel = setInterval(avanzarCarrusel, 5000);

function avanzarCarrusel() {
  indice = (indice + 1) % imagenes.length;
  mostrarImagen(indice);
}

function reiniciarIntervalo() {
  clearInterval(intervaloCarrusel);
  intervaloCarrusel = setInterval(avanzarCarrusel, 5000);
}

btnPrev.addEventListener('click', () => {
  indice = (indice - 1 + imagenes.length) % imagenes.length;
  mostrarImagen(indice);
  reiniciarIntervalo();
});

btnNext.addEventListener('click', () => {
  indice = (indice + 1) % imagenes.length;
  mostrarImagen(indice);
  reiniciarIntervalo();
});

// Mostrar la primera imagen al cargar
mostrarImagen(indice);