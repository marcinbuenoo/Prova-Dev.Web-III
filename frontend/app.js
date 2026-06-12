const API_URL = 'http://localhost:3000';

let mesasData = [];
let reservasData = [];

// Elementos DOM
const mapContainer = document.getElementById('restaurantMap');
const reservasList = document.getElementById('reservasList');
const modal = document.getElementById('mesaModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchDados();
});

async function fetchDados() {
    try {
        // Sincroniza status antes de buscar
        await fetch(`${API_URL}/reservas/sync`, { method: 'POST' }).catch(e => console.log('Erro ao sincronizar:', e));
        
        const [mesasRes, reservasRes] = await Promise.all([
            fetch(`${API_URL}/mesas`),
            fetch(`${API_URL}/reservas`)
        ]);

        mesasData = await mesasRes.json();
        reservasData = await reservasRes.json();

        renderMap();
        renderReservasList();
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        alert("Erro ao conectar com o servidor. Verifique se o backend está rodando na porta 3000.");
    }
}

async function fetchReservas() {
    await fetchDados();
}

function getMesaStatus(numeroMesa) {
    const reservasAtivas = reservasData.filter(r => r.numeroMesa === numeroMesa && (r.status === 'reservado' || r.status === 'ocupado'));
    
    if (reservasAtivas.length === 0) return 'disponivel';
    
    // Simplificação para o mapa atual: se houver alguma ocupada, a mesa está ocupada.
    const isOcupado = reservasAtivas.some(r => r.status === 'ocupado');
    if (isOcupado) return 'ocupado';
    
    return 'reservado';
}

function renderMap() {
    mapContainer.innerHTML = '';

    if (mesasData.length === 0) {
        mapContainer.innerHTML = '<p style="color:var(--text-muted); grid-column: 1 / -1; text-align: center;">Nenhuma mesa cadastrada. Por favor, adicione mesas no banco de dados.</p>';
        return;
    }

    mesasData.forEach(mesa => {
        const status = getMesaStatus(mesa.numero);
        
        const mesaEl = document.createElement('div');
        mesaEl.className = `mesa-item ${status}`;
        mesaEl.innerHTML = `
            <div class="mesa-numero">${mesa.numero}</div>
            <div class="mesa-cap">👤 ${mesa.capacidade} lugares</div>
        `;
        
        mesaEl.onclick = () => openModal(mesa, status);
        
        mapContainer.appendChild(mesaEl);
    });
}

function renderReservasList() {
    reservasList.innerHTML = '';
    
    if (reservasData.length === 0) {
        reservasList.innerHTML = '<p style="color:var(--text-muted); text-align: center;">Sem reservas no momento.</p>';
        return;
    }

    reservasData.forEach(reserva => {
        const dataFomatada = new Date(reserva.dataHora).toLocaleString('pt-BR');
        
        const reservaEl = document.createElement('div');
        reservaEl.className = 'reserva-card';
        reservaEl.innerHTML = `
            <div class="reserva-header">
                <span>Mesa ${reserva.numeroMesa}</span>
                <span class="status-badge ${reserva.status}">${reserva.status}</span>
            </div>
            <div class="reserva-details">
                <p><strong>Cliente:</strong> ${reserva.nomeCliente}</p>
                <p><strong>Data/Hora:</strong> ${dataFomatada}</p>
                <p><strong>Pessoas:</strong> ${reserva.quantidadePessoas}</p>
            </div>
        `;
        reservasList.appendChild(reservaEl);
    });
}

function openModal(mesa, status) {
    modalTitle.textContent = `Mesa ${mesa.numero}`;
    
    if (status === 'disponivel') {
        // Formulário de Reserva
        modalBody.innerHTML = `
            <p style="margin-bottom: 1rem; color: var(--color-available);">Mesa disponível para reserva.</p>
            <form id="reservaForm" onsubmit="submitReserva(event, ${mesa.numero})">
                <div class="form-group">
                    <label>Nome do Cliente</label>
                    <input type="text" id="nomeCliente" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Contato</label>
                    <input type="text" id="contatoCliente" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Quantidade de Pessoas</label>
                    <input type="number" id="qtdPessoas" class="form-control" min="1" max="${mesa.capacidade}" required>
                </div>
                <div class="form-group">
                    <label>Data e Hora da Reserva</label>
                    <!-- Permite escolher apenas datas a partir de agora -->
                    <input type="datetime-local" id="dataHora" class="form-control" required>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <input type="text" id="obs" class="form-control">
                </div>
                <button type="submit" class="btn btn-primary">Confirmar Reserva</button>
            </form>
        `;
    } else {
        // Exibe detalhes da reserva atual/próxima e opção de cancelar
        const reservasMesa = reservasData.filter(r => r.numeroMesa === mesa.numero && (r.status === 'reservado' || r.status === 'ocupado'));
        const reservaAtual = reservasMesa[0]; // Pega a primeira ativa

        const dataFomatada = new Date(reservaAtual.dataHora).toLocaleString('pt-BR');

        modalBody.innerHTML = `
            <div class="reserva-details" style="margin-bottom: 1.5rem; font-size: 1rem;">
                <p style="margin-bottom: 0.5rem; color: ${status === 'ocupado' ? 'var(--color-occupied)' : 'var(--color-reserved)'}; font-weight: bold;">
                    Mesa atualmente ${status}.
                </p>
                <p><strong>Cliente:</strong> ${reservaAtual.nomeCliente}</p>
                <p><strong>Contato:</strong> ${reservaAtual.contatoCliente}</p>
                <p><strong>Pessoas:</strong> ${reservaAtual.quantidadePessoas} / ${mesa.capacidade}</p>
                <p><strong>Horário:</strong> ${dataFomatada}</p>
            </div>
            ${reservaAtual.status === 'reservado' ? 
                `<button class="btn btn-danger" onclick="cancelarReserva('${reservaAtual._id}')">Cancelar Reserva</button>` : 
                `<p style="color: var(--text-muted); font-size: 0.8rem;">A mesa já está ocupada. Apenas finaliza com o tempo.</p>`
            }
        `;
    }

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

async function submitReserva(event, numeroMesa) {
    event.preventDefault();
    
    const dados = {
        nomeCliente: document.getElementById('nomeCliente').value,
        contatoCliente: document.getElementById('contatoCliente').value,
        numeroMesa: numeroMesa,
        quantidadePessoas: Number(document.getElementById('qtdPessoas').value),
        dataHora: document.getElementById('dataHora').value,
        observacoes: document.getElementById('obs').value
    };

    try {
        const res = await fetch(`${API_URL}/reservas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const json = await res.json();

        if (!res.ok) {
            alert(json.error || 'Erro ao criar reserva.');
            return;
        }

        alert('Reserva criada com sucesso!');
        closeModal();
        fetchDados();
    } catch (error) {
        console.error(error);
        alert('Erro ao conectar com o servidor.');
    }
}

async function cancelarReserva(id) {
    if (!confirm('Deseja realmente cancelar esta reserva?')) return;

    try {
        const res = await fetch(`${API_URL}/reservas/${id}`, {
            method: 'DELETE'
        });

        const json = await res.json();

        if (!res.ok) {
            alert(json.error || 'Erro ao cancelar reserva.');
            return;
        }

        alert('Reserva cancelada!');
        closeModal();
        fetchDados();
    } catch (error) {
        console.error(error);
        alert('Erro ao conectar com o servidor.');
    }
}
