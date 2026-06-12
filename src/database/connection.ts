import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Conexão com o banco "reserva" conforme exigido na prova
    await mongoose.connect('mongodb://127.0.0.1:27017/reserva');
    console.log('✅ MongoDB conectado com sucesso ao banco "reserva"');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
