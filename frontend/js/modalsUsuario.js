const API_URL = "http://localhost:3000/api/usuarios";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = '../html/index.html';
        return;
    }

    // --- LÓGICA MODAL MENSAJES ---
    const msgModal = document.getElementById('messageModal');
    const msgTitle = document.getElementById('msgTitle');
    const msgText = document.getElementById('msgText');
    const msgBtnOk = document.getElementById('msgBtnOk');

    function mostrarMensaje(titulo, mensaje) {
        msgTitle.textContent = titulo;
        msgTitle.style.color = titulo.toLowerCase().includes('error') ? '#e84118' : '#273c75';
        msgText.textContent = mensaje;
        msgModal.style.display = 'flex';
    }
    if(msgBtnOk) msgBtnOk.addEventListener('click', () => msgModal.style.display = 'none');

    const tableBody = document.getElementById("userTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    async function loadUsers() {
        try {
            const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const usuarios = data.usuarios;
            tableBody.innerHTML = "";

            if (!Array.isArray(usuarios)) {
                mostrarMensaje("Error", "Error al cargar usuarios.");
                return;
            }

            usuarios.forEach((u) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${u.idUsuario}</td>
                    <td>${u.nombre}</td>
                    <td>${u.apellido}</td>
                    <td>${u.cedula}</td>
                    <td>${u.telefono}</td>
                    <td>${u.correo}</td>
                    <td>${u.rol}</td>
                    <td>
                        <button onclick="openEditModal('${u.idUsuario}', '${u.nombre}', '${u.apellido}', '${u.cedula}', '${u.telefono}', '${u.correo}', '${u.roles_id}')"><i class="bi bi-pencil-square"></i></button>
                        <button onclick="deleteUser(${u.idUsuario})"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteUser(id) {
        if (confirm("¿Seguro que deseas eliminar este usuario?")) {
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            mostrarMensaje("Éxito", "Usuario eliminado");
            loadUsers();
        }
    }
    window.deleteUser = deleteUser;

    if(openAddModalBtn) openAddModalBtn.addEventListener("click", () => { addModal.style.display = "flex"; });
    if(closeAddModal) closeAddModal.addEventListener("click", () => { addModal.style.display = "none"; });

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newUser = { 
            nombre: document.getElementById("addNombre").value,
            apellido: document.getElementById("addApellido").value,
            cedula: document.getElementById("addCedula").value,
            telefono: document.getElementById("addTelefono").value,
            correo: document.getElementById("addCorreo").value,
            contrasena: document.getElementById("addContrasena").value,
            roles_id: document.getElementById("addRol").value
        };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(newUser)
            });

            if (!res.ok) throw new Error("Error al crear usuario");

            mostrarMensaje("Éxito", "Usuario agregado correctamente");
            addModal.style.display = "none";
            addForm.reset();
            loadUsers();
        } catch (error) {
            mostrarMensaje("Error", "No se pudo crear el usuario");
        }
    });

    window.openEditModal = function(id, nombre, apellido, cedula, telefono, correo, roles_id) {
        editModal.style.display = "flex";
        document.getElementById("editId").value = id;
        document.getElementById("editNombre").value = nombre;
        document.getElementById("editApellido").value = apellido;
        document.getElementById("editCedula").value = cedula;
        document.getElementById("editTelefono").value = telefono;
        document.getElementById("editCorreo").value = correo;
        document.getElementById("editRol").value = roles_id;
    };
    
    if(closeEditModal) closeEditModal.addEventListener("click", () => { editModal.style.display = "none"; });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editId").value;
        const updatedUser = { 
            nombre: document.getElementById("editNombre").value,
            apellido: document.getElementById("editApellido").value,
            cedula: document.getElementById("editCedula").value,
            telefono: document.getElementById("editTelefono").value,
            correo: document.getElementById("editCorreo").value,
            roles_id: document.getElementById("editRol").value
        };
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(updatedUser)
            });

            mostrarMensaje("Éxito", "Usuario actualizado correctamente");
            editModal.style.display = "none";
            loadUsers();
        } catch (error) {
            mostrarMensaje("Error", "Error al actualizar usuario");
        }
    });

    window.addEventListener("click", (e) => {
        if (e.target === addModal) addModal.style.display = "none";
        if (e.target === editModal) editModal.style.display = "none";
        if (e.target === msgModal) msgModal.style.display = "none";
    });

    loadUsers();
});