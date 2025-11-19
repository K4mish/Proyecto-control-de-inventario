const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})
// Manejo del formulario de inicio de sesión
document.getElementById("formLogin").addEventListener("submit", async(e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    const response = await fetch('http://localhost:3000/api/inicio-sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
    });
    const data = await response.json();
    alert(data.mensaje);
    if (data.token){
        localStorage.setItem('token', data.token);
        if (data.rol === 'admin'){
            window.location.href = '../html/vistaAdmin.html';
        } else {
            window.location.href = '../html/vistaUsuario.html';
        }
    }
});
// Manejo del formulario de registro
document.getElementById("formRegister").addEventListener("submit", async(e) => {
    e.preventDefault();

    const usuarioRegistro = document.getElementById("usuarioRegistro").value.trim();
    const correoRegistro = document.getElementById("correoRegistro").value;
    const contrasenaRegistro = document.getElementById("contrasenaRegistro").value;
    const cedulaRegistro = document.getElementById("cedulaRegistro").value;
    const telefonoRegistro = document.getElementById("telefonoRegistro").value;
    // Separar nombre y apellido si es posible
    let partes = usuarioRegistro.split(' ').filter(p => p.trim() !== '');

    let nombre = partes[0] || '';
    let apellido = partes.slice(1).join(' ') || 'N/A';

    console.log({
    nombre,
    apellido,
    cedula: cedulaRegistro,
    telefono: telefonoRegistro,
    correo: correoRegistro,
    contrasena: contrasenaRegistro,
    rol: 'empleado'
});

    const response = await fetch('http://localhost:3000/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          apellido: apellido,
          cedula: cedulaRegistro,
          telefono: telefonoRegistro,
          correo: correoRegistro,
          contrasena: contrasenaRegistro,
          rol: 'empleado'
        })
    });
    const data = await response.json();
    if (response.ok){
      alert(data.mensaje);
      document.getElementById("formRegister").reset();
      window.location.href = '../html/index.html';
    } else {
      alert(data.mensaje || 'Error en el registro');
    }
});