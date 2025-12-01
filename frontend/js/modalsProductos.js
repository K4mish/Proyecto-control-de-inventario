const API_URL = "http://localhost:3000/api/productos";
const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_CATEGORIAS = "http://localhost:3000/api/categorias";

document.addEventListener('DOMContentLoaded', () => {
    const rolUsuario = localStorage.getItem('rol');
    if (!token){
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

    if (rolUsuario === 'empleado'){
        const btnAgregar = document.getElementById("openAddModalBtn");
        if (btnAgregar) btnAgregar.style.display = 'none';
        const thCompra = document.getElementById("thPrecioCompra");
        const thAcciones = document.getElementById("thAcciones");
        if (thCompra) thCompra.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }

    const tableBody = document.getElementById("productTableBody");
    const addModal = document.getElementById("addModal");
    const addForm = document.getElementById("addForm");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModal = document.getElementById("closeAddModal");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeEditModal = document.getElementById("closeEditModal");
    const addCategoria = document.getElementById("addCategoria");
    const addProveedor = document.getElementById("addProvider");
    const editCategoria = document.getElementById("editCategory");
    const editProveedor = document.getElementById("editProvider");

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
        } catch (err){ console.error(err); }
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

    async function loadProducts(){
        try {
            const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const products = data.productos || data;
            
            if(Array.isArray(products)) products.sort((a, b) => b.idProducto - a.idProducto);
            if(tableBody) tableBody.innerHTML = "";

            if (!Array.isArray(products)){
                return;
            }

            products.forEach(p => {
                const row = document.createElement("tr");
                 let htmlRow = `
                    <td>${p.idProducto}</td>
                    <td><img src="${p.urlImagen || '../assets/no-image.png'}" class="img-producto" alt="Img"></td>
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
                            <button class="editBtn" data-id="${p.idProducto}"><i class="bi bi-pencil-square"></i></button>
                            <button class="deleteBtn" data-id="${p.idProducto}"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
                } else {
                    htmlRow += `<td>${p.stock}</td>`;
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
        } catch (err) { console.error(err); }
    }

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
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(nuevoProducto)
                });
                if (res.ok){
                    mostrarMensaje("Éxito", "Producto creado exitosamente");
                    addModal.style.display = "none";
                    addForm.reset();
                    loadProducts();
                } else{
                    const txt = await res.text();
                    mostrarMensaje("Error", "Error: " + txt);
                }
            } catch (err){ mostrarMensaje("Error", "Error de conexión"); }
        });
    }

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
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(productoActualizado)
                });
                if (res.ok){
                    mostrarMensaje("Éxito", "Producto actualizado");
                    editModal.style.display = "none";
                    loadProducts();
                } else{
                    mostrarMensaje("Error", "Error al actualizar");
                }
            } catch (err){ console.error(err); }
        });
    }

    async function deleteProduct(id){
        if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok){
                mostrarMensaje("Éxito", "Producto eliminado");
                loadProducts();
            } else{                
                const txt = await res.text();
                mostrarMensaje("Error", "Error: " + txt);
            }
        } catch (err){ console.error(err); }
    }

    if (openAddModalBtn) openAddModalBtn.addEventListener("click", () => { if(addForm) addForm.reset(); if(addModal) addModal.style.display = "flex"; });
    if (closeAddModal) closeAddModal.addEventListener("click", () => { if(addModal) addModal.style.display = "none"; });
    if (closeEditModal) closeEditModal.addEventListener("click", () => { if(editModal) editModal.style.display = "none"; });

    window.addEventListener("click", (e) => {
        if (addModal && e.target === addModal) addModal.style.display = "none";
        if (editModal && e.target === editModal) editModal.style.display = "none";
        if (msgModal && e.target === msgModal) msgModal.style.display = "none";
    });
    loadSelects();
    loadProducts();
});