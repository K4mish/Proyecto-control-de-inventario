import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { obtenerRolPorNombre } from '../models/roleModel.js';
import { crearUsuario, obtenerUsuarioPorCorreo } from '../models/userModel.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '2h';
const SALT_ROUNDS = 10;
// Registro de usuario
export const registro = async (req, res) => {
    try {
        const {nombre, apellido, cedula, telefono, correo, contraseña, rol} = req.body;
        if (!nombre || !apellido || !cedula || !telefono || !correo || !contraseña || !rol){
            return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
        }
        //Buscar el rol por nombre de usuario
        const nombreRol = rol || 'usuario';
        const rolObj = await obtenerRolPorNombre(nombreRol);
        if (!rolObj){
            return res.status(400).json({ mensaje: 'Rol no válido' });
        }
        //Verficar si existe el correo
        const usuarioExistente = await obtenerUsuarioPorEmail(correo);
        if (usuarioExistente) return res.status(400).json({ mensaje: 'El correo ya está en uso' });
        //Hashear la contraseña
        const contraseñaHasheada = await bcrypt.hash(contraseña, SALT_ROUNDS);
        //Crear el usuario
        const idUsuario = await crearUsuario({nombre, apellido, cedula, telefono, correo, contraseña: contraseñaHasheada, roles_idRol: rolObj.id});
        return res.status(201).json({ mensaje: 'Usuario registrado exitosamente', idUsuario });
    } catch (error){
        console.error('Error en el registro de usuario:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};
// Inicio de sesión de usuario
export const inicioSesion = async (req, res) => {
    try {
        const {correo, contraseña} = req.body;
        if (!correo || !contraseña) return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
        //Buscar el usuario por correo
        const usuario = await obtenerUsuarioPorCorreo(correo);
        if (!usuario) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        //Verificar la contraseña
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos' });
        //Construir el payload del token
        const payload = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            role: usuario.rol
        };
        //Generar el token JWT
        const token = jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        return res.json({mensaje: 'Inicio de sesión exitoso', token, role: usuario.rol, nombre: usuario.nombre});
    } catch (error){
        console.error(error);
        return res.status(500).json({mensaje: 'Error en el servidor'});
    }
};