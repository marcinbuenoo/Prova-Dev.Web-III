import mongoose from 'mongoose';
import Mesa from './models/Mesa';
import connectDB from './database/connection';

const seedMesas = async () => {
  try {
    await connectDB();

    console.log('Limpando mesas existentes...');
    await Mesa.deleteMany({});

    console.log('Adicionando mesas iniciais...');
    const mesas = [
      { numero: 1, capacidade: 2, localizacao: 'Janela' },
      { numero: 2, capacidade: 4, localizacao: 'Salão Principal' },
      { numero: 3, capacidade: 4, localizacao: 'Salão Principal' },
      { numero: 4, capacidade: 6, localizacao: 'Varanda' },
      { numero: 5, capacidade: 8, localizacao: 'Área Interna (VIP)' },
      { numero: 6, capacidade: 2, localizacao: 'Varanda' },
    ];

    await Mesa.insertMany(mesas);
    console.log('✅ Mesas inseridas com sucesso!');

    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular as mesas:', error);
    process.exit(1);
  }
};

seedMesas();
