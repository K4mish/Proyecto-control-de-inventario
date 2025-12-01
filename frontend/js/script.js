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

    try {
        const response = await fetch('http://localhost:3000/api/inicio-sesion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, contrasena })
        });
        const data = await response.json();
        alert(data.mensaje);
        if (data.token){
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            window.location.href = '../html/vistaGeneral.html';
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error al conectar con el servidor");
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
    
    let partes = usuarioRegistro.split(' ').filter(p => p.trim() !== '');
    let nombre = partes[0] || '';
    let apellido = partes.slice(1).join(' ') || 'N/A';

    try {
        const response = await fetch('http://localhost:3000/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre, apellido, cedula: cedulaRegistro, telefono: telefonoRegistro,
                correo: correoRegistro, contrasena: contrasenaRegistro, rol: 'empleado'
            })
        });
        const data = await response.json();
        if (response.ok){
            alert(data.mensaje);
            document.getElementById("formRegister").reset();
            container.classList.remove('active'); 
        } else {
            alert(data.mensaje || 'Error en el registro');
        }
    } catch (error) {
        console.error(error);
        alert("Error en el servidor");
    }
});
// --- LÓGICA DEL MODAL DE RECUPERACIÓN (NUEVO) ---
const forgotModal = document.getElementById('forgotModal');
const forgotBtn = document.getElementById('forgotBtn');
const closeForgot = document.querySelector('.close-forgot');

// Abrir modal
forgotBtn.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.style.display = 'flex';
    setTimeout(() => {
        forgotModal.classList.add('active');
    }, 10);
});
// Función para cerrar modal
function cerrarModalForgot() {
    forgotModal.classList.remove('active');
    setTimeout(() => {
        forgotModal.style.display = 'none';
    }, 300);
}
// Cerrar con la X
closeForgot.addEventListener('click', cerrarModalForgot);
// Cerrar si se hace clic fuera del contenido blanco
window.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
        cerrarModalForgot();
    }
});
// Manejo del envío del formulario de recuperación
document.getElementById("formRecovery").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailRecovery").value;
    // Simulación por ahora:
    alert(`Se ha enviado un código de recuperación a: ${email}`);
    cerrarModalForgot();
});