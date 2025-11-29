const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";
const API_URL_VENTAS = "http://localhost:3000/api/ventas";
const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

// Estado local
let usuariosGlobales = [];
let productosGlobales = [];
let carritoVenta = [];

document.addEventListener('DOMContentLoaded', () => {
    // Verificar token
    if (!token) {
        alert('No has iniciado sesión');
        window.location.href = "../html/index.html";
        return;
    }

    // --- REFERENCIAS DOM ---
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

    // --- 1. CARGAR USUARIOS ---
    async function cargarUsuarios() {
        try {
            const res = await fetch(API_URL_USUARIOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            usuariosGlobales = data.usuarios || data;

            selectUsuario.innerHTML = '<option value="" disabled selected>Seleccione un empleado</option>';
            usuariosGlobales.forEach(u => {
                selectUsuario.innerHTML += `<option value="${u.idUsuario}">${u.nombre} ${u.apellido}</option>`;
            });
        } catch (error) {
            console.error("Error cargando usuarios", error);
        }
    }

    // --- 2. CARGAR PRODUCTOS Y BUSCADOR ---
    async function cargarProductos() {
        try {
            const res = await fetch(API_URL_PRODUCTOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            productosGlobales = data.productos || data;
            llenarSelectProductos(productosGlobales);
        } catch (error) {
            console.error("Error cargando productos", error);
        }
    }

    function llenarSelectProductos(lista) {
        selectProducto.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';
        lista.forEach(p => {
            // Nota: Usamos precioVenta si existe, si no precio.
            const precio = parseFloat(p.precioVenta || p.precio || 0);
            const stock = p.stock || 0;
            const option = document.createElement("option");
            option.value = p.idProducto;
            option.textContent = `${p.nombre} - $${precio} (Stock: ${stock})`;
            // Guardamos datos en dataset para acceso rápido
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

    // --- 3. AGREGAR AL CARRITO TEMPORAL ---
    btnAgregarTemporal.addEventListener("click", () => {
        const idProd = selectProducto.value;
        const cantidad = parseInt(inputCantidad.value);
        
        if (!idProd) return alert("Selecciona un producto.");
        if (cantidad <= 0) return alert("Cantidad inválida.");

        // Obtener datos del option seleccionado
        const option = selectProducto.options[selectProducto.selectedIndex];
        const precio = parseFloat(option.dataset.precio);
        const nombre = option.dataset.nombre;
        const stock = parseInt(option.dataset.stock);

        if (cantidad > stock) return alert(`Stock insuficiente. Solo hay ${stock}.`);

        // Revisar si ya existe en carrito
        const existe = carritoVenta.find(i => i.idProducto === idProd);
        if (existe) {
            existe.cantidad += cantidad;
            existe.subtotal = existe.cantidad * existe.precio;
        } else {
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

    // --- 4. RENDERIZAR TABLA ---
    function renderizarCarrito() {
        tablaProductosBody.innerHTML = "";
        let totalAcumulado = 0;

        carritoVenta.forEach((item, index) => {
            totalAcumulado += item.subtotal;
            const row = document.createElement("tr");
            
            // SIN ESTILOS INLINE
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

        // Activar botones de eliminar fila
        document.querySelectorAll(".btn-eliminar-fila").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                carritoVenta.splice(idx, 1);
                renderizarCarrito();
            });
        });
    }

    // --- 5. FINALIZAR VENTA (SUBMIT) ---
    addForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (carritoVenta.length === 0) return alert("No hay productos en la venta.");
        const usuarioID = selectUsuario.value;
        const metodoPago = selectMetodoPago.value;

        // Calcular el subtotal final para enviar al backend
        const subtotalVenta = carritoVenta.reduce((acc, item) => acc + item.subtotal, 0);

        // Preparamos el objeto JSON
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

            if (res.ok) {
                const data = await res.json();
                alert(`Venta creada con éxito! ID: ${data.idVenta}`);
                addModal.style.display = "none";
                cargarVentas(); // Recargar la tabla principal (función existente en tu código)
            } else {
                const txt = await res.text();
                alert("Error al crear venta: " + txt);
            }
        } catch (err) {
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

                // Usamos v.cantidadProductos que viene del nuevo SQL
                // En acciones ponemos el botón de Ver Detalles
                row.innerHTML = `
                    <td>${v.idVenta}</td>
                    <td>${v.nombreUsuario} ${v.apellidoUsuario || ''}</td>
                    <td style="text-align: center; font-weight: bold;">${v.cantidadProductos}</td>
                    <td>$${parseFloat(v.subtotal).toFixed(2)}</td>
                    <td>$${parseFloat(v.total).toFixed(2)}</td>
                    <td><span class="badge-estado">${v.estado}</span></td>
                    <td>
                        <button class="btn-detalles" data-id="${v.idVenta}" title="Ver Detalles">
                            <i class="bi bi-eye"></i> Detalles
                        </button>
                        <!-- Puedes mantener los otros botones si quieres -->
                        <button class="editBtn" data-id="${v.idVenta}" title="Editar">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="deleteBtn" data-id="${v.idVenta}" title="Eliminar" style="color: red;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });

            asignarEventosBotones();
        } catch (err) {
            console.error("Error cargando ventas:", err);
        }
    }

    function asignarEventosBotones() {
        document.querySelectorAll(".btn-detalles").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                verDetallesVenta(id); // <--- AQUI LLAMAMOS A LA NUEVA FUNCIÓN
            });
        });

        // Eventos existentes
        document.querySelectorAll(".deleteBtn").forEach(btn => {
            btn.addEventListener("click", () => eliminarVenta(btn.dataset.id));
        });
        document.querySelectorAll(".editBtn").forEach(btn => {
            btn.addEventListener("click", () => abrirEditarVenta(btn.dataset.id));
        });
    }
    // --- ABRIR MODAL AGREGAR ---
    openAddModalBtn.addEventListener("click", () => {
        carritoVenta = []; // Reiniciar carrito
        renderizarCarrito();
        addForm.reset();
        
        cargarUsuarios();
        cargarProductos();
        addModal.style.display = "flex";
    });

    // --- CERRAR MODAL AGREGAR---
    const cerrarModal = () => { addModal.style.display = "none"; };
    closeAddModalBtn.addEventListener("click", cerrarModal);
    btnCancelarModal.addEventListener("click", cerrarModal);
    window.addEventListener("click", (e) => {
        if (e.target === addModal) cerrarModal();
    });
    // Cerrar modal de detalles
    const cerrarModalDetalles = () => { detailsModal.style.display = "none"; };
    closeDetailsModal.addEventListener("click", cerrarModalDetalles);
    btnCloseDetailsBtn.addEventListener("click", cerrarModalDetalles);

    // Evitar cerrar si clickea dentro, cerrar si clickea fuera
    window.addEventListener("click", (e) => {
        if (e.target === detailsModal) cerrarModalDetalles();
    });

    // 2. FUNCIÓN PARA VER DETALLES (Llamada al Backend)
    window.verDetallesVenta = async (idVenta) => {
        try {
            // Petición al endpoint: /api/ventas/:id
            // Este endpoint debe devolver { venta: {...}, detalles: [...] }
            const res = await fetch(`${API_URL_VENTAS}/${idVenta}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Error al obtener la venta");

            const data = await res.json();
            const venta = data.venta;     // Objeto con datos generales
            const detalles = data.detalles; // Array con los productos

            // A. Llenar Cabecera
            document.getElementById("detailId").textContent = venta.idVenta;
            document.getElementById("detailEmpleado").textContent = `${venta.nombreUsuario || ''} ${venta.apellidoUsuario || ''}`; // Ajusta según tu JSON
            document.getElementById("detailFecha").textContent = new Date(venta.fecha).toLocaleString();
            document.getElementById("detailMetodo").textContent = venta.metodoPago;
            document.getElementById("detailEstado").textContent = venta.estado;

            // B. Llenar Tabla de Productos
            const tbody = document.getElementById("detailsTableBody");
            tbody.innerHTML = "";

            let sumaVerificacion = 0;

            if (detalles && detalles.length > 0) {
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
            } else {
                tbody.innerHTML = "<tr><td colspan='4'>No hay detalles registrados para esta venta.</td></tr>";
            }

            // C. Llenar Totales (Desde la base de datos para exactitud)
            document.getElementById("detailSubtotal").textContent = parseFloat(venta.subtotal).toFixed(2);
            document.getElementById("detailIva").textContent = parseFloat(venta.iva).toFixed(2);
            document.getElementById("detailTotal").textContent = parseFloat(venta.total).toFixed(2);

            // D. Mostrar Modal
            detailsModal.style.display = "flex";

        } catch (err) {
            console.error(err);
            alert("No se pudo cargar el detalle de la venta.");
        }
    };

    cargarUsuarios();
    cargarProductos();
    cargarVentas();
});