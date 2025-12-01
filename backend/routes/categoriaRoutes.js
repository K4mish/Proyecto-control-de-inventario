import { Router } from "express";
import { crear, listar, obtener, actualizar, eliminar } from "../controllers/categoriaController.js";
import { autorizarAdmin, autenticar } from "../middleware/authMiddleware.js";

const router = Router();

// Todas las rutas usan autenticacion
router.post('/', autenticar, autorizarAdmin, crear);
router.get('/', autenticar, autorizarAdmin, listar);
router.get('/:id', autenticar, autorizarAdmin, obtener);
router.put('/:id', autenticar, autorizarAdmin, actualizar);
router.delete('/:id', autenticar, autorizarAdmin, eliminar);

export default router;