import { obtenerUsuarioPorId, obtenerTodosLosUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../models/userModel.js';
import bcrypt from 'bcrypt';

export const perfilUsuario = async (req, res) => {
    try {
        const usuario = await obtenerUsuarioPorId(req.usuario.idUsuario);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        delete usuario.contrasena; // Eliminar la contraseña del objeto antes de enviarlo
        res.json({nombreCompleto: `${usuario.nombre} ${usuario.apellido}`, usuario});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await obtenerTodosLosUsuarios();
        return res.json({usuarios});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

export const crearUser = async (req, res) => {
    try {
        const { nombre, apellido, cedula, telefono, correo, contrasena, roles_id } = req.body;
        // Hashear la contraseña antes de guardar
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const id = await crearUsuario({ nombre, apellido, cedula, telefono, correo, contrasena: hashedPassword, roles_id });
        res.status(201).json({ mensaje: 'Usuario creado correctamente', id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
};

export const actualizarUser = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const { nombre, apellido, cedula, telefono, correo, roles_id } = req.body;
        await actualizarUsuario(idUsuario, { nombre, apellido, cedula, telefono, correo, roles_id });
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

export const eliminarUser = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        await eliminarUsuario(idUsuario);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};