import { Router } from 'express';
import { crearSalarioController, obtenerSalarioPorIdController, obtenerTodosLosSalariosController, actualizarSalarioController, eliminarSalarioController } from "../controllers/salariosController.js";
import { autenticar, autorizarAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post('/', autenticar, autorizarAdmin, crearSalarioController);
router.get('/', autenticar, autorizarAdmin, obtenerTodosLosSalariosController);
router.get('/:id', autenticar, autorizarAdmin, obtenerSalarioPorIdController);
router.put('/:id', autenticar, autorizarAdmin, actualizarSalarioController);
router.delete('/:id', autenticar, autorizarAdmin, eliminarSalarioController);

export default router;