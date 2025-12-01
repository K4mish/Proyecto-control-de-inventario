const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => { container.classList.add('active'); })
loginBtn.addEventListener('click', () => { container.classList.remove('active'); })

// --- MODAL DE MENSAJES (REEMPLAZO DE ALERTS) ---
const msgModal = document.getElementById('messageModal');
const msgTitle = document.getElementById('msgTitle');
const msgText = document.getElementById('msgText');
const msgBtnOk = document.getElementById('msgBtnOk');

function mostrarMensaje(titulo, texto) {
    msgTitle.textContent = titulo;
    msgText.textContent = texto;
    
    if (titulo.toLowerCase().includes('error') || titulo.toLowerCase().includes('atención')) {
        msgTitle.style.color = '#e84118';
    } else {
        msgTitle.style.color = '#64b055';
    }

    msgModal.style.display = 'flex';
    setTimeout(() => { msgModal.classList.add('active'); }, 10);
}
// Cerrar modal de mensaje
msgBtnOk.addEventListener('click', () => {
    msgModal.classList.remove('active');
    setTimeout(() => { msgModal.style.display = 'none'; }, 300);
});
// --- LÓGICA LOGIN ---
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
        
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('rol', data.rol);
            mostrarMensaje("Bienvenido", data.mensaje);
            msgBtnOk.onclick = () => {
                window.location.href = '../html/vistaGeneral.html';
            };
        } else {
            mostrarMensaje("Error", data.mensaje || "Credenciales incorrectas");
        }
    } catch (error) {
        console.error("Error:", error);
        mostrarMensaje("Error", "Error al conectar con el servidor");
    }
});
// --- LÓGICA REGISTRO ---
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
            mostrarMensaje("Registro Exitoso", data.mensaje);
            document.getElementById("formRegister").reset();
            msgBtnOk.onclick = () => {
                msgModal.classList.remove('active');
                setTimeout(() => { msgModal.style.display = 'none'; }, 300);
                container.classList.remove('active');
            };
        } else {
            mostrarMensaje("Error en Registro", data.mensaje || 'No se pudo registrar');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje("Error", "Error en el servidor");
    }
});
// --- LÓGICA MODAL RECUPERAR CONTRASEÑA ---
const forgotModal = document.getElementById('forgotModal');
const forgotBtn = document.getElementById('forgotBtn');
const closeForgot = document.querySelector('.close-forgot');

forgotBtn.addEventListener('click', (e) => {
    e.preventDefault();
    forgotModal.style.display = 'flex';
    setTimeout(() => { forgotModal.classList.add('active'); }, 10);
});

function cerrarModalForgot() {
    forgotModal.classList.remove('active');
    setTimeout(() => { forgotModal.style.display = 'none'; }, 300);
}

closeForgot.addEventListener('click', cerrarModalForgot);
window.addEventListener('click', (e) => {
    if (e.target === forgotModal) cerrarModalForgot();
});
// --- ENVÍO FORMULARIO RECUPERACIÓN ---
document.getElementById("formRecovery").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("emailRecovery").value;
    cerrarModalForgot();
    setTimeout(() => {
        mostrarMensaje("Correo Enviado", `Se ha enviado un código de recuperación a: ${email}`);
        msgBtnOk.onclick = () => {
            msgModal.classList.remove('active');
            setTimeout(() => { msgModal.style.display = 'none'; }, 300);
        };
    }, 350);
});