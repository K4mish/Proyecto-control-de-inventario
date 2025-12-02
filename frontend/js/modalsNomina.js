const API_URL = "http://localhost:3000/api/salarios";
const API_URL_USUARIOS = "http://localhost:3000/api/usuarios";

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
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

    // --- ELEMENTOS DEL DOM ---
    const tablaBody = document.getElementById("salarioTableBody");
    const addModal = document.getElementById("addModal");
    const addForm = document.getElementById("addForm");
    const openAddModalBtn = document.getElementById("openAddModalBtn");
    const closeAddModal = document.getElementById("closeAddModal");
    const editModal = document.getElementById("editModal");
    const editForm = document.getElementById("editForm");
    const closeEditModal = document.getElementById("closeEditModal");
    const addEmpleadoSelect = document.getElementById("addEmpleado");
    const editEmpleadoSelect = document.getElementById("editEmpleado");

    // --- RESTRICCIÓN POR ROL ---
    if (rolUsuario === 'empleado'){
        if (openAddModalBtn) openAddModalBtn.style.display = 'none';
        const thAcciones = document.querySelectorAll('th:last-child');
        thAcciones.forEach(th => th.style.display = 'none');
    }
    // --- FUNCIONES ---
    function fillSelect(selectElement, data, keyId, keyName){
        const lista = Array.isArray(data) ? data : data.usuarios || [];
        selectElement.innerHTML = `<option value="">Seleccionar...</option>`;
        lista.forEach(item => {
            const opt = document.createElement("option");
            opt.value = item[keyId];
            opt.textContent = item[keyName];
            selectElement.appendChild(opt);
        });
    }

    async function loadSelects(){
        try {
            const res = await fetch(API_URL_USUARIOS, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await res.json();
            fillSelect(addEmpleadoSelect, data, 'idUsuario', 'nombre');
            fillSelect(editEmpleadoSelect, data, 'idUsuario', 'nombre');
        } catch (err){ 
            console.error(err); 
            mostrarMensaje("Error", "No se pudieron cargar los empleados"); 
        }
    }

    async function loadSalarios(){
        try {
            const res = await fetch(API_URL, { headers: { "Authorization": `Bearer ${token}` } });
            const salarios = await res.json();
            tablaBody.innerHTML = "";

            salarios.forEach(s => {
                const row = document.createElement("tr");
                let htmlRow = `
                    <td>${s.idSalario}</td>
                    <td>${s.nombre} ${s.apellido}</td>
                    <td>${s.cargo}</td>
                    <td>${s.salarioBase}</td>
                    <td>${s.bonificacion}</td>
                    <td>${s.deduccion}</td>
                `;
                if (rolUsuario === 'admin'){
                    htmlRow += `
                        <td>
                            <button class="editBtn" data-id="${s.idSalario}"><i class="bi bi-pencil-square"></i></button>
                            <button class="deleteBtn" data-id="${s.idSalario}"><i class="bi bi-trash"></i></button>
                        </td>
                    `;
                }
                row.innerHTML = htmlRow;
                tablaBody.appendChild(row);
            });

            if (rolUsuario === 'admin'){
                document.querySelectorAll(".editBtn").forEach(btn => {
                    btn.addEventListener("click", () => abrirEditModal(btn.dataset.id));
                });
                document.querySelectorAll(".deleteBtn").forEach(btn => {
                    btn.addEventListener("click", () => eliminarSalario(btn.dataset.id));
                });
            }
        } catch(err){ console.error(err); mostrarMensaje("Error", "No se pudieron cargar los salarios"); }
    }
    // --- AGREGAR SALARIO ---
    if(addForm){
        addForm.addEventListener("submit", async e => {
            e.preventDefault();
            const data = {
                usuarios_id: addEmpleadoSelect.value,
                cargo: document.getElementById("addCargo").value,
                salarioBase: parseFloat(document.getElementById("addSalarioBase").value),
                bonificacion: 0,
                deduccion: 0
            };
            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
                if(res.ok){
                    mostrarMensaje("Éxito", "Salario agregado correctamente");
                    addModal.style.display = 'none';
                    addForm.reset();
                    loadSalarios();
                } else {
                    mostrarMensaje("Error", "No se pudo agregar el salario");
                }
            } catch(err){ console.error(err); mostrarMensaje("Error", "Error de conexión"); }
        });
    }
    // --- EDITAR SALARIO ---
    async function abrirEditModal(id){
        try {
            const res = await fetch(`${API_URL}/${id}`, { headers: { "Authorization": `Bearer ${token}` } });
            const s = await res.json();
            document.getElementById("editId").value = s.idSalario;
            editEmpleadoSelect.value = s.usuarios_id;
            document.getElementById("editCargo").value = s.cargo;
            document.getElementById("editSalarioBase").value = s.salarioBase;
            editModal.style.display = 'flex';
        } catch(err){ console.error(err); mostrarMensaje("Error", "No se pudo cargar el salario"); }
    }

    if(editForm){
        editForm.addEventListener("submit", async e => {
            e.preventDefault();
            const id = document.getElementById("editId").value;
            const data = {
                usuarios_id: editEmpleadoSelect.value,
                cargo: document.getElementById("editCargo").value,
                salarioBase: parseFloat(document.getElementById("editSalarioBase").value),
                bonificacion: 0,
                deduccion: 0
            };
            try {
                const res = await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(data)
                });
                if(res.ok){
                    mostrarMensaje("Éxito", "Salario actualizado");
                    editModal.style.display = 'none';
                    loadSalarios();
                } else {
                    mostrarMensaje("Error", "No se pudo actualizar el salario");
                }
            } catch(err){ console.error(err); mostrarMensaje("Error", "Error de conexión"); }
        });
    }
    // --- ELIMINAR SALARIO ---
    async function eliminarSalario(id){
        if(!confirm("¿Desea eliminar este salario?")) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if(res.ok){
                mostrarMensaje("Éxito", "Salario eliminado");
                loadSalarios();
            } else {
                mostrarMensaje("Error", "No se pudo eliminar el salario");
            }
        } catch(err){ console.error(err); mostrarMensaje("Error", "Error de conexión"); }
    }
    // --- MODALES ---
    if(openAddModalBtn) openAddModalBtn.addEventListener("click", () => { addForm.reset(); addModal.style.display = 'flex'; });
    if(closeAddModal) closeAddModal.addEventListener("click", () => addModal.style.display = 'none');
    if(closeEditModal) closeEditModal.addEventListener("click", () => editModal.style.display = 'none');

    window.addEventListener("click", e => {
        if(e.target === addModal) addModal.style.display = 'none';
        if(e.target === editModal) editModal.style.display = 'none';
        if(e.target === msgModal) msgModal.style.display = 'none';
    });
    loadSelects();
    loadSalarios();
});