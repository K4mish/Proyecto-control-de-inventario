import { crearVenta, actualizarSubtotal, obtenerVentas, obtenerVentaPorID } from '../models/ventaModel.js';
import { crearDetalleVenta, obtenerDetallesPorVenta } from '../models/detalleVentaModel.js';

// Crear venta
export const crearVentaController = async (req, res) => {
    try {
        console.log('Body recibido:', req.body);
        const { subtotal, metodoPago, usuarioID, productos } = req.body;

        // 1. Crear Venta
        const idVenta = await crearVenta(subtotal, metodoPago, usuarioID);

        // 2. Crear Detalles
        if (productos && productos.length > 0) {
            for (const prod of productos) {
                // CORRECCIÓN: Tu modelo solo pide (idVenta, idProducto, cantidad)
                // El modelo se encarga de buscar el precio y descontar el stock.
                await crearDetalleVenta(idVenta, prod.idProducto, prod.cantidad);
            }
        }

        res.status(201).json({ mensaje: 'Venta creada exitosamente', idVenta });
    } catch (error) {
        console.error("Error al crear venta:", error);
        // Manejar errores como "Stock insuficiente" que lanza tu modelo
        res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
};
// Obtener todas las ventas
export const obtenerVentasController = async (req, res) => {
  try {
    const ventas = await obtenerVentas();
    res.json(ventas);
  } catch (error){
    res.status(500).json({error: error.mensaje});
  }
};
// Obtener venta con detalle
export const obtenerVentaConDetallesController = async (req, res) => {
  try {
    const idVenta = req.params.id;
    const venta = await obtenerVentaPorID(idVenta);
    if (!venta) return res.status(404).json({mensaje: 'Venta no encontrada'});
    const detalles = await obtenerDetallesPorVenta(idVenta);
    res.json({venta, detalles});
  } catch (error){
    res.status(500).json({mensaje: error.mensaje});
  }
};
// Actualizar subtotal
export const actualizarSubtotalController = async (req, res) => {
  try {
    const {idVenta, subtotal} = req.body;
    await actualizarSubtotal(idVenta, subtotal);
    res.json({mensaje: 'Subtotal actualizado'});
  } catch (error){
    res.status(500).json({error: error.mensaje});
  }
};