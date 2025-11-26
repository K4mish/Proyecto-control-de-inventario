import {createProduct, findProductById, getAllProduct, deleteProduct, updateProduct} from "../models/productosModel.js";

// Listar productos
export async function getProducts(req, res) {
    try {
        const products = await getAllProduct();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los productos",
            error: error.message
        });
    }
}
// Obtener producto por ID
export async function getProductById(req, res) {
    const { id } = req.params;

    try {
        const product = await findProductById(id);

        if (!product)
            return res.status(404).json({ message: "Producto no encontrado" });

        res.json(product);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener el producto",
            error: error.message
        });
    }
}
// Crear producto
export async function addProduct(req, res) {
    const {nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id} = req.body;
    console.log("Datos recibidos para nuevo producto:", req.body);
    try {
        const productId = await createProduct(nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id);

        res.status(201).json({
            message: "Producto creado exitosamente",
            productId
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al crear el producto",
            error: error.message
        });
    }
}
// Editar producto
export async function editProduct(req, res) {
    const { id } = req.params;
    const {nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id} = req.body;
    console.log("Datos recibidos para nuevo proveedor:", req.body);
    try {
        await updateProduct(id, nombre, descripcion, precioCompra, precioVenta, stock, urlImagen, proveedor_id, categoria_id);

        res.json({ message: "Producto actualizado exitosamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al actualizar el producto",
            error: error.message
        });
    }
}
// Eliminar producto
export async function removeProduct(req, res) {
    const { id } = req.params;

    try {
        await deleteProduct(id);
        res.json({ message: "Producto eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({
            message: "Error al eliminar el producto",
            error: error.message
        });
    }
}