import { crearVenta, actualizarSubtotal, obtenerVentas, obtenerVentaPorID, actualizarEstadoVenta } from '../models/ventaModel.js';
import { crearDetalleVenta, obtenerDetallesPorVenta } from '../models/detalleVentaModel.js';
import { devolverStock } from '../models/productosModel.js';

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
// Actualizar estado
export const actualizarEstadoVentaController = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    console.log(`--- INTENTO DE ACTUALIZAR VENTA #${id} A ESTADO: ${estado} ---`);

    if (!estado) return res.status(400).json({ mensaje: 'Estado obligatorio' });

    const ventaActual = await obtenerVentaPorID(id);
    if (!ventaActual) return res.status(404).json({ mensaje: 'Venta no encontrada' });
    if (estado === 'Cancelada' || estado === 'anulada') {
        
        if (ventaActual.estado === 'cancelada' || ventaActual.estado === 'anulada') {
            console.log("La venta ya estaba cancelada anteriormente.");
            return res.status(400).json({ mensaje: 'Esta venta ya está cancelada.' });
        }

        const detalles = await obtenerDetallesPorVenta(id);
        console.log("Productos encontrados en la venta:", detalles);

        for (const detalle of detalles){
            const idProductoAjustado = detalle.idProducto || detalle.productos_id;
            const cantidadAjustada = detalle.cantidad;

            if (!idProductoAjustado){
                console.error("ERROR: No se encontró el ID del producto en el objeto detalle:", detalle);
                continue;
            }
            console.log(`Devolviendo stock -> ID: ${idProductoAjustado}, Cantidad: ${cantidadAjustada}`);
            await devolverStock(idProductoAjustado, cantidadAjustada);
        }
    }
    const result = await actualizarEstadoVenta(id, estado);
    console.log("Estado actualizado en BD correctamente.");
    res.json({ mensaje: `Venta actualizada a ${estado} correctamente.` });
  } catch (error){
    console.error("CRASH en actualizarEstadoVentaController:", error);
    res.status(500).json({ error: error.message });
  }
};