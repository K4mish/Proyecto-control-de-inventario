import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const autenticar = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });
    jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
        if (error) return res.status(401).json({ mensaje: 'Token inválido' });
        req.usuario = payload;
        next();
    });
};
// Autotorizar que es admin
export const autorizarAdmin = (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ mensaje: 'No autenticado' });
    if (req.usuario.rol !== 'admin'){
        return res.status(403).json({ mensaje: 'No tiene permisos' });
    }
    next();
};