const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_CATEGORIAS = "http://localhost:3000/api/categorias";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        window.location.href = "../html/index.html";
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

    const tableBody = document.getElementById("providerTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const contactModal = document.getElementById("contactModal");
    const closeContactModal = document.getElementById("closeContactModal");
    const addCategoria = document.getElementById("addCategoria");
    const editCategoria = document.getElementById("editCategoria");

    let categoriasMap = {};
    async function loadCategorias() {
        try {
            const res = await fetch(API_URL_CATEGORIAS, { headers: { "Authorization": `Bearer ${token}` } });
            const categorias = await res.json();
            categoriasMap = {};
            categorias.forEach(cat => {
                categoriasMap[cat.idCategoria] = cat.nombre;
                const optionAdd = document.createElement("option"); optionAdd.value = cat.idCategoria; optionAdd.textContent = cat.nombre; addCategoria.appendChild(optionAdd);
                const optionEdit = document.createElement("option"); optionEdit.value = cat.idCategoria; optionEdit.textContent = cat.nombre; editCategoria.appendChild(optionEdit);
            });
        } catch (err) { console.error("Error cargando categorías:", err); }
    }

    async function loadProviders() {
        try {
            const res = await fetch(API_URL_PROVEEDORES, { headers: { "Authorization": `Bearer ${token}` } });
            const proveedores = await res.json();
            tableBody.innerHTML = "";
            if (!Array.isArray(proveedores)) return;
            proveedores.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${p.idProveedor}</td><td>${p.nombre}</td><td>${p.telefono}</td><td>${p.correo}</td><td>${p.direccion}</td><td>${p.ciudad}</td><td>${p.estado}</td><td>${categoriasMap[p.categoria_id] || "Sin categoría"}</td>
                    <td>
                        <button onclick="openEditModal('${p.idProveedor}', '${p.nombre}', '${p.telefono}', '${p.correo}', '${p.direccion}', '${p.ciudad}', '${p.nombreContacto}', '${p.telefonoContacto}', '${p.correoContacto}', '${p.estado}', '${p.categoria_id}')"><i class="bi bi-pencil-square"></i></button>
                        <button onclick="deleteProvider(${p.idProveedor})"><i class="bi bi-trash"></i></button>
                        <button onclick="showContactModal('${p.nombreContacto}','${p.telefonoContacto}','${p.correoContacto}')"><i class="bi bi-person-circle"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) { console.error(error); }
    }

    window.showContactModal = function(nombre, tel, email) {
        document.getElementById("contactName").textContent = nombre;
        document.getElementById("contactPhone").textContent = tel;
        document.getElementById("contactEmail").textContent = email;
        contactModal.style.display = "flex";
    }
    if(closeContactModal) closeContactModal.addEventListener("click", () => { contactModal.style.display = "none"; });

    window.deleteProvider = async function(id) {
        if (!confirm("¿Seguro que deseas eliminar este proveedor?")) return;
        try {
            const res = await fetch(`${API_URL_PROVEEDORES}/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) throw new Error("No se pudo eliminar");
            mostrarMensaje("Éxito", "Proveedor eliminado");
            loadProviders();
        } catch (err) { mostrarMensaje("Error", err.message); }
    }

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
                method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(nuevoProveedor)
            });
            if (!res.ok) throw new Error("Error al agregar");
            mostrarMensaje("Éxito", "Proveedor agregado");
            addModal.style.display = "none";
            addForm.reset();
            loadProviders();
        } catch (err) { mostrarMensaje("Error", err.message); }
    });

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
                method: "PUT", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(proveedorActualizado)
            });
            if (!res.ok) throw new Error("Error al actualizar");
            mostrarMensaje("Éxito", "Proveedor actualizado");
            editModal.style.display = "none";
            loadProviders();
        } catch (err) { mostrarMensaje("Error", err.message); }
    });

    window.onclick = (e) => {
        if(e.target == addModal) addModal.style.display = "none";
        if(e.target == editModal) editModal.style.display = "none";
        if(e.target == contactModal) contactModal.style.display = "none";
        if(e.target == msgModal) msgModal.style.display = "none";
    }
    loadCategorias();
    loadProviders();
});