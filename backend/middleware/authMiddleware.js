import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const autenticar = (req, res, next) => {
    const authHeader = req.headers. authorization || '';
    const token = authHeader.startwith('Bearer ') ? authHeader.slice(' ')(1) : (req.body.token || req.query.token);
    if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error){
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
}
// Autotorizar roles en rutas protegidas
export const autorizarRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ mensaje: 'No autenticado' });
        if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ mensaje: 'No tiene permisos' });
        next();
    };
}