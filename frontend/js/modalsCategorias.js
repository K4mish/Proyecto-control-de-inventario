const API_URL = "http://localhost:3000/api/categorias";

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

    const tableBody = document.getElementById("categoryTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    async function loadCategories() {
        try {
            const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            const categorias = await res.json();
            tableBody.innerHTML = "";
            if (!Array.isArray(categorias)) return;
            categorias.forEach((c) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${c.idCategoria}</td><td>${c.nombre}</td><td>${c.descripcion || ''}</td>
                    <td>
                        <button onclick="openEditModal('${c.idCategoria}', '${c.nombre}', '${c.descripcion || ''}')"><i class="bi bi-pencil-square"></i></button>
                        <button onclick="deleteCategory(${c.idCategoria})"><i class="bi bi-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) { console.error(error); }
    }

    async function deleteCategory(id) {
        if (confirm("¿Seguro que deseas eliminar esta categoría?")) {
            await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
            mostrarMensaje("Éxito", "Categoría eliminada");
            loadCategories();
        }
    }
    window.deleteCategory = deleteCategory;

    openAddModalBtn.addEventListener("click", () => {addModal.style.display = "flex";});
    closeAddModal.addEventListener("click", () => {addModal.style.display = "none";});

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nuevaCategoria = { 
            nombre: document.getElementById("addCategory").value, 
            descripcion: document.getElementById("addDescription").value 
        };
        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(nuevaCategoria),
            });
            if (!res.ok) throw new Error("Error");
            mostrarMensaje("Éxito", "Categoría agregada");
            addModal.style.display = "none";
            addForm.reset();
            loadCategories();
        } catch (error) { mostrarMensaje("Error", "No se pudo crear la categoría"); }
    });

    window.openEditModal = function(id, nombre, descripcion) {
        editModal.style.display = "flex";
        document.getElementById("editId").value = id;
        document.getElementById("editCategory").value = nombre;
        document.getElementById("editDescription").value = descripcion;
    };
    closeEditModal.addEventListener("click", () => {editModal.style.display = "none";});

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("editId").value;
        const categoriaActualizada = { 
            nombre: document.getElementById("editCategory").value, 
            descripcion: document.getElementById("editDescription").value 
        };
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(categoriaActualizada)
            });
            mostrarMensaje("Éxito", "Categoría actualizada");
            editModal.style.display = "none";
            loadCategories();
        } catch (error) { mostrarMensaje("Error", "Error al actualizar"); }
    });

    window.onclick = (e) => {
        if(e.target == msgModal) msgModal.style.display = "none";
        if(e.target == addModal) addModal.style.display = "none";
        if(e.target == editModal) editModal.style.display = "none";
    }
    loadCategories();
});