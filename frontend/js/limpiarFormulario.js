document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('formulario');
  const boton = document.getElementById('accionBtn');
  const mensaje = document.getElementById('mensaje');

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const accion = boton.textContent.trim().toUpperCase();

    switch (accion) {
      case 'GUARDAR':
        mensaje.textContent = 'Producto guardado correctamente.';
        break;
      case 'EDITAR':
        mensaje.textContent = 'Producto editado correctamente.';
        break;
      case 'ELIMINAR':
        mensaje.textContent = 'Producto eliminado correctamente.';
        break;
      default:
        mensaje.textContent = 'Acción no reconocida.';
        return;
    }

    mensaje.style.display = 'block';

    // Limpiar el formulario
    form.reset();

    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
      mensaje.style.display = 'none';
    }, 2000);
  });
});