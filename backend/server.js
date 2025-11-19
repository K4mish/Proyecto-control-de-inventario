import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
// Rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontedPages = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontedPages));
app.get('/', (req, res) => {
    res.sendFile(path.join(frontedPages, "html", 'index.html'));
});
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
    next();
});
//Rutas de autenticación y usuario
app.use('/api', authRoutes);
app.use('/api/usuarios', userRoutes);
// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});