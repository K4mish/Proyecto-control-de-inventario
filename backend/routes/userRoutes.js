import express from 'express';
import { listarUsuarios, perfilUsuario } from '../controllers/userController.js';
import { autenticar, autorizarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
// Ruta para obtener el perfil del usuario autenticado
router.get('/perfil', autenticar, perfilUsuario);
// Ruta para listar todos los usuarios (solo administradores)
router.get('/todos', autenticar, autorizarAdmin, listarUsuarios);

export default router;