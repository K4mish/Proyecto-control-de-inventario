const API_URL = "http://localhost:3000/api/categorias";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Token actual:', token);
    if (!token) {
        alert('No has iniciado sesión. Por favor inicia sesión primero.');
        throw new Error('Token no encontrado');
    }

    const tableBody = document.getElementById("categoryTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    //  CARGAR CATEGORÍAS
    async function loadCategories() {
        try {
            const res = await fetch(API_URL, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const categorias = await res.json();
            tableBody.innerHTML = "";

            if (!Array.isArray(categorias)) {
                alert("Error al cargar categorías.");
                return;
            }

            categorias.forEach((c) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${c.idCategoria}</td>
                    <td>${c.nombre}</td>
                    <td>${c.descripcion || ''}</td>
                    <td>
                        <button onclick="openEditModal('${c.idCategoria}', '${c.nombre}', '${c.descripcion || ''}')">Editar</button>
                        <button onclick="deleteCategory(${c.idCategoria})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error("Error al cargar categorías:", error);
        }
    }
    //  ELIMINAR CATEGORÍA
    async function deleteCategory(id) {
        if (confirm("¿Seguro que deseas eliminar esta categoría?")) {
            await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            loadCategories();
        }
    }
    window.deleteCategory = deleteCategory;
    //  ABRIR MODAL AGREGAR
    openAddModalBtn.addEventListener("click", () => {addModal.style.display = "flex";});
    // CERRAR MODAL AGREGAR
    closeAddModal.addEventListener("click", () => {addModal.style.display = "none";});
    //  AGREGAR CATEGORÍA
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("addCategory").value;
        const descripcion = document.getElementById("addDescription").value;

        const nuevaCategoria = { nombre, descripcion };

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(nuevaCategoria),
            });

            if (!res.ok) throw new Error("Error al crear categoría");

            alert("Categoría agregada correctamente");
            addModal.style.display = "none";
            addForm.reset();
            loadCategories();

        } catch (error) {
            console.error(error);
            alert("No se pudo crear la categoría");
        }
    });
    //  ABRIR MODAL EDITAR
    window.openEditModal = function(id, nombre, descripcion) {
        editModal.style.display = "flex";
        document.getElementById("editId").value = id;
        document.getElementById("editCategory").value = nombre;
        document.getElementById("editDescription").value = descripcion;
    };
    // CERAR MODAL EDITAR
    closeEditModal.addEventListener("click", () => {editModal.style.display = "none";});
    //  GUARDAR EDICIÓN
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const nombre = document.getElementById("editCategory").value;
        const descripcion = document.getElementById("editDescription").value;

        const categoriaActualizada = { nombre, descripcion };

        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(categoriaActualizada)
            });

            alert("Categoría actualizada correctamente");
            editModal.style.display = "none";
            loadCategories();

        } catch (error) {
            console.error(error);
            alert("Error al actualizar categoría");
        }
    });
    // Cargar al inicio
    loadCategories();
});