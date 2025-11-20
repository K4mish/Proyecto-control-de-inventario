const API_URL = "http://localhost:3000/api/productos";
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../html/index.html';
        return;
    }
const tableBody = document.getElementById("cuerpoTablaProducto");
const addModal = document.getElementById("agregarModal");
const editModal = document.getElementById("editarModal");
const addForm = document.getElementById("agregarForm");
const editForm = document.getElementById("editarForm");
const closeAddModal = document.getElementById("cerrarAgregarModal");
const closeEditModal = document.getElementById("cerrarEditarModal");
const openAddModalBtn = document.getElementById("botonAbrirAgregarModal");

// CARGAR PRODUCTOS
async function loadProducts() {
    try {
        const res = await fetch(API_URL, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        const products = await res.json();
        tableBody.innerHTML = "";

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
                    <button onclick="openEditModal(${p.idProducto}, ${p.nombre}, ${p.categoria}, '${p.precioCompra}', '${p.precioVenta}', '${p.stock}', '${p.urlImagen}')">Editar</button>
                    <button onclick="deleteProduct(${p.idProducto})">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}
// ELIMINAR PRODUCTO
async function deleteProduct(id) {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    });

    loadProducts();
}

// ABRIR / CERRAR AGREGAR
openAddModalBtn.addEventListener("click", () => addModal.style.display = "flex");
closeAddModal.addEventListener("click", () => addModal.style.display = "none");
// AGREGAR PRODUCTO
addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nuevoProducto = {
        nombre: document.getElementById("agregarNombre").value,
        categoria: document.getElementById("agregarCategoria").value,
        precioCompra: parseFloat(document.getElementById("agregarPrecioCompra").value),
        precioVenta: parseFloat(document.getElementById("agregarPrecioVenta").value),
        stock: parseInt(document.getElementById("agregarStock").value),
        urlImagen: document.getElementById("agregarImagen").value,
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(nuevoProducto),
        });

        if (!res.ok) throw new Error("Error al crear el producto");

        alert("Producto agregado correctamente");
        addModal.style.display = "none";
        addForm.reset();
        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error al agregar producto");
    }
});

// ABRIR MODAL EDITAR
function openEditModal(id, nombre, categoria, precioCompra, precioVenta, stock, urlImagen) {

    document.getElementById("editId").value = id;
    document.getElementById("editarNombre").value = nombre;
    document.getElementById("editarCategoria").value = categoria;
    document.getElementById("editarPrecioCompra").value = precioCompra;
    document.getElementById("editarPrecioVenta").value = precioVenta;
    document.getElementById("editarStock").value = stock;
    document.getElementById("editarImage").value = urlImagen;

    editModal.style.display = "flex";
}

closeEditModal.addEventListener("click", () => editModal.style.display = "none");
// GUARDAR EDICIÓN
editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    const productoActualizado = {
        nombre: document.getElementById("editarNombre").value,
        categoria: document.getElementById("editarCategoria").value,
        precioCompra: parseFloat(document.getElementById("editarPrecioCompra").value),
        precioVenta: parseFloat(document.getElementById("editarPrecioVenta").value),
        stock: parseInt(document.getElementById("editarStock").value),
        urlImagen: document.getElementById("editarImage").value
    };

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(productoActualizado),
        });

        alert("Producto actualizado");
        editModal.style.display = "none";
        loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error al editar producto");
    }
});
// CARGAR PRODUCTOS AL INICIAR
loadProducts();
});