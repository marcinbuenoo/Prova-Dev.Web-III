# 🍽️ Sistema de Reservas de Mesa - Restaurante

Sistema completo de gerenciamento de reservas de mesas em um restaurante, desenvolvido com **TypeScript**, **MongoDB**, **Express** e **Vanilla JavaScript** (HTML/CSS/JS).

## 📋 Descrição do Projeto

Desenvolva um sistema para gerenciar reservas de mesas em um restaurante. A aplicação permite registrar, visualizar, atualizar e cancelar reservas, com verificação de disponibilidade de mesas e aplicação de regras básicas de negócio com foco em organização e uso eficiente do espaço.

---

## ✨ Requisitos Funcionais

### 📌 Regras de Negócio (Obrigatórias)

- ✅ Não permitir duas reservas para a mesma mesa no mesmo horário
- ✅ Uma reserva deve ter horário inicial e duração padrão (ex.: 1h30)
- ✅ Reservas devem ser feitas com antecedência mínima de 1 hora
- ✅ Status da reserva deve ser atualizado conforme o tempo:
  - `reservado` – agendada
  - `ocupado` – no horário atual
  - `finalizado` – horário encerrado
  - `cancelado` – removida pelo usuário
- ✅ Validar se a mesa comporta o número de pessoas da reserva

### 🗄️ Modelo de Dados

#### **Reserva**
- Nome do cliente
- Contato do cliente
- Número da mesa
- Quantidade de pessoas
- Data e hora da reserva
- Observações (opcional)
- Status (reservado, ocupado, finalizado, cancelado)

#### **Mesa**
- Número da mesa
- Capacidade
- Localização (ex.: salão, varanda, área interna)

### 🎯 Funcionalidades CRUD

#### **Reservas**
- ✅ **Criar**: Cadastrar uma nova reserva com validação
- ✅ **Ler**: Listar reservas por cliente, mesa, data ou status
- ✅ **Atualizar**: Editar informações de uma reserva existente
- ✅ **Excluir**: Cancelar/remover uma reserva

#### **Mesas**
- ✅ Cadastro inicial com capacidades
- ✅ Visualização em mapa interativo

### 🎨 Interface (Frontend)

- ✅ **Mapa Visual das Mesas** com cores indicando status:
  - 🟢 Verde – disponível
  - 🟡 Amarelo – reservado
  - 🔴 Vermelho – ocupado
  - ⚫ Cinza – finalizado
  - ⚪ Branco – cancelado
- ✅ Ao clicar em uma mesa, exibir detalhes ou opção de reservar
- ✅ Sidebar com listagem de todas as reservas
- ✅ Busca/filtro por cliente
- ✅ Formulários com validação em tempo real
- ✅ Notificações toast para feedback do usuário

---

## 🏗️ Arquitetura do Projeto

```
DWIII/
├── src/
│   ├── models/              # Modelos MongoDB (Reserva, Mesa)
│   ├── controllers/         # Controladores de negócio
│   ├── routes/              # Rotas da API
│   ├── middleware/          # Middlewares (validação, erro)
│   └── server.ts            # Configuração do servidor
├── frontend/
│   ├── index.html           # Página principal (SPA)
│   ├── app.js               # Lógica da aplicação
│   ├── style.css            # Estilos CSS
│   ├── server.js            # Servidor Express para frontend
│   └── package.json         # Dependências frontend
├── package.json             # Dependências backend
└── README.md                # Este arquivo
```

---

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos

- **Node.js** (v14 ou superior)
- **npm** ou **yarn**
- **MongoDB** rodando localmente ou em um serviço externo

### 1️⃣ Instalação de Dependências

#### Backend
```bash
# Na raiz do projeto
npm install
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

### 2️⃣ Configuração do MongoDB

**Opção A: MongoDB Local**
```bash
# Inicie o MongoDB (macOS/Linux)
mongod

# Ou no Windows
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe"
```

**Opção B: MongoDB Atlas (Cloud)**
1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie um cluster gratuito
3. Obtenha a string de conexão
4. Configure a variável de ambiente (veja próximo passo)

### 3️⃣ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Configuração do MongoDB
MONGODB_URI=mongodb://localhost:27017/reserva
# Ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/reserva

# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=development
```

### 4️⃣ Iniciar o Projeto

#### Backend (Terminal 1)
```bash
npm start
```

Você verá:
```
🚀 Servidor rodando na porta 3000
📍 MongoDB conectado: mongodb://localhost:27017/reserva
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm start
```

Você verá:
```
🌐 Servidor do Frontend rodando na porta 3002
👉 Acesse: http://localhost:3002
```

### 5️⃣ Acesse a Aplicação

Abra seu navegador e acesse:
```
http://localhost:3002
```

---

## 💻 Rotas da API

### Reservas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/reservas` | Listar todas as reservas |
| GET | `/reservas/:id` | Obter detalhes de uma reserva |
| POST | `/reservas` | Criar nova reserva |
| PUT | `/reservas/:id` | Atualizar reserva |
| DELETE | `/reservas/:id` | Cancelar reserva |
| POST | `/reservas/sync` | Sincronizar status automático |

### Mesas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/mesas` | Listar todas as mesas |
| POST | `/mesas` | Criar nova mesa |

---

## 🎮 Como Usar a Aplicação

### Criar Reserva
1. Clique em uma mesa **verde** (disponível) no mapa
2. Preencha o formulário:
   - Nome do cliente
   - Contato (telefone/email)
   - Quantidade de pessoas
   - Data e hora (mínimo 1 hora no futuro)
   - Observações (opcional)
3. Clique **"Confirmar Reserva"**
4. Veja a notificação de sucesso (toast verde)

### Visualizar Reservas
- **Sidebar esquerdo**: Lista todas as reservas ativas
- **Cores das mesas**:
  - 🟢 Verde = Disponível
  - 🟡 Amarelo = Reservado
  - 🔴 Vermelho = Ocupado
  - ⚫ Cinza = Finalizado
  - ⚪ Branco = Cancelado

### Buscar Reserva
1. Use a caixa de busca no sidebar
2. Digite o nome do cliente
3. A lista filtra automaticamente em tempo real

### Atualizar Reserva
1. Passe o mouse sobre uma reserva no sidebar
2. Clique no botão **✏️ Editar**
3. Atualize os dados desejados
4. Clique **"💾 Salvar Alterações"**
5. Veja a notificação de sucesso

### Cancelar Reserva
1. Passe o mouse sobre uma reserva **reservada** no sidebar
2. Clique no botão **🗑️ Cancelar**
3. Confirme a ação
4. Veja a notificação de sucesso

---

## 🔧 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Dotenv** - Variáveis de ambiente

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilos (Variáveis CSS, Flexbox, Grid)
- **JavaScript (Vanilla)** - Interatividade
- **Fetch API** - Requisições HTTP

### Features Frontend
- 🔔 Notificações Toast (sucesso, erro, aviso, info)
- ✅ Validação de formulários em tempo real
- 🔄 Auto-refresh a cada 30 segundos
- 🔍 Busca/filtro de reservas
- 📱 Design responsivo
- ♿ Acessibilidade (ARIA labels, navegação por teclado)

---

## 📝 Estrutura de Diretórios Detalhada

```
DWIII/
├── src/
│   ├── models/
│   │   ├── Reserva.ts       # Schema de reserva
│   │   └── Mesa.ts          # Schema de mesa
│   ├── controllers/
│   │   ├── ReservaController.ts
│   │   └── MesaController.ts
│   ├── routes/
│   │   └── api.ts           # Rotas da API
│   ├── middleware/
│   │   └── errorHandler.ts  # Tratamento de erros
│   └── server.ts            # Configuração Express + MongoDB
├── frontend/
│   ├── index.html           # SPA - Página única
│   ├── app.js               # Lógica da aplicação (505 linhas)
│   ├── style.css            # Estilos (635 linhas)
│   ├── server.js            # Servidor Express
│   ├── package.json         # Dependências
│   └── node_modules/
├── .env                     # Variáveis de ambiente (não commitar)
├── .gitignore               # Arquivos ignorados
├── package.json             # Dependências backend
├── package-lock.json
├── tsconfig.json            # Configuração TypeScript
└── README.md                # Este arquivo
```

---

## 🧪 Testes

### Criar Dados de Teste

```bash
# Mesas de exemplo
curl -X POST http://localhost:3000/mesas \
  -H "Content-Type: application/json" \
  -d '{
    "numero": 1,
    "capacidade": 4,
    "localizacao": "Salão"
  }'
```

### Teste Completo (Frontend)
1. Abra http://localhost:3002
2. Clique em uma mesa verde
3. Preencha e submeta o formulário
4. Observe a mesa mudar de cor
5. Veja a reserva na sidebar
6. Teste editar e cancelar

---

## ⚙️ Troubleshooting

### "Erro ao conectar com o servidor"
- Verifique se o backend está rodando na porta 3000
- Verifique se o MongoDB está rodando
- Veja os logs do backend para mais detalhes

### "CORS Error"
- Certifique-se que o backend permite requisições do frontend (port 3002)
- Backend deve ter CORS configurado para `http://localhost:3002`

### "Falha ao criar mesa"
- Verifique a string de conexão do MongoDB
- Certifique-se que o banco de dados foi criado
- Veja os logs do backend para detalhes do erro

### MongoDB não conecta
- Verifique se mongod está rodando: `ps aux | grep mongod`
- Verifique a URI no arquivo `.env`
- Para MongoDB Atlas, certifique-se que sua IP está na whitelist

---

## 📊 Melhorias Implementadas

### Frontend (v2.0)
✅ Validação de formulários com mensagens de erro  
✅ Sistema de notificações Toast  
✅ Auto-refresh a cada 30 segundos  
✅ Busca/filtro de reservas em tempo real  
✅ Funcionalidade de edição com hover  
✅ Estilos profissionais (617 linhas CSS)  
✅ Código bem estruturado (505 linhas JS)  

---

## 👥 Equipe

Projeto desenvolvido para a avaliação prática de **Desenvolvimento Web III - TypeScript com MongoDB**.

---

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Os logs do backend (terminal 1)
2. O console do navegador (F12)
3. A conexão com MongoDB
4. As variáveis de ambiente

---

## 🎯 Próximas Melhorias (Futuro)

- [ ] Autenticação de usuários (Admin/Cliente)
- [ ] Reservas recorrentes
- [ ] Sistema de avaliações
- [ ] Integração com SMS/Email para confirmações
- [ ] Dashboard de analytics
- [ ] Modo escuro
- [ ] Suporte a múltiplos restaurantes
- [ ] Aplicativo mobile (React Native)
