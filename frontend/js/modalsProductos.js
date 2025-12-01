const API_URL = "http://localhost:3000/api/productos";
const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_CATEGORIAS = "http://localhost:3000/api/categorias";

document.addEventListener('DOMContentLoaded', () => {
    const rolUsuario = localStorage.getItem('rol');
    // Verificar Token
    if (!token){
        alert('No has iniciado sesión.');
        window.location.href = "../html/index.html";
        return;
    }
    // Lógica específica de Rol (Visual)
    if (rolUsuario === 'empleado'){
        const btnAgregar = document.getElementById("openAddModalBtn");
        if (btnAgregar) btnAgregar.style.display = 'none';
        
        const thCompra = document.getElementById("thPrecioCompra");
        const thAcciones = document.getElementById("thAcciones");
        if (thCompra) thCompra.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }

    // --- REFERENCIAS DOM ---
    const tableBody = document.getElementById("productTableBody");
    // Modal Agregar
    const addModal = document.getElementById("addModal");
    const addForm = document.getElementById("addForm");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModal = document.getElementById("closeAddModal");
    const btnCancelAdd = document.getElementById("btnCancelAdd");
    // Modal Editar
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeEditModal = document.getElementById("closeEditModal");
    const btnCancelEdit = document.getElementById("btnCancelEdit");
    // Selects
    const addCategoria = document.getElementById("addCategory");
    const addProveedor = document.getElementById("addProvider");
    const editCategoria = document.getElementById("editCategory");
    const editProveedor = document.getElementById("editProvider");

    // CARGAR SELECTS
    async function loadSelects(){
        try {
            const resCat = await fetch(API_URL_CATEGORIAS, { headers: { "Authorization": `Bearer ${token}` } });
            const categorias = await resCat.json();
            const resProv = await fetch(API_URL_PROVEEDORES, { headers: { "Authorization": `Bearer ${token}` } });
            const proveedores = await resProv.json();

            if(addCategoria) fillSelect(addCategoria, categorias, 'idCategoria', 'nombre');
            if(addProveedor) fillSelect(addProveedor, proveedores, 'idProveedor', 'nombre');
            if(editCategoria) fillSelect(editCategoria, categorias, 'idCategoria', 'nombre');
            if(editProveedor) fillSelect(editProveedor, proveedores, 'idProveedor', 'nombre');

        } catch (err){
            console.error("Error cargando listas desplegables:", err);
        }
    }

    function fillSelect(selectElement, data, keyId, keyName) {
        const lista = Array.isArray(data) ? data : (data.categorias || data.proveedores || []);
        
        selectElement.innerHTML = `<option value="">Seleccionar...</option>`;
        lista.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item[keyId];
            opt.textContent = item[keyName];
            selectElement.appendChild(opt);
        });
    }
    // CARGAR PRODUCTOS (TABLA)
    async function loadProducts(){
        try {
            const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            
            const products = data.productos || data;
            if(Array.isArray(products)) {
                products.sort((a, b) => b.idProducto - a.idProducto);
            }
            
            if(tableBody) tableBody.innerHTML = "";

            if (!Array.isArray(products)){
                console.error("Respuesta no válida:", data);
                return;
            }

            products.forEach(p => {
                const row = document.createElement("tr");
                 let htmlRow = `
                    <td>${p.idProducto}</td>
                    <td>
                        <img src="${p.urlImagen || '../assets/no-image.png'}" class="img-producto" alt="Img">
                    </td>
                    <td><strong>${p.nombre}</strong></td>
                    <td>${p.nombreCategoria || "Sin categoría"}</td>
                    <td>${p.nombreProveedor || "Sin proveedor"}</td>
                    <td>$${parseFloat(p.precioVenta).toFixed(2)}</td>
                `;

                if (rolUsuario === 'admin'){
                    htmlRow += `
                        <td>$${parseFloat(p.precioCompra).toFixed(2)}</td>
                        <td>${p.stock}</td>
                        <td>
                            <button class="editBtn" data-id="${p.idProducto}" title="Editar">
                                <i class="bi bi-pencil-square"></i>
                            </button>
                            <button class="deleteBtn" data-id="${p.idProducto}" title="Eliminar">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    `;
                } else {
                    htmlRow += `
                        <td>${p.stock}</td>
                    `;
                }
                row.innerHTML = htmlRow;
                tableBody.appendChild(row);
            });

            if (rolUsuario === 'admin'){
                document.querySelectorAll(".editBtn").forEach(btn => {
                    btn.addEventListener("click", () => {
                        const prod = products.find(p => p.idProducto == btn.dataset.id);
                        openEditModal(prod);
                    });
                });
                document.querySelectorAll(".deleteBtn").forEach(btn => {
                    btn.addEventListener("click", () => deleteProduct(btn.dataset.id));
                });
            }

        } catch (err) {
            console.error("Error al cargar productos:", err);
        }
    }
    // CREAR PRODUCTO
    if(addForm) {
        addForm.addEventListener("submit", async e => {
            e.preventDefault();

            const nuevoProducto = {
                nombre: document.getElementById("addName").value,
                categoria_id: document.getElementById("addCategory").value,
                proveedor_id: document.getElementById("addProvider").value,
                precioVenta: document.getElementById("addPriceSell").value,
                precioCompra: document.getElementById("addPriceBuy").value,
                stock: document.getElementById("addStock").value,
                urlImagen: document.getElementById("addImage").value
            };
            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(nuevoProducto)
                });

                if (res.ok){
                    alert("Producto creado exitosamente");
                    addModal.style.display = "none";
                    addForm.reset();
                    loadProducts();
                } else{
                    const txt = await res.text();
                    alert("Error: " + txt);
                }
            } catch (err){ console.error(err); }
        });
    }
    // EDITAR PRODUCTO
    function openEditModal(p) {
        if(!editModal) return;
        document.getElementById("editId").value = p.idProducto;
        document.getElementById("editName").value = p.nombre;
        document.getElementById("editCategory").value = p.categoria_id; 
        document.getElementById("editProvider").value = p.proveedor_id;
        document.getElementById("editPriceSell").value = p.precioVenta;
        document.getElementById("editPriceBuy").value = p.precioCompra;
        document.getElementById("editStock").value = p.stock;
        document.getElementById("editImage").value = p.urlImagen;
        editModal.style.display = "flex";
    }

    if(editForm) {
        editForm.addEventListener("submit", async e => {
            e.preventDefault();
            const id = document.getElementById("editId").value;

            const productoActualizado = {
                nombre: document.getElementById("editName").value,
                categoria_id: document.getElementById("editCategory").value,
                proveedor_id: document.getElementById("editProvider").value,
                precioVenta: document.getElementById("editPriceSell").value,
                precioCompra: document.getElementById("editPriceBuy").value,
                stock: document.getElementById("editStock").value,
                urlImagen: document.getElementById("editImage").value
            };
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(productoActualizado)
                });

                if (res.ok){
                    alert("Producto actualizado");
                    editModal.style.display = "none";
                    loadProducts();
                } else{
                    alert("Error al actualizar");
                }
            } catch (err){ console.error(err); }
        });
    }
    // ELIMINAR PRODUCTO
    async function deleteProduct(id){
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
        
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok){
                alert("Producto eliminado");
                loadProducts();
            } else{                
                const txt = await res.text();
                alert("Error (Puede que tenga ventas asociadas): " + txt);
            }
        } catch (err){ console.error(err); }
    }
    // CONTROLES DE MODALES
    const cerrarModal = (modal) => { if(modal) modal.style.display = "none"; };

    if (openAddModalBtn) {
        openAddModalBtn.addEventListener("click", () => {
            if(addForm) addForm.reset();
            if(addModal) addModal.style.display = "flex";
        });
    }

    if (closeAddModal) closeAddModal.addEventListener("click", () => cerrarModal(addModal));
    if (btnCancelAdd) btnCancelAdd.addEventListener("click", () => cerrarModal(addModal));
    
    if (closeEditModal) closeEditModal.addEventListener("click", () => cerrarModal(editModal));
    if (btnCancelEdit) btnCancelEdit.addEventListener("click", () => cerrarModal(editModal));

    window.addEventListener("click", (e) => {
        if (addModal && e.target === addModal) cerrarModal(addModal);
        if (editModal && e.target === editModal) cerrarModal(editModal);
    });
    loadSelects();
    loadProducts();
});