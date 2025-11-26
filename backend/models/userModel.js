import { pool } from "../config/db.js";

export const crearUsuario = async ({nombre, apellido, cedula, telefono, correo, contrasena, roles_id}) => {
    const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, apellido, cedula, telefono, correo, contrasena, roles_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [nombre, apellido, cedula, telefono, correo, contrasena,roles_id]
    );
    return result.insertId;
};

export const obtenerUsuarioPorCorreo = async (correo) => {
    const [rows] = await pool.query('SELECT u.*, r.rol FROM usuarios u JOIN roles r ON u.roles_id = r.idRol WHERE u.correo = ?', [correo]);
    return rows[0];
};

export const obtenerUsuarioPorId = async (idUsuario) => {
    const [rows] = await pool.query('SELECT u.*, r.rol FROM usuarios u JOIN roles r ON u.roles_id = r.idRol WHERE u.idUsuario = ?', [idUsuario]);
    return rows[0];
};

export const obtenerTodosLosUsuarios = async () => {
    const [rows] = await pool.query('SELECT u.idUsuario, u.nombre, u.apellido, u.cedula, u.telefono, u.correo, r.rol FROM usuarios u JOIN roles r ON u.roles_id = r.idRol');
    return rows;
};

export const actualizarUsuario = async (idUsuario, {nombre, apellido, cedula, telefono, correo, roles_id}) => {
    await pool.query(
        'UPDATE usuarios SET nombre = ?, apellido = ?, cedula = ?, telefono = ?, correo = ?, roles_id = ? WHERE idUsuario = ?',
        [nombre, apellido, cedula, telefono, correo, roles_id, idUsuario]
    );
};

export const eliminarUsuario = async (idUsuario) => {
    await pool.query('DELETE FROM usuarios WHERE idUsuario = ?', [idUsuario]);
};