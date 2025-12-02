import { pool } from "../config/db.js";

// Crear un salario
export const crearSalario = async ({ cargo, salarioBase, bonificacion, deduccion, usuarios_id }) => {
    const [result] = await pool.query(
        `INSERT INTO salarios (cargo, salarioBase, bonificacion, deduccion, usuarios_id)
        VALUES (?, ?, ?, ?, ?)`,
        [cargo, salarioBase, bonificacion, deduccion, usuarios_id]
    );
    return result.insertId;
};
// Obtener salario por ID
export const obtenerSalarioPorId = async (idSalario) => {
    const [rows] = await pool.query(
        `SELECT s.*, u.nombre, u.apellido 
        FROM salarios s 
        JOIN usuarios u ON s.usuarios_id = u.idUsuario
        WHERE s.idSalario = ?`,
        [idSalario]
    );
    return rows[0];
};
// Obtener todos los salarios
export const obtenerTodosLosSalarios = async () => {
    const [rows] = await pool.query(
        `SELECT s.idSalario, s.cargo, s.salarioBase, s.bonificacion, s.deduccion,
                u.nombre, u.apellido, u.correo
        FROM salarios s
        JOIN usuarios u ON s.usuarios_id = u.idUsuario`
    );
    return rows;
};
// Actualizar salario
export const actualizarSalario = async (idSalario, { cargo, salarioBase, bonificacion, deduccion, usuarios_id }) => {
    await pool.query(
        `UPDATE salarios
        SET cargo = ?, salarioBase = ?, bonificacion = ?, deduccion = ?, usuarios_id = ?
        WHERE idSalario = ?`,
        [cargo, salarioBase, bonificacion, deduccion, usuarios_id, idSalario]
    );
};
// Eliminar salario
export const eliminarSalario = async (idSalario) => {
    await pool.query(`DELETE FROM salarios WHERE idSalario = ?`, [idSalario]);
};