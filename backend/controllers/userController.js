import { obtenerUsuarioPorId, obtenerTodosLosUsuarios } from '../models/userModel.js';

export const perfilUsuario = async (req, res) => {
    try {
        const usuario = await obtenerUsuarioPorId(req.user.id);
        if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        delete usuario.contrasena; // Eliminar la contraseña del objeto antes de enviarlo
        return res.json({usuario});
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