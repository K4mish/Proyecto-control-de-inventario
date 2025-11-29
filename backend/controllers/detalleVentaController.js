import { crearDetalleVenta, obtenerDetallesPorVenta } from '../models/detalleVentaModel.js';

// Agregar detalle a una venta
export const agregarDetalleVentaController = async (req, res) => {
    try {
        const { idVenta, idProducto, cantidad } = req.body;
        const idDetalle = await crearDetalleVenta(idVenta, idProducto, cantidad);
        res.status(201).json({mensaje: "Detalle agregado",idDetalle});
    } catch (error){
        res.status(400).json({error: error.mensaje});
    }
};
// Obtener detalles de una venta
export const obtenerDetallePorVentaController = async (req, res) => {
    try {
        const idVenta = req.params.id;
        const detalles = await obtenerDetallesPorVenta(idVenta);
        res.json(detalles);
    } catch (error){
        res.status(500).json({error: error.mensaje});
    }
};