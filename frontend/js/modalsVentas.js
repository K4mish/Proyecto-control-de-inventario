const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";
const API_URL_VENTAS = "http://localhost:3000/api/ventas";
const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

let usuariosGlobales = [];
let productosGlobales = [];
let carritoVenta = [];
let usuarioSesion = null;

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
    const selectMetodoPago = document.getElementById("selectMetodoPago");
    const inputBuscarProducto = document.getElementById("inputBuscarProducto");
    const selectProducto = document.getElementById("selectProducto");
    const inputCantidad = document.getElementById("inputCantidad");
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
    const lblIdVenta = document.getElementById("lblIdVenta");
    const selectEditEstado = document.getElementById("editEstado");
    
    function parseJwt(token) {
        try {
            const base64Payload = token.split('.')[1];
            const payload = atob(base64Payload);
            return JSON.parse(payload);
        } catch (e) {
            return null;
        }
    }
    usuarioSesion = parseJwt(token);

    async function cargarUsuarios() {
        if (!usuarioSesion) {
            console.error("Usuario de sesión no definido");
            return;
        }

        if (usuarioSesion.rol === "empleado") {
            selectUsuario.innerHTML = `<option value="${usuarioSesion.idUsuario}" selected>${usuarioSesion.nombre}</option>`;
            selectUsuario.disabled = true;
        } else {
            const res = await fetch(API_URL_USUARIOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            usuariosGlobales = data.usuarios || data;
            selectUsuario.innerHTML = '<option value="" disabled selected>Seleccione un empleado</option>';
            usuariosGlobales.forEach(u => {
                selectUsuario.innerHTML += `<option value="${u.idUsuario}">${u.nombre}</option>`;
            });
            selectUsuario.disabled = false;
        }
    }

    async function cargarProductos(){
        try {
            const res = await fetch(API_URL_PRODUCTOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            productosGlobales = data.productos || data;
            llenarSelectProductos(productosGlobales);
        } catch (error){ console.error("Error cargando productos", error); }
    }

    function llenarSelectProductos(lista) {
        selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';
        lista.forEach(p => {
            const precio = parseFloat(p.precioVenta || p.precio || 0);
            const stock = p.stock || 0;
            const option = document.createElement("option");
            option.value = p.idProducto;
            option.textContent = `${p.nombre} - $${precio} (Stock: ${stock})`;
            option.dataset.precio = precio;
            option.dataset.nombre = p.nombre;
            option.dataset.stock = stock;
            selectProducto.appendChild(option);
        });
    }

    inputBuscarProducto.addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase();
        const filtrados = productosGlobales.filter(p => p.nombre.toLowerCase().includes(texto));
        llenarSelectProductos(filtrados);
    });

    btnAgregarTemporal.addEventListener("click", () => {
        const idProd = selectProducto.value;
        const cantidad = parseInt(inputCantidad.value);
        if (!idProd) return mostrarMensaje("Atención", "Selecciona un producto.");
        if (cantidad <= 0) return mostrarMensaje("Atención", "Cantidad inválida.");

        const option = selectProducto.options[selectProducto.selectedIndex];
        const precio = parseFloat(option.dataset.precio);
        const nombre = option.dataset.nombre;
        const stock = parseInt(option.dataset.stock);

        if (cantidad > stock) return mostrarMensaje("Error", `Stock insuficiente. Solo hay ${stock}.`);

        const existe = carritoVenta.find(i => i.idProducto === idProd);
        if (existe){
            existe.cantidad += cantidad;
            existe.subtotal = existe.cantidad * existe.precio;
        } else{
            carritoVenta.push({
                idProducto: idProd,
                nombre: nombre,
                precio: precio,
                cantidad: cantidad,
                subtotal: cantidad * precio
            });
        }
        renderizarCarrito();
        inputCantidad.value = 1;
    });

    function renderizarCarrito() {
        tablaProductosBody.innerHTML = "";
        let totalAcumulado = 0;
        carritoVenta.forEach((item, index) => {
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
                const idx = e.currentTarget.dataset.index;
                carritoVenta.splice(idx, 1);
                renderizarCarrito();
            });
        });
    }

    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (carritoVenta.length === 0) return mostrarMensaje("Atención", "No hay productos en la venta.");
        
        const ventaData = {
            usuarioID: selectUsuario.value,
            subtotal: carritoVenta.reduce((acc, item) => acc + item.subtotal, 0),
            metodoPago: selectMetodoPago.value,
            productos: carritoVenta.map(p => ({
                idProducto: p.idProducto,
                cantidad: p.cantidad,
                precioUnitario: p.precio
            }))
        };
        try {
            const res = await fetch(API_URL_VENTAS, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(ventaData)
            });
            if (res.ok){
                const data = await res.json();
                mostrarMensaje("Éxito", `Venta creada con éxito! ID: ${data.idVenta}`);
                addModal.style.display = "none";
                cargarVentas();
            } else{
                const txt = await res.text();
                mostrarMensaje("Error", "Error al crear venta: " + txt);
            }
        } catch (err){ mostrarMensaje("Error", "Error de conexión."); }
    });

    async function cargarVentas() {
        try {
            const res = await fetch(API_URL_VENTAS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            const productTableBody = document.getElementById("productTableBody");
            productTableBody.innerHTML = "";
            data.forEach(v => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${v.idVenta}</td>
                    <td>${v.nombreUsuario} ${v.apellidoUsuario || ''}</td>
                    <td>${v.cantidadProductos}</td>
                    <td>$${parseFloat(v.subtotal).toFixed(2)}</td>
                    <td>$${parseFloat(v.total).toFixed(2)}</td>
                    <td><span class="badge-estado">${v.estado}</span></td>
                    <td>
                        <button class="btn-detalles" data-id="${v.idVenta}" title="Ver Detalles"><i class="bi bi-eye"></i></button>
                        <button class="editBtn" data-id="${v.idVenta}" title="Editar"><i class="bi bi-pencil-square"></i></button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
            asignarEventosBotones();
        } catch (err){ console.error("Error cargando ventas:", err); }
    }

    function asignarEventosBotones() {
        document.querySelectorAll(".btn-detalles").forEach(btn => {
            btn.addEventListener("click", () => verDetallesVenta(btn.dataset.id));
        });
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => abrirEditarVenta(btn.dataset.id));
        });
    }

    openAddModalBtn.addEventListener("click", () => {
        carritoVenta = [];
        renderizarCarrito();
        addForm.reset();
        cargarUsuarios();
        cargarProductos();
        addModal.style.display = "flex";
    });

    const cerrarModal = () => { addModal.style.display = "none"; };
    if(closeAddModalBtn) closeAddModalBtn.addEventListener("click", cerrarModal);
    if(btnCancelarModal) btnCancelarModal.addEventListener("click", cerrarModal);

    const cerrarModalDetalles = () => { detailsModal.style.display = "none"; };
    if(closeDetailsModal) closeDetailsModal.addEventListener("click", cerrarModalDetalles);
    if(btnCloseDetailsBtn) btnCloseDetailsBtn.addEventListener("click", cerrarModalDetalles);

    window.verDetallesVenta = async (idVenta) => {
        try {
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, { headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) throw new Error("Error al obtener la venta");
            const data = await res.json();
            const venta = data.venta;
            const detalles = data.detalles;

            document.getElementById("detailId").textContent = venta.idVenta;
            document.getElementById("detailEmpleado").textContent = `${venta.nombreUsuario || ''} ${venta.apellidoUsuario || ''}`;
            document.getElementById("detailFecha").textContent = new Date(venta.fecha).toLocaleString();
            document.getElementById("detailMetodo").textContent = venta.metodoPago;
            document.getElementById("detailEstado").textContent = venta.estado;

            const tbody = document.getElementById("detailsTableBody");
            tbody.innerHTML = "";
            if (detalles && detalles.length > 0){
                detalles.forEach(d => {
                    const subtotalLinea = d.cantidad * d.precioUnitario;
                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td>${d.nombre}</td>
                        <td>${d.cantidad}</td>
                        <td>$${parseFloat(d.precioUnitario).toFixed(2)}</td>
                        <td>$${subtotalLinea.toFixed(2)}</td>
                    `;
                    tbody.appendChild(fila);
                });
            } else{
                tbody.innerHTML = "<tr><td colspan='4'>No hay detalles registrados.</td></tr>";
            }
            document.getElementById("detailSubtotal").textContent = parseFloat(venta.subtotal).toFixed(2);
            document.getElementById("detailIva").textContent = parseFloat(venta.iva).toFixed(2);
            document.getElementById("detailTotal").textContent = parseFloat(venta.total).toFixed(2);
            detailsModal.style.display = "flex";
        } catch (err){ mostrarMensaje("Error", "No se pudo cargar el detalle."); }
    };

    window.abrirEditarVenta = async (idVenta) => {
        try {
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, { headers: { "Authorization": `Bearer ${token}` } });
            if (!res.ok) throw new Error("No se pudo obtener la venta.");
            const data = await res.json();
            const venta = data.venta || data;
            inputEditId.value = venta.idVenta;
            lblIdVenta.value = venta.idVenta;
            selectEditEstado.value = venta.estado;
            editModal.style.display = "flex";
        } catch (error){ mostrarMensaje("Error", "Error al cargar datos."); }
    };

    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL_VENTAS}/${inputEditId.value}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ estado: selectEditEstado.value }) 
            });
            if (res.ok){
                mostrarMensaje("Éxito", "Estado actualizado.");
                editModal.style.display = "none";
                cargarVentas();
            } else{
                const txt = await res.text();
                mostrarMensaje("Error", "Error al actualizar: " + txt);
            }
        } catch (error){ mostrarMensaje("Error", "Error de conexión."); }
    });

    const cerrarEdit = () => { editModal.style.display = "none"; };
    if(closeEditModalBtn) closeEditModalBtn.addEventListener("click", cerrarEdit);
    if(btnCancelarEdit) btnCancelarEdit.addEventListener("click", cerrarEdit);

    window.addEventListener("click", (e) => {
        if (e.target === addModal) cerrarModal();
        if (e.target === editModal) cerrarEdit();
        if (e.target === detailsModal) cerrarModalDetalles();
        if (e.target === msgModal) msgModal.style.display = "none";
    });
    cargarUsuarios();
    cargarProductos();
    cargarVentas();
});