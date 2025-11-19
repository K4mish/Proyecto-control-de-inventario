import express from 'express';
import { listarUsuarios, perfilUsuario } from '../controllers/userController.js';
import { autenticar, autorizarRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
// Ruta para obtener el perfil del usuario autenticado
router.get('/perfil', autenticar, perfilUsuario);
// Ruta para listar todos los usuarios (solo administradores)
router.get('/todos', autenticar, autorizarRoles(['admin']), listarUsuarios);

export default router;