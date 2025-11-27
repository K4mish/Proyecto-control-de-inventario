const API_URL = "http://localhost:3000/api/usuarios";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('No has iniciado sesión. Por favor inicia sesión primero.');
        throw new Error('Token no encontrado');
    }

    const tableBody = document.getElementById("userTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    // CARGAR USUARIOS
    async function loadUsers() {
        try {
        const res = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json(); // recibe { usuarios: [...] }
        const usuarios = data.usuarios;

        tableBody.innerHTML = "";

        if (!Array.isArray(usuarios)) {
            alert("Error al cargar usuarios.");
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
                    <button onclick="openEditModal('${u.idUsuario}', '${u.nombre}', '${u.apellido}', '${u.cedula}', '${u.telefono}', '${u.correo}', '${u.roles_id}')">Editar</button>
                    <button onclick="deleteUser(${u.idUsuario})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
        }
    }
    // ELIMINAR USUARIO
    async function deleteUser(id) {
        if (confirm("¿Seguro que deseas eliminar este usuario?")) {
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            loadUsers();
        }
    }
    window.deleteUser = deleteUser;
    // MODAL AGREGAR
    openAddModalBtn.addEventListener("click", () => { addModal.style.display = "flex"; });
    closeAddModal.addEventListener("click", () => { addModal.style.display = "none"; });

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("addNombre").value;
        const apellido = document.getElementById("addApellido").value;
        const cedula = document.getElementById("addCedula").value;
        const telefono = document.getElementById("addTelefono").value;
        const correo = document.getElementById("addCorreo").value;
        const contrasena = document.getElementById("addContrasena").value;
        const roles_id = document.getElementById("addRol").value;

        const newUser = { nombre, apellido, cedula, telefono, correo, contrasena, roles_id };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });

            if (!res.ok) throw new Error("Error al crear usuario");

            alert("Usuario agregado correctamente");
            addModal.style.display = "none";
            addForm.reset();
            loadUsers();
        } catch (error) {
            console.error(error);
            alert("No se pudo crear el usuario");
        }
    });
    // MODAL EDITAR
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
    closeEditModal.addEventListener("click", () => { editModal.style.display = "none"; });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const nombre = document.getElementById("editNombre").value;
        const apellido = document.getElementById("editApellido").value;
        const cedula = document.getElementById("editCedula").value;
        const telefono = document.getElementById("editTelefono").value;
        const correo = document.getElementById("editCorreo").value;
        const roles_id = document.getElementById("editRol").value;

        const updatedUser = { nombre, apellido, cedula, telefono, correo, roles_id };
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedUser)
            });

            alert("Usuario actualizado correctamente");
            editModal.style.display = "none";
            loadUsers();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar usuario");
        }
    });
    // Cargar usuarios al inicio
    loadUsers();
});