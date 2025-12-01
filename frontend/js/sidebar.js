// Botones y elementos
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const rolUsuario = localStorage.getItem('rol');

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
// Permisos para empleado
document.addEventListener("DOMContentLoaded", () => {
    if (rolUsuario === 'empleado'){
        const listaMenu = sidebar.querySelector('ul');
        const items = listaMenu.querySelectorAll('li');

        items.forEach(item => {
            const link = item.querySelector('a').getAttribute('href');
            const permitidos = [
                'gestionarProductos.html',
                'gestionarVentas.html',
                'alertasStock.html'
            ];            
            let esPermitido = false;
            permitidos.forEach(p => {
                if(link.includes(p)) esPermitido = true;
            });
            if (!esPermitido){
                item.style.display = 'none';
            }
        });
    }
});