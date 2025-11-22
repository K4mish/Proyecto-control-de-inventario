const API_URL = "http://localhost:3000/api/productos";

document.addEventListener('DOMContentLoaded', () => {
    console.log('Token actual:', token);
    if (!token){
        alert('No has iniciado sesión. Por favor inicia sesión primero.');
        throw new Error('Token no encontrado');
    }
    const tableBody = document.getElementById("productTableBody");
    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");
    const closeAddModal = document.getElementById("closeAddModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");

    // CARGAR PRODUCTOS
    async function loadProducts() {
        try {
            const res = await fetch(API_URL, {
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
            });
            const products = await res.json();
            tableBody.innerHTML = "";
            if (!Array.isArray(products)){
                console.error('Respuesta inesperada:', products);
                alert('Error al cargar productos.');
                return;
            }

            products.forEach((p) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${p.idProducto}</td>
                    <td>${p.nombre}</td>
                    <td>${p.categoria}</td>
                    <td>$${Number(p.precioCompra).toFixed(2)}</td>
                    <td>$${Number(p.precioVenta).toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td><img src="${p.urlImagen}" alt="${p.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px;"></td>
                    <td>
                        <button onclick="openEditModal('${p.idProducto}', '${p.nombre}', '${p.categoria}', '${p.precioCompra}', '${p.precioVenta}', '${p.stock}', '${p.urlImagen}')">Editar</button>
                        <button onclick="deleteProduct(${p.idProducto})">Eliminar</button>
                    </td>
                `;
            tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }
    // Eliminar producto
    async function deleteProduct(id) {
        if (confirm("¿Seguro que deseas eliminar este producto?")) {
            await fetch(`${API_URL}/${id}`, { 
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            });
            loadProducts();
        }
    }

    // Abrir modal de Agregar Producto
    openAddModalBtn.addEventListener("click", () => {addModal.style.display = "flex";});
    // Cerrar modal de agregar
    closeAddModal.addEventListener("click", () => {addModal.style.display = "none";});

    // Enviar formulario de Agregar Producto
    addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

        const producto = document.getElementById("addName").value;
        const descripcion = document.getElementById("addCategory").value;
        const precio_venta = parseFloat(document.getElementById("addPrice").value);
        const precio_compra = precio_venta * 0.8; 
        const stock = parseInt(document.getElementById("addStock").value);
        const imagen_url = document.getElementById("addImage").value; 
        const fecha_compra = new Date().toISOString().split("T")[0];
        const nuevoProducto = {
            producto,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            imagen_url,
            fecha_compra,
        };

        try {
            const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(nuevoProducto),
            });

            if (!res.ok) {
                throw new Error("Error al crear el producto");
            }

            alert("Producto agregado correctamente");
            addModal.style.display = "none";
            loadProducts();
            addForm.reset();
        } catch (error) {
            console.error("Error al crear producto:", error);
            alert("No se pudo crear el producto. Revisa la consola del servidor.");
        }
    });

    // Abrir modal de Editar Producto
    function openEditModal(id, producto, descripcion, precio_compra, precio_venta, stock, imagen_url, fecha_compra) {
        editModal.style.display = "flex";
        document.getElementById("editId").value = id;
        document.getElementById("editName").value = producto;
        document.getElementById("editCategory").value = descripcion;
        document.getElementById("editPrice").value = precio_venta;
        document.getElementById("editStock").value = stock;
    }

    // Cerrar modal de editar
    closeEditModal.addEventListener("click", () => {editModal.style.display = "none";});

    // Guardar cambios del modal Editar
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("editId").value;
        const producto = document.getElementById("editName").value;
        const descripcion = document.getElementById("editCategory").value;
        const precio_venta = parseFloat(document.getElementById("editPrice").value);
        const precio_compra = precio_venta * 0.8;
        const stock = parseInt(document.getElementById("editStock").value);
        const imagen_url = document.getElementById("editImage").value;
        const fecha_compra = new Date().toISOString().split("T")[0];

        const productoActualizado = {
            producto,
            descripcion,
            precio_compra,
            precio_venta,
            stock,
            imagen_url,
            fecha_compra,
        };

        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(productoActualizado),
            });

            alert("Producto actualizado correctamente");
            editModal.style.display = "none";
            loadProducts();
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            alert("Error al actualizar el producto. Revisa la consola del servidor.");
        }
    });
    loadProducts();
});