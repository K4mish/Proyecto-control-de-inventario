import { Router } from 'express';
import { crearCompraController, obtenerComprasController, obtenerCompraConDetallesController, actualizarEstadoCompraController } from '../controllers/compraController.js';
import { autenticar, autorizarAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', autenticar, autorizarAdmin, crearCompraController);
router.get('/', autenticar, autorizarAdmin, obtenerComprasController);
router.get('/:id', autenticar, autorizarAdmin, obtenerCompraConDetallesController);
router.put('/:id', autenticar, autorizarAdmin, actualizarEstadoCompraController);

export default router;