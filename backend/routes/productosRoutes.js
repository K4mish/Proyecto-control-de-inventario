import { Router } from "express";
import {getProducts, getProductById, addProduct, editProduct, removeProduct} from "../controllers/productosController.js";
import { autorizarAdmin, autenticar } from "../middleware/authMiddleware.js";

const router = Router();

// Rutas accesibles para cualquier usuario autenticado
router.get("/", autenticar, getProducts);          // Listar todos
router.get("/:id", autenticar, getProductById);    // Buscar por ID

// Rutas solo para admin
router.post("/", autenticar, autorizarAdmin, addProduct);        // Crear producto
router.put("/:id", autenticar, autorizarAdmin, editProduct);     // Editar producto
router.delete("/:id", autenticar, autorizarAdmin, removeProduct); // Eliminar producto

export default router;