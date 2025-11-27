const API_URL_VENTAS = "http://localhost:3000/api/ventas";
const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('No has iniciado sesión');
        throw new Error('Token no encontrado');
    }

    const tableBody = document.getElementById("productTableBody");

    const addModal = document.getElementById("addModal");
    const editModal = document.getElementById("editModal");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModalBtn = document.getElementById("closeAddModal");
    const closeEditModalBtn = document.getElementById("closeEditModal");

    const addForm = document.getElementById("addForm");
    const editForm = document.getElementById("editForm");

    const addName = document.getElementById("addName");
    const addProducts = document.getElementById("addProducts");
    const addSubtotal = document.getElementById("addSubtotal");
    const addTotal = document.getElementById("addTotal");

    const editName = document.getElementById("editName");
    const editProducts = document.getElementById("editProducts");
    const editSubtotal = document.getElementById("editSubtotal");
    const editTotal = document.getElementById("editTotal");

    let ventas = []; // ventas cargadas en la tabla
    let productosEnModal = []; // productos temporales mientras se crea una venta

    // ---------- MODALES ----------
    openAddModalBtn.addEventListener("click", () => addModal.style.display = "flex");
    closeAddModalBtn.addEventListener("click", () => addModal.style.display = "none");
    closeEditModalBtn.addEventListener("click", () => editModal.style.display = "none");

    window.addEventListener("click", (e) => {
        if (e.target === addModal) addModal.style.display = "none";
        if (e.target === editModal) editModal.style.display = "none";
    });

    // ---------- FUNCIONES AUXILIARES ----------
    function actualizarTabla() {
        tableBody.innerHTML = "";
        ventas.forEach((venta, index) => {
            const productosContados = {};
            venta.productos.forEach(p => {
                productosContados[p.nombre] = (productosContados[p.nombre] || 0) + 1;
            });

            const productosDisplay = Object.entries(productosContados)
                .map(([nombre, cantidad]) => cantidad > 1 ? `${nombre} (${cantidad})` : nombre)
                .join(", ");

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${venta.empleado}</td>
                <td>${productosDisplay}</td>
                <td>${venta.subtotal.toFixed(2)}</td>
                <td>${venta.total.toFixed(2)}</td>
                <td>${venta.estado || 'pendiente'}</td>
                <td><button class="detalleBtn">Detalle</button></td>
            `;
            tableBody.appendChild(tr);

            tr.querySelector('.detalleBtn').addEventListener('click', () => {
                alert(
                    `Empleado: ${venta.empleado}\n` +
                    `Productos:\n` + 
                    venta.productos.map(p => ` - ${p.nombre} ($${p.precioUnitario.toFixed(2)})`).join('\n') +
                    `\nSubtotal: $${venta.subtotal.toFixed(2)}\nTotal: $${venta.total.toFixed(2)}`
                );
            });
        });
    }

    function calcularTotales(productos) {
        return productos.reduce((sum, p) => sum + p.precioUnitario, 0);
    }

    // ---------- AGREGAR PRODUCTOS EN MODAL ----------
    addForm.addEventListener("submit", (e) => e.preventDefault()); // Evitar submit normal

    addProducts.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const nombreProd = addProducts.value.trim();
            const precioUnit = parseFloat(addSubtotal.value);
            if (!nombreProd || isNaN(precioUnit)) return;
            productosEnModal.push({ nombre: nombreProd, precioUnitario: precioUnit });

            const subtotal = calcularTotales(productosEnModal);
            addTotal.value = subtotal.toFixed(2);

            addProducts.value = "";
            addSubtotal.value = "";
        }
    });

    // ---------- GUARDAR VENTA ----------
    const guardarVentaBtn = document.createElement('button');
    guardarVentaBtn.textContent = "Guardar Venta";
    addForm.appendChild(guardarVentaBtn);

    guardarVentaBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        if (productosEnModal.length === 0) {
            alert("Agrega al menos un producto");
            return;
        }

        const nuevaVenta = {
            empleado: addName.value.trim(),
            productos: productosEnModal,
            subtotal: calcularTotales(productosEnModal),
            total: parseFloat(addTotal.value),
            estado: "pendiente"
        };

        try {
            const res = await fetch(API_URL_VENTAS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(nuevaVenta)
            });
            if (!res.ok) throw new Error("Error al guardar venta");

            ventas.push(nuevaVenta);
            actualizarTabla();

            // Reiniciar modal
            addName.value = "";
            addProducts.value = "";
            addSubtotal.value = "";
            addTotal.value = "";
            productosEnModal = [];
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    // ---------- CARGAR VENTAS EXISTENTES ----------
    async function loadVentas() {
        try {
            const res = await fetch(API_URL_VENTAS, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                ventas = data.map(v => ({
                    ...v,
                    productos: v.productos || []
                }));
                actualizarTabla();
            }
        } catch (err) {
            console.error(err);
        }
    }
    loadVentas();
});