import { crearCompra, obtenerCompras, obtenerCompraPorID, actualizarEstadoCompra } from '../models/compraModel.js';
import { crearDetalleCompra, obtenerDetallesPorCompra } from '../models/detalleCompraModel.js';
import { descontarStock } from '../models/productosModel.js'; 

// Crear compra
export const crearCompraController = async (req, res) => {
    try {
        console.log('Compra recibida:', req.body);
        const { subtotal, metodoPago, empleadoID, proveedorID, productos } = req.body;

        if (!proveedorID) return res.status(400).json({ error: "Debe seleccionar un proveedor" });
        const idCompra = await crearCompra(subtotal, metodoPago, empleadoID, proveedorID);
        if (productos && productos.length > 0){
            for (const prod of productos){
                await crearDetalleCompra(idCompra, prod.idProducto, prod.cantidad, prod.precio);
            }
        }
        res.status(201).json({ mensaje: 'Compra registrada exitosamente', idCompra });
    } catch (error){
        console.error("Error al crear compra:", error);
        res.status(500).json({ error: error.message || "Error interno del servidor" });
    }
};
// Obtener todas las compras
export const obtenerComprasController = async (req, res) => {
  try {
    const compras = await obtenerCompras();
    res.json(compras);
  } catch (error){
    res.status(500).json({error: error.message});
  }
};
// Obtener compra con detalle
export const obtenerCompraConDetallesController = async (req, res) => {
  try {
    const idCompra = req.params.id;
    const compra = await obtenerCompraPorID(idCompra);
    if (!compra) return res.status(404).json({mensaje: 'Compra no encontrada'});
    const detalles = await obtenerDetallesPorCompra(idCompra);
    res.json({compra, detalles});
  } catch (error){
    res.status(500).json({mensaje: error.message});
  }
};
// Actualizar estado
export const actualizarEstadoCompraController = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    console.log(`--- ACTUALIZAR COMPRA #${id} A ESTADO: ${estado} ---`);

    if (!estado) return res.status(400).json({ mensaje: 'Estado obligatorio' });

    const compraActual = await obtenerCompraPorID(id);
    if (!compraActual) return res.status(404).json({ mensaje: 'Compra no encontrada' });
    if (estado === 'anulada'){
        if (compraActual.estado === 'anulada'){
            return res.status(400).json({ mensaje: 'Esta compra ya está anulada.' });
        }
        const detalles = await obtenerDetallesPorCompra(id);
        for (const detalle of detalles){
            const idProductoAjustado = detalle.idProducto;
            const cantidadAjustada = detalle.cantidad;
            if (idProductoAjustado){
                console.log(`Restando stock (Anulación Compra) -> ID: ${idProductoAjustado}, Cantidad: ${cantidadAjustada}`);
                await descontarStock(idProductoAjustado, cantidadAjustada);
            }
        }
    }
    const result = await actualizarEstadoCompra(id, estado);
    res.json({ mensaje: `Compra actualizada a ${estado} correctamente.` });

  } catch (error){
    console.error("Error en actualizarEstadoCompraController:", error);
    res.status(500).json({ error: error.message });
  }
};