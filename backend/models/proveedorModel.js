import { pool } from '../config/db.js';

// Obtener todos los proveedores
export const obtenerProveedores = async () => {
    const [rows] = await pool.query(`SELECT * FROM proveedores`);
    return rows;
};
// Crear un proveedor
export const crearProveedor = async (nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor) => {
    const [result] = await pool.query(
        `INSERT INTO proveedores (nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor]
    );
    return {idProveedor: result.insertId, nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor};
};
// Obtener proveedor por id
export const obtenerProveedorPorId = async (idProveedor) => {
    const [rows] = await pool.query(`SELECT * FROM proveedores WHERE idProveedor = ?`, [idProveedor]);
    return rows[0];
};
// Actualizar proveedor
export const actualizarProveedor = async (idProveedor,{nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor}) => {
    await pool.query(
        `UPDATE proveedores SET nombre = ?, telefono = ?, correo = ?, direccion = ?, ciudad = ?, nombreContacto = ?, telefonoContacto = ?, correoContacto = ?, estado = ?, tipoProveedor_idTipoProveedor = ? WHERE idProveedor = ?`,
        [nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor, idProveedor]
    );
    return {idProveedor, nombre, telefono, correo, direccion, ciudad, nombreContacto, telefonoContacto, correoContacto, estado, tipoProveedor_idTipoProveedor};
};
// Eliminar proveedor
export const eliminarProveedor = async (idProveedor) => {
    await pool.query(`DELETE FROM proveedores WHERE idProveedor = ?`, [idProveedor]);
};