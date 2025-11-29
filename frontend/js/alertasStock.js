const API_URL_PRODUCTOS = "http://localhost:3000/api/productos";

document.addEventListener('DOMContentLoaded', () => {
    if (!token) {
        alert('No has iniciado sesión');
        window.location.href = "../html/index.html";
        return;
    }

    const tableBody = document.getElementById("alertasTableBody");
    const checkSoloCritico = document.getElementById("checkSoloCritico");
    
    let productosGlobales = [];
    
    const LIMITE_CRITICO = 5; 
    const LIMITE_BAJO = 15;

    async function cargarAlertas(){
        try {
            const res = await fetch(API_URL_PRODUCTOS, { 
                headers: { "Authorization": `Bearer ${token}` } 
            });
            const data = await res.json();
            
            productosGlobales = data.productos || data;

            renderizarTabla();
        } catch (error){
            console.error("Error cargando productos para alertas:", error);
        }
    }

    function renderizarTabla(){
        tableBody.innerHTML = "";
        const mostrarSoloAlertas = checkSoloCritico.checked;

        productosGlobales.forEach(p => {
            const stock = parseInt(p.stock);
            let claseFila = "";
            let icono = "";
            let textoEstado = "";
            let esAlerta = false;
            // Lógica de Semáforo
            if (stock <= LIMITE_CRITICO){
                claseFila = "critico";
                icono = '<i class="bi bi-exclamation-triangle-fill"></i>';
                textoEstado = "Stock Crítico";
                esAlerta = true;
            } else if (stock <= LIMITE_BAJO){
                claseFila = "bajo";
                icono = '<i class="bi bi-bell-fill"></i>';
                textoEstado = "Stock Bajo";
                esAlerta = true;
            } else {
                claseFila = "";
                icono = '<i class="bi bi-check-square-fill" style="color: green;"></i>';
                textoEstado = "Stock Suficiente";
            }

            if (mostrarSoloAlertas && !esAlerta){
                return; 
            }

            const row = document.createElement("tr");
            if (claseFila) row.classList.add(claseFila);

            row.innerHTML = `
                <td><strong>${p.nombre}</strong></td>
                <td>${p.nombreCategoria || 'Sin Categoría'}</td>
                <td style="font-size: 1.2rem; font-weight: bold;">${stock}</td>
                <td>${icono} ${textoEstado}</td>
            `;

            tableBody.appendChild(row);
        });

        if (tableBody.innerHTML === ""){
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No se encontraron productos con ese criterio.</td></tr>`;
        }
    }
    checkSoloCritico.addEventListener("change", renderizarTabla);
    cargarAlertas();
});