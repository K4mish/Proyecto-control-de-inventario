import express from 'express';
import { registro, inicioSesion } from '../controllers/authController.js';

const router = express.Router();
// Ruta de registro
router.post('/registro', registro);
// Ruta de inicio de sesión
router.post('/inicio-sesion', inicioSesion);

export default router;