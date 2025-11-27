import express from 'express';
import { listarUsuarios, perfilUsuario, crearUser, actualizarUser, eliminarUser } from '../controllers/userController.js';
import { autenticar, autorizarAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
// Ruta para obtener el perfil del usuario autenticado
router.get('/perfil', autenticar, perfilUsuario);
// Ruta para listar todos los usuarios (solo administradores)
router.get('/', autenticar, autorizarAdmin, listarUsuarios);
router.post('/', autenticar, autorizarAdmin, crearUser);
router.put('/:id', autenticar, autorizarAdmin, actualizarUser);
router.delete('/:id', autenticar, autorizarAdmin, eliminarUser);

export default router;