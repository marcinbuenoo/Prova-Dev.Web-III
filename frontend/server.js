const express = require('express');
const path = require('path');

const app = express();
const PORT = 3002;

// Serve todos os arquivos estáticos da pasta frontend (CSS, JS, Imagens, etc)
app.use(express.static(path.join(__dirname)));

// Qualquer rota redireciona para o index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor do Frontend rodando na porta ${PORT}`);
    console.log(`👉 Acesse: http://localhost:${PORT}`);
});
