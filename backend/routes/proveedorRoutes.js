import { Router } from "express";
import { listarProveedores, registrarProveedor, verProveedor, editarProveedor, borrarProveedor } from "../controllers/proveedorController.js";
import { autorizarAdmin, autenticar } from "../middleware/authMiddleware.js";

const router = Router();

// Todas las rutas usan autenticacion
router.get("/", autenticar, autorizarAdmin, listarProveedores);
router.post("/", autenticar, autorizarAdmin, registrarProveedor);
router.get("/:id", autenticar, autorizarAdmin, verProveedor);
router.put("/:id", autenticar, autorizarAdmin, editarProveedor);
router.delete("/:id", autenticar, autorizarAdmin, borrarProveedor);

export default router;