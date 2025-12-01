const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";
const API_URL_PROVEEDORES = "http://localhost:3000/api/proveedor";
const API_URL_COMPRAS = "http://localhost:3000/api/compras";
const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

let usuariosGlobales = [], proveedoresGlobales = [], productosGlobales = [], carritoCompra = [];

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

    const addModal = document.getElementById("addModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModalBtn = document.getElementById("closeAddModal");
    const btnCancelarModal = document.getElementById("btnCancelarModal");
    const addForm = document.getElementById("addForm");
    const selectUsuario = document.getElementById("selectUsuario");
    const selectProveedor = document.getElementById("selectProveedor");
    const selectMetodoPago = document.getElementById("selectMetodoPago");
    const inputBuscarProducto = document.getElementById("inputBuscarProducto");
    const selectProducto = document.getElementById("selectProducto");
    const inputCantidad = document.getElementById("inputCantidad");
    const inputCosto = document.getElementById("inputCosto");
    const btnAgregarTemporal = document.getElementById("btnAgregarTemporal");
    const tablaProductosBody = document.getElementById("tablaProductosBody");
    const lblSubtotal = document.getElementById("lblSubtotal");
    const detailsModal = document.getElementById("detailsModal");
    const closeDetailsModal = document.getElementById("closeDetailsModal");
    const btnCloseDetailsBtn = document.getElementById("btnCloseDetailsBtn");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeEditModalBtn = document.getElementById("closeEditModal");
    const btnCancelarEdit = document.getElementById("btnCancelarEdit");
    const inputEditId = document.getElementById("editId");
    const lblIdCompra = document.getElementById("lblIdCompra");
    const selectEditEstado = document.getElementById("editEstado");

    async function cargarUsuarios() {
        try {
            const res = await fetch(API_URL_USUARIOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            usuariosGlobales = data.usuarios || data;
            selectUsuario.innerHTML = '<option value="" disabled selected>Seleccione empleado</option>';
            usuariosGlobales.forEach(u => {
                selectUsuario.innerHTML += `<option value="${u.idUsuario}">${u.nombre} ${u.apellido}</option>`;
            });
        } catch (error){ console.error(error); }
    }
    async function cargarProveedores() {
        try {
            const res = await fetch(API_URL_PROVEEDORES, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            proveedoresGlobales = data.proveedores || data;
            selectProveedor.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';
            proveedoresGlobales.forEach(p => {
                selectProveedor.innerHTML += `<option value="${p.idProveedor}">${p.nombre}</option>`;
            });
        } catch (error){ console.error(error); }
    }
    async function cargarProductos(){
        try {
            const res = await fetch(API_URL_PRODUCTOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            productosGlobales = data.productos || data;
            llenarSelectProductos(productosGlobales);
        } catch (error){ console.error(error); }
    }

    function llenarSelectProductos(lista) {
        selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';
        lista.forEach(p => {
            const costo = parseFloat(p.precioCompra || 0);
            const option = document.createElement("option");
            option.value = p.idProducto;
            option.textContent = `${p.nombre} (Costo ref: $${costo})`;
            option.dataset.costo = costo;
            option.dataset.nombre = p.nombre;
            selectProducto.appendChild(option);
        });
    }
    selectProducto.addEventListener("change", () => {
        const option = selectProducto.options[selectProducto.selectedIndex];
        if (option.dataset.costo) inputCosto.value = option.dataset.costo;
    });
    inputBuscarProducto.addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase();
        const filtrados = productosGlobales.filter(p => p.nombre.toLowerCase().includes(texto));
        llenarSelectProductos(filtrados);
    });

    btnAgregarTemporal.addEventListener("click", () => {
        const idProd = selectProducto.value;
        const cantidad = parseInt(inputCantidad.value);
        const costoUnitario = parseFloat(inputCosto.value);
        if (!idProd) return mostrarMensaje("Atención", "Selecciona un producto.");
        if (cantidad <= 0) return mostrarMensaje("Atención", "Cantidad inválida.");
        if (isNaN(costoUnitario) || costoUnitario < 0) return mostrarMensaje("Atención", "Costo inválido.");

        const option = selectProducto.options[selectProducto.selectedIndex];
        const nombre = option.dataset.nombre;
        const existe = carritoCompra.find(i => i.idProducto === idProd);
        if (existe) {
            existe.cantidad += cantidad;
            existe.precio = costoUnitario;
            existe.subtotal = existe.cantidad * costoUnitario;
        } else {
            carritoCompra.push({
                idProducto: idProd,
                nombre: nombre,
                precio: costoUnitario,
                cantidad: cantidad,
                subtotal: cantidad * costoUnitario
            });
        }
        renderizarCarrito();
        inputCantidad.value = 1;
        inputCosto.value = "";
    });

    function renderizarCarrito() {
        tablaProductosBody.innerHTML = "";
        let totalAcumulado = 0;
        carritoCompra.forEach((item, index) => {
            totalAcumulado += item.subtotal;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td><button type="button" class="btn-eliminar-fila" data-index="${index}"><i class="bi bi-trash"></i></button></td>
            `;
            tablaProductosBody.appendChild(row);
        });
        lblSubtotal.textContent = totalAcumulado.toFixed(2);
        document.querySelectorAll(".btn-eliminar-fila").forEach(btn => {
            btn.addEventListener("click", (e) => {
                carritoCompra.splice(e.currentTarget.dataset.index, 1);
                renderizarCarrito();
            });
        });
    }

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (carritoCompra.length === 0) return mostrarMensaje("Atención", "Carrito vacío.");
        const subtotal = carritoCompra.reduce((acc, item) => acc + item.subtotal, 0);
        const compraData = {
            proveedorID: selectProveedor.value,
            empleadoID: selectUsuario.value,
            metodoPago: selectMetodoPago.value,
            subtotal: subtotal,
            productos: carritoCompra
        };
        try {
            const res = await fetch(API_URL_COMPRAS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(compraData)
            });
            if (res.ok){
                mostrarMensaje("Éxito", "Compra registrada!");
                addModal.style.display = "none";
                cargarCompras();
            } else {
                const txt = await res.text();
                mostrarMensaje("Error", "Error: " + txt);
            }
        } catch (err){ mostrarMensaje("Error", "Error de conexión"); }
    });

    async function cargarCompras(){
        try {
            const res = await fetch(API_URL_COMPRAS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const tbody = document.getElementById("productTableBody");
            tbody.innerHTML = "";
            data.forEach(c => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${c.idCompra}</td>
                    <td>${c.nombreProveedor}</td>
                    <td>${c.nombreEmpleado}</td>
                    <td>$${parseFloat(c.total).toFixed(2)}</td>
                    <td><span class="badge-estado">${c.estado}</span></td>
                    <td>
                        <button class="btn-detalles" data-id="${c.idCompra}"><i class="bi bi-eye"></i></button>
                        <button class="editBtn" data-id="${c.idCompra}"><i class="bi bi-pencil-square"></i></button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            asignarEventos();
        } catch (err){ console.error(err); }
    }

    function asignarEventos(){
        document.querySelectorAll(".btn-detalles").forEach(btn => {
            btn.addEventListener("click", () => verDetalles(btn.dataset.id));
        });
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => abrirEditar(btn.dataset.id));
        });
    }

    async function verDetalles(id){
        try {
            const res = await fetch(`${API_URL_COMPRAS}/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const c = data.compra;
            const det = data.detalles;
            document.getElementById("detailId").textContent = c.idCompra;
            document.getElementById("detailProveedor").textContent = c.nombreProveedor;
            document.getElementById("detailEmpleado").textContent = c.nombreEmpleado;
            document.getElementById("detailFecha").textContent = new Date(c.fecha).toLocaleString();
            document.getElementById("detailEstado").textContent = c.estado;
            document.getElementById("detailSubtotal").textContent = c.subtotal;
            document.getElementById("detailIva").textContent = c.iva;
            document.getElementById("detailTotal").textContent = c.total;
            const tbody = document.getElementById("detailsTableBody");
            tbody.innerHTML = "";
            det.forEach(d => {
                const fila = document.createElement("tr");
                fila.innerHTML = `<td>${d.nombre}</td><td>${d.cantidad}</td><td>$${d.precioUnitario}</td><td>$${(d.cantidad * d.precioUnitario).toFixed(2)}</td>`;
                tbody.appendChild(fila);
            });
            detailsModal.style.display = "flex";
        } catch (e) { console.error(e); }
    }

    async function abrirEditar(id){
        try {
            const res = await fetch(`${API_URL_COMPRAS}/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const c = data.compra;
            inputEditId.value = c.idCompra;
            lblIdCompra.value = c.idCompra;
            selectEditEstado.value = c.estado;
            editModal.style.display = "flex";
        } catch (e){ console.error(e); }
    }

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL_COMPRAS}/${inputEditId.value}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ estado: selectEditEstado.value })
            });
            if (res.ok){
                mostrarMensaje("Éxito", "Actualizado");
                editModal.style.display = "none";
                cargarCompras();
            } else{
                mostrarMensaje("Error", "Error al actualizar");
            }
        } catch (e){ mostrarMensaje("Error", "Error conexión"); }
    });

    const cerrarM = (m) => m.style.display = "none";
    openAddModalBtn.onclick = () => { carritoCompra = []; renderizarCarrito(); addForm.reset(); cargarUsuarios(); cargarProveedores(); cargarProductos(); addModal.style.display = "flex"; };
    if(closeAddModalBtn) closeAddModalBtn.onclick = () => cerrarM(addModal);
    if(btnCancelarModal) btnCancelarModal.onclick = () => cerrarM(addModal);
    if(closeDetailsModal) closeDetailsModal.onclick = () => cerrarM(detailsModal);
    if(btnCloseDetailsBtn) btnCloseDetailsBtn.onclick = () => cerrarM(detailsModal);
    if(closeEditModalBtn) closeEditModalBtn.onclick = () => cerrarM(editModal);
    if(btnCancelarEdit) btnCancelarEdit.onclick = () => cerrarM(editModal);

    window.onclick = (e) => {
        if (e.target == addModal) cerrarM(addModal);
        if (e.target == detailsModal) cerrarM(detailsModal);
        if (e.target == editModal) cerrarM(editModal);
        if (e.target == msgModal) cerrarM(msgModal);
    };
    cargarCompras();
});