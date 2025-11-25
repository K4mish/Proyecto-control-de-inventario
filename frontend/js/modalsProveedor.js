const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_CATEGORIAS = "http://localhost:3000/api/categorias";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('No has iniciado sesión');
        throw new Error('Token no encontrado');
    }

    const tableBody = document.getElementById("providerTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    const contactModal = document.getElementById("contactModal");
    const contactName = document.getElementById("contactName");
    const contactPhone = document.getElementById("contactPhone");
    const contactEmail = document.getElementById("contactEmail");
    const closeContactModal = document.getElementById("closeContactModal");

    const addCategoria = document.getElementById("addCategoria");
    const editCategoria = document.getElementById("editCategoria");

    // Cargar categoria en los select
    let categoriasMap = {};
    async function loadCategorias() {
        try {
            const res = await fetch(API_URL_CATEGORIAS, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const categorias = await res.json();

            categoriasMap = {}; // reinicia
            categorias.forEach(cat => {
                categoriasMap[cat.idCategoria] = cat.nombre;

                // Llena selects
                const optionAdd = document.createElement("option");
                optionAdd.value = cat.idCategoria;
                optionAdd.textContent = cat.nombre;
                addCategoria.appendChild(optionAdd);

                const optionEdit = document.createElement("option");
                optionEdit.value = cat.idCategoria;
                optionEdit.textContent = cat.nombre;
                editCategoria.appendChild(optionEdit);
            });
        } catch (err) {
            console.error("Error cargando categorías:", err);
        }
    }
    // Cargar proveedores
    async function loadProviders() {
        try {
            const res = await fetch(API_URL_PROVEEDORES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const proveedores = await res.json();
            tableBody.innerHTML = "";

            if (!Array.isArray(proveedores)) return;

            proveedores.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${p.idProveedor}</td>
                    <td>${p.nombre}</td>
                    <td>${p.telefono}</td>
                    <td>${p.correo}</td>
                    <td>${p.direccion}</td>
                    <td>${p.ciudad}</td>
                    <td>${p.estado}</td>
                    <td>${categoriasMap[p.categoria_id] || "Sin categoría"}</td>
                    <td>
                        <button onclick="openEditModal('${p.idProveedor}', '${p.nombre}', '${p.telefono}', '${p.correo}', '${p.direccion}', '${p.ciudad}', '${p.nombreContacto}', '${p.telefonoContacto}', '${p.correoContacto}', '${p.estado}', '${p.categoria_id}')">Editar</button>
                        <button onclick="deleteProvider(${p.idProveedor})">Eliminar</button>
                        <button onclick="showContactModal('${p.nombreContacto}','${p.telefonoContacto}','${p.correoContacto}')">Contacto</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(error);
        }
    }
    // Mostrar contacto
    function showContactModal(nombreContacto, telefonoContacto, correoContacto) {
        contactName.textContent = nombreContacto;
        contactPhone.textContent = telefonoContacto;
        contactEmail.textContent = correoContacto;
        contactModal.style.display = "flex";
    }
    closeContactModal.addEventListener("click", () => { contactModal.style.display = "none"; });
    window.showContactModal = showContactModal;
    // Eliminar proveedor
    async function deleteProvider(id) {
        if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;
        try {
            const res = await fetch(`${API_URL_PROVEEDORES}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("No se pudo eliminar el proveedor");
            loadProviders();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }
    window.deleteProvider = deleteProvider;
    // Modal Agregar
    openAddModalBtn.addEventListener("click", () => { addModal.style.display = "flex"; });
    closeAddModal.addEventListener("click", () => { addModal.style.display = "none"; });

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nuevoProveedor = {
            nombre: document.getElementById("addNombre").value,
            telefono: document.getElementById("addTelefono").value,
            correo: document.getElementById("addCorreo").value,
            direccion: document.getElementById("addDireccion").value,
            ciudad: document.getElementById("addCiudad").value,
            nombreContacto: document.getElementById("addNombreContacto").value,
            telefonoContacto: document.getElementById("addTelefonoContacto").value,
            correoContacto: document.getElementById("addCorreoContacto").value,
            estado: document.getElementById("addEstado").value,
            categoria_id: parseInt(document.getElementById("addCategoria").value)
        };
        try {
            const res = await fetch(API_URL_PROVEEDORES, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(nuevoProveedor)
            });
            if (!res.ok) throw new Error("Error al agregar proveedor");
            addModal.style.display = "none";
            addForm.reset();
            loadProviders();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
    // Modal Editar
    window.openEditModal = function(id, nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, categoria_id) {
        editModal.style.display = "flex";
        document.getElementById("editId").value = id;
        document.getElementById("editNombre").value = nombre;
        document.getElementById("editTelefono").value = telefono;
        document.getElementById("editCorreo").value = correo;
        document.getElementById("editDireccion").value = direccion;
        document.getElementById("editCiudad").value = ciudad;
        document.getElementById("editNombreContacto").value = nombreContacto;
        document.getElementById("editTelefonoContacto").value = telefonoContacto;
        document.getElementById("editCorreoContacto").value = correoContacto;
        document.getElementById("editEstado").value = estado;
        document.getElementById("editCategoria").value = categoria_id;
    };

    closeEditModal.addEventListener("click", () => { editModal.style.display = "none"; });

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editId").value;
        const proveedorActualizado = {
            nombre: document.getElementById("editNombre").value,
            telefono: document.getElementById("editTelefono").value,
            correo: document.getElementById("editCorreo").value,
            direccion: document.getElementById("editDireccion").value,
            ciudad: document.getElementById("editCiudad").value,
            nombreContacto: document.getElementById("editNombreContacto").value,
            telefonoContacto: document.getElementById("editTelefonoContacto").value,
            correoContacto: document.getElementById("editCorreoContacto").value,
            estado: document.getElementById("editEstado").value,
            categoria_id: parseInt(document.getElementById("editCategoria").value)
        };
        try {
            const res = await fetch(`${API_URL_PROVEEDORES}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(proveedorActualizado)
            });
            if (!res.ok) throw new Error("Error al actualizar proveedor");
            editModal.style.display = "none";
            loadProviders();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
    loadCategorias();
    loadProviders();
});