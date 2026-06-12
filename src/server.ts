import express from 'express';
import cors from 'cors';
import connectDB from './database/connection';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inicia a conexão com o banco de dados
connectDB();

import mesaRoutes from './routes/mesa.routes';
import reservaRoutes from './routes/reserva.routes';

// Rotas básicas (serão implementadas no próximo passo)
app.use('/mesas', mesaRoutes);
app.use('/reservas', reservaRoutes);

app.get('/', (req, res) => {
  res.send('API Sistema de Reservas de Mesa funcionando!');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
