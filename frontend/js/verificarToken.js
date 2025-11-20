document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '../html/index.html';
    } else {
      cargarUsuario(token);
  }
});

async function cargarUsuario(token) {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = '../html/index.html';
      return;
    }
    const data = await response.json();
    // Mostar el nombre del usuario en la interfaz
    document.getElementById('nombreUsuario').textContent = data.nombreCompleto;
  } catch (error) {
    console.error('Error al cargar el usuario:', error);
    window.location.href = '../html/index.html';
  }
}