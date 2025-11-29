import { Router } from 'express';
import { agregarDetalleVentaController, obtenerDetallePorVentaController } from '../controllers/detalleVentaController.js';
import { autenticar } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', autenticar, agregarDetalleVentaController);
router.get('/:id', autenticar, obtenerDetallePorVentaController);

export default router;