import { Router } from 'express';
import { crearVentaController, obtenerVentasController, obtenerVentaConDetallesController, actualizarSubtotalController } from '../controllers/ventaController.js';
import { autorizarAdmin, autenticar } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', autenticar, crearVentaController);
router.get('/', autenticar, obtenerVentasController);
router.get('/:id', autenticar, obtenerVentaConDetallesController);
router.get('/subtotal', autenticar, actualizarSubtotalController);

export default router;