const API_URL = "http://localhost:3000/api/productos";
const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_CATEGORIAS = "http://localhost:3000/api/categorias";

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

    const addCategoria = document.getElementById("addCategory");
    const addProveedor = document.getElementById("addProvider");

    const editCategoria = document.getElementById("editCategory");
    const editProveedor = document.getElementById("editProvider");

    // Mapas para mostrar nombres
    let categoriasMap = {};
    let proveedoresMap = {};
    // Caragar categorias
    async function loadCategorias() {
        try {
            const res = await fetch(API_URL_CATEGORIAS, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const categorias = await res.json();

            categoriasMap = {};
            addCategoria.innerHTML = `<option value="">Seleccione categoría</option>`;
            editCategoria.innerHTML = `<option value="">Seleccione categoría</option>`;

            categorias.forEach(cat => {
                categoriasMap[cat.idCategoria] = cat.nombre;

                let opt1 = document.createElement("option");
                opt1.value = cat.idCategoria;
                opt1.textContent = cat.nombre;
                addCategoria.appendChild(opt1);

                let opt2 = document.createElement("option");
                opt2.value = cat.idCategoria;
                opt2.textContent = cat.nombre;
                editCategoria.appendChild(opt2);
            });

        } catch (err) {
            console.error("Error cargando categorías:", err);
        }
    }
    // Cargar proveedor
    async function loadProveedores() {
        try {
            const res = await fetch(API_URL_PROVEEDORES, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const proveedores = await res.json();

            proveedoresMap = {};
            addProveedor.innerHTML = `<option value="">Seleccione proveedor</option>`;
            editProveedor.innerHTML = `<option value="">Seleccione proveedor</option>`;

            proveedores.forEach(p => {
                proveedoresMap[p.idProveedor] = p.nombre;

                let opt1 = document.createElement("option");
                opt1.value = p.idProveedor;
                opt1.textContent = p.nombre;
                addProveedor.appendChild(opt1);

                let opt2 = document.createElement("option");
                opt2.value = p.idProveedor;
                opt2.textContent = p.nombre;
                editProveedor.appendChild(opt2);
            });

        } catch (err) {
            console.error("Error cargando proveedores:", err);
        }
    }
    // Cargar productos
    async function loadProducts() {
        try {
            const res = await fetch(API_URL, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const products = await res.json();
            tableBody.innerHTML = "";

            if (!Array.isArray(products)) {
                alert("Error al cargar productos");
                return;
            }
            products.forEach(p => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${p.idProducto}</td>
                    <td>${p.nombre}</td>
                    <td>${categoriasMap[p.categoria_id] || "Sin categoría"}</td>
                    <td>${proveedoresMap[p.proveedor_id] || "Sin proveedor"}</td>
                    <td>$${Number(p.precioVenta).toFixed(2)}</td>
                    <td>$${Number(p.precioCompra).toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td><img src="${p.urlImagen}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;"></td>
                    <td>
                        <button onclick="openEditModal(
                            '${p.idProducto}',
                            '${p.nombre}',
                            '${p.categoria_id}',
                            '${p.proveedor_id}',
                            '${p.precioVenta}',
                            '${p.precioCompra}',
                            '${p.stock}',
                            '${p.urlImagen}'
                        )">Editar</button>
                        <button onclick="deleteProduct(${p.idProducto})">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Error al cargar productos:", err);
        }
    }
    // Eliminar producto
    async function deleteProduct(id) {
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        loadProducts();
    }
    window.deleteProduct = deleteProduct;

    // Abrir modal de Agregar Producto
    openAddModalBtn.addEventListener("click", () => {addModal.style.display = "flex";});
    // Cerrar modal de agregar
    closeAddModal.addEventListener("click", () => {addModal.style.display = "none";});

    // Enviar formulario de Agregar Producto
    addForm.addEventListener("submit", async e => {
        e.preventDefault();

        const nuevoProducto = {
            nombre: document.getElementById("addName").value,
            categoria_id: parseInt(document.getElementById("addCategory").value),
            proveedor_id: parseInt(document.getElementById("addProvider").value),
            precioVenta: parseFloat(document.getElementById("addPriceSell").value),
            precioCompra: parseFloat(document.getElementById("addPriceBuy").value) * 0.8,
            stock: parseInt(document.getElementById("addStock").value),
            urlImagen: document.getElementById("addImage").value
        };

        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(nuevoProducto)
        });

        if (!res.ok) {
            alert("Error al crear producto");
            return;
        }
        addModal.style.display = "none";
        addForm.reset();
        loadProducts();
    });
    // Abrir modal de Editar Producto
    window.openEditModal = function(id, nombre, categoriaId, proveedorId, precioVenta, precioCompra, stock, urlImagen) {
        editModal.style.display = "flex";

        document.getElementById("editId").value = id;
        document.getElementById("editName").value = nombre;
        document.getElementById("editCategory").value = categoriaId;
        document.getElementById("editProvider").value = proveedorId;
        document.getElementById("editPriceSell").value = precioVenta;
        document.getElementById("editPriceBuy").value = precioCompra;
        document.getElementById("editStock").value = stock;
        document.getElementById("editImage").value = urlImagen;
    };

    closeEditModal.addEventListener("click", () => {editModal.style.display = "none";});

    // Guardar cambios del modal Editar
    editForm.addEventListener("submit", async e => {
        e.preventDefault();

        const id = document.getElementById("editId").value;

        const productoActualizado = {
            nombre: document.getElementById("editName").value,
            categoria_id: parseInt(document.getElementById("editCategory").value),
            proveedor_id: parseInt(document.getElementById("editProvider").value),
            precioVenta: parseFloat(document.getElementById("editPriceSell").value),
            precioCompra: parseFloat(document.getElementById("editPriceBuy").value) * 0.8,
            stock: parseInt(document.getElementById("editStock").value),
            urlImagen: document.getElementById("editImage").value
        };
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productoActualizado)
        });
        editModal.style.display = "none";
        loadProducts();
    });
    loadCategorias();
    loadProveedores();
    loadProducts();
});