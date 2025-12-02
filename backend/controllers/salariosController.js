import { crearSalario, obtenerSalarioPorId, obtenerTodosLosSalarios, actualizarSalario, eliminarSalario } from "../models/salariosModel.js";

export const crearSalarioController = async (req, res) => {
    try {
        const id = await crearSalario(req.body);
        res.json({ message: "Salario creado", id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerSalarioPorIdController = async (req, res) => {
    try {
        const salario = await obtenerSalarioPorId(req.params.id);
        res.json(salario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const obtenerTodosLosSalariosController = async (req, res) => {
    try {
        const salarios = await obtenerTodosLosSalarios();
        res.json(salarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarSalarioController = async (req, res) => {
    try {
        await actualizarSalario(req.params.id, req.body);
        res.json({ message: "Salario actualizado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarSalarioController = async (req, res) => {
    try {
        await eliminarSalario(req.params.id);
        res.json({ message: "Salario eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};