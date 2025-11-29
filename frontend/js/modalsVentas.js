const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";
const API_URL_VENTAS = "http://localhost:3000/api/ventas";
const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

let usuariosGlobales = [];
let productosGlobales = [];
let carritoVenta = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('No has iniciado sesión');
        window.location.href = "../html/index.html";
        return;
    }

    // REFERENCIAS DOM
    const addModal = document.getElementById("addModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModalBtn = document.getElementById("closeAddModal");
    const btnCancelarModal = document.getElementById("btnCancelarModal");
    const addForm = document.getElementById("addForm");
    // Inputs del formulario
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

    // CARGAR USUARIOS
    async function cargarUsuarios(){
        try {
            const res = await fetch(API_URL_USUARIOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            usuariosGlobales = data.usuarios || data;

            selectUsuario.innerHTML = '<option value="" disabled selected>Seleccione un empleado</option>';
            usuariosGlobales.forEach(u => {
                selectUsuario.innerHTML += `<option value="${u.idUsuario}">${u.nombre} ${u.apellido}</option>`;
            });
        } catch (error){
            console.error("Error cargando usuarios", error);
        }
    }
    // CARGAR PRODUCTOS Y BUSCADOR
    async function cargarProductos(){
        try {
            const res = await fetch(API_URL_PRODUCTOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            productosGlobales = data.productos || data;
            llenarSelectProductos(productosGlobales);
        } catch (error){
            console.error("Error cargando productos", error);
        }
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
    // Evento de búsqueda (filtro)
    inputBuscarProducto.addEventListener("input", (e) => {
        const texto = e.target.value.toLowerCase();
        const filtrados = productosGlobales.filter(p => p.nombre.toLowerCase().includes(texto));
        llenarSelectProductos(filtrados);
    });
    // AGREGAR AL CARRITO TEMPORAL
    btnAgregarTemporal.addEventListener("click", () => {
        const idProd = selectProducto.value;
        const cantidad = parseInt(inputCantidad.value);
        
        if (!idProd) return alert("Selecciona un producto.");
        if (cantidad <= 0) return alert("Cantidad inválida.");

        const option = selectProducto.options[selectProducto.selectedIndex];
        const precio = parseFloat(option.dataset.precio);
        const nombre = option.dataset.nombre;
        const stock = parseInt(option.dataset.stock);

        if (cantidad > stock) return alert(`Stock insuficiente. Solo hay ${stock}.`);

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
    // RENDERIZAR TABLA
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
                <td>
                    <button type="button" class="btn-eliminar-fila" data-index="${index}">
                        <i class="bi bi-trash"></i> X
                    </button>
                </td>
            `;
            tablaProductosBody.appendChild(row);
        });

        lblSubtotal.textContent = totalAcumulado.toFixed(2);

        document.querySelectorAll(".btn-eliminar-fila").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                carritoVenta.splice(idx, 1);
                renderizarCarrito();
            });
        });
    }
    // FINALIZAR VENTA (SUBMIT)
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (carritoVenta.length === 0) return alert("No hay productos en la venta.");
        const usuarioID = selectUsuario.value;
        const metodoPago = selectMetodoPago.value;

        const subtotalVenta = carritoVenta.reduce((acc, item) => acc + item.subtotal, 0);

        const ventaData = {
            usuarioID: usuarioID,
            subtotal: subtotalVenta,
            metodoPago: metodoPago,
            productos: carritoVenta.map(p => ({
                idProducto: p.idProducto,
                cantidad: p.cantidad,
                precioUnitario: p.precio // Enviamos el precio para guardarlo en detalleVentas
            }))
        };
        try {
            const res = await fetch(API_URL_VENTAS, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(ventaData)
            });

            if (res.ok){
                const data = await res.json();
                alert(`Venta creada con éxito! ID: ${data.idVenta}`);
                addModal.style.display = "none";
                cargarVentas();
            } else{
                const txt = await res.text();
                alert("Error al crear venta: " + txt);
            }
        } catch (err){
            console.error(err);
            alert("Error de conexión con el servidor.");
        }
    });
    // Función para cargar tabla principal (simplificada para que funcione el llamado arriba)
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
                        <button class="btn-detalles" data-id="${v.idVenta}" title="Ver Detalles">
                            <i class="bi bi-eye"></i> Detalles
                        </button>
                        <button class="editBtn" data-id="${v.idVenta}" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
            asignarEventosBotones();
        } catch (err){
            console.error("Error cargando ventas:", err);
        }
    }

    function asignarEventosBotones() {
        document.querySelectorAll(".btn-detalles").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                verDetallesVenta(id);
            });
        });

        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", () => eliminarVenta(btn.dataset.id));
        });
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => abrirEditarVenta(btn.dataset.id));
        });
    }
    // ABRIR MODAL AGREGAR
    openAddModalBtn.addEventListener("click", () => {
        carritoVenta = [];
        renderizarCarrito();
        addForm.reset();
        
        cargarUsuarios();
        cargarProductos();
        addModal.style.display = "flex";
    });
    // CERRAR MODAL AGREGAR
    const cerrarModal = () => { addModal.style.display = "none"; };
    closeAddModalBtn.addEventListener("click", cerrarModal);
    btnCancelarModal.addEventListener("click", cerrarModal);
    window.addEventListener("click", (e) => {
        if (e.target === addModal) cerrarModal();
    });

    const cerrarModalDetalles = () => { detailsModal.style.display = "none"; };
    closeDetailsModal.addEventListener("click", cerrarModalDetalles);
    btnCloseDetailsBtn.addEventListener("click", cerrarModalDetalles);

    window.addEventListener("click", (e) => {
        if (e.target === detailsModal) cerrarModalDetalles();
    });
    // FUNCIÓN PARA VER DETALLES (Llamada al Backend)
    window.verDetallesVenta = async (idVenta) => {
        try {
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener la venta");

            const data = await res.json();
            const venta = data.venta;
            const detalles = data.detalles;

            document.getElementById("detailId").textContent = venta.idVenta;
            document.getElementById("detailEmpleado").textContent = `${venta.nombreUsuario || ''} ${venta.apellidoUsuario || ''}`; // Ajusta según tu JSON
            document.getElementById("detailFecha").textContent = new Date(venta.fecha).toLocaleString();
            document.getElementById("detailMetodo").textContent = venta.metodoPago;
            document.getElementById("detailEstado").textContent = venta.estado;

            const tbody = document.getElementById("detailsTableBody");
            tbody.innerHTML = "";

            let sumaVerificacion = 0;

            if (detalles && detalles.length > 0){
                detalles.forEach(d => {
                    const subtotalLinea = d.cantidad * d.precioUnitario;
                    sumaVerificacion += subtotalLinea;

                    const fila = document.createElement("tr");
                    fila.innerHTML = `
                        <td>${d.nombre}</td> <!-- Asegúrate que el backend devuelva el nombre del producto -->
                        <td style="text-align: center;">${d.cantidad}</td>
                        <td>$${parseFloat(d.precioUnitario).toFixed(2)}</td>
                        <td>$${subtotalLinea.toFixed(2)}</td>
                    `;
                    tbody.appendChild(fila);
                });
            } else{
                tbody.innerHTML = "<tr><td colspan='4'>No hay detalles registrados para esta venta.</td></tr>";
            }

            document.getElementById("detailSubtotal").textContent = parseFloat(venta.subtotal).toFixed(2);
            document.getElementById("detailIva").textContent = parseFloat(venta.iva).toFixed(2);
            document.getElementById("detailTotal").textContent = parseFloat(venta.total).toFixed(2);

            detailsModal.style.display = "flex";

        } catch (err){
            console.error(err);
            alert("No se pudo cargar el detalle de la venta.");
        }
    };
    // FUNCIÓN: ABRIR MODAL EDICIÓN
    window.abrirEditarVenta = async (idVenta) => {
        try {
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (!res.ok) throw new Error("No se pudo obtener la información de la venta.");
            
            const data = await res.json();
            const venta = data.venta || data;

            inputEditId.value = venta.idVenta;
            lblIdVenta.value = venta.idVenta;
            selectEditEstado.value = venta.estado;

            editModal.style.display = "flex";

        } catch (error){
            console.error(error);
            alert("Error al cargar datos para editar.");
        }
    };
    // GUARDAR CAMBIOS DE EDICIÓN (SOLO ESTADO)
    editForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const idVenta = inputEditId.value;
        const nuevoEstado = selectEditEstado.value;

        try {
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ estado: nuevoEstado }) 
            });

            if (res.ok){
                alert("Estado actualizado correctamente.");
                editModal.style.display = "none";
                cargarVentas();
            } else{
                const txt = await res.text();
                alert("Error al actualizar: " + txt);
            }
        } catch (error){
            console.error(error);
            alert("Error de conexión.");
        }
    });
    // CERRAR MODAL EDICIÓN
    const cerrarEditModalFunc = () => { editModal.style.display = "none"; };
    closeEditModalBtn.addEventListener("click", cerrarEditModalFunc);
    btnCancelarEdit.addEventListener("click", cerrarEditModalFunc);
    // Cerrar si click fuera del modal
    window.addEventListener("click", (e) => {
        if (e.target === editModal) cerrarEditModalFunc();
    });
    cargarUsuarios();
    cargarProductos();
    cargarVentas();
});