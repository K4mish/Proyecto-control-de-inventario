import { obtenerProveedores, crearProveedor, obtenerProveedorPorId, actualizarProveedor, eliminarProveedor } from "../models/proveedorModel.js";

// Obtener todos
export const listarProveedores = async (req, res) => {
    try {
        const proveedores = await obtenerProveedores();
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proveedores", error });
    }
};
// Crear proveedor
export const registrarProveedor = async (req, res) => {
    try {
        console.log("Datos recibidos para nuevo proveedor:", req.body);
        const {nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, categoria_id} = req.body;
        const nuevo = await crearProveedor(nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, categoria_id);
        res.status(201).json(nuevo);
    } catch (error) {
        res.status(500).json({ message: "Error al crear proveedor", error });
    }
};
// Obtener por ID
export const verProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const proveedor = await obtenerProveedorPorId(id);

        if (!proveedor) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json(proveedor);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proveedor", error });
    }
};
// Actualizar proveedor
export const editarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;
        const actualizado = await actualizarProveedor(id, datos);
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar proveedor", error });
    }
};
// Eliminar proveedor
export const borrarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        await eliminarProveedor(id);
        res.json({ message: "Proveedor eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar proveedor", error });
    }
};