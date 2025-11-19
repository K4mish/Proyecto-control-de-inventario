import pool from '../config/db.js';

export const obtenerRolPorId = async (idRol) => {
    const [rows] = await pool.query('SELECT * FROM roles where idRol = ?', [idRol]);
    return rows[0];
};

export const obtenerRolPorNombre = async (rol) => {
    const [rows] = await pool.query('SELECT * FROM roles where rol = ?', [rol]);
    return rows[0];
};

export const obtenerTodosLosRoles = async () => {
    const [rows] = await pool.query('SELECT * FROM roles');
    return rows;
};