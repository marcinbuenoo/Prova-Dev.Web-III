const API_URL = 'http://localhost:3000';

let mesasData = [];
let reservasData = [];
let autoRefreshInterval = null;

// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer') || initToastContainer();
    const toastEl = createToastElement(message, type);

    toastContainer.appendChild(toastEl);

    if (duration > 0) {
        setTimeout(() => {
            toastEl.classList.add('leaving');
            setTimeout(() => removeToast(toastEl), 300);
        }, duration);
    }
}

function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    toast.innerHTML = `<span style="font-weight: bold; font-size: 1.1em;">${icon}</span><div class="toast-message">${message}</div>`;

    return toast;
}

function removeToast(toastEl) {
    if (toastEl && toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
    }
}

function initToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

// Form Validation
function validateReservaForm() {
    clearFieldErrors();
    const errors = {};

    const nomeCliente = document.getElementById('nomeCliente')?.value.trim();
    const contatoCliente = document.getElementById('contatoCliente')?.value.trim();
    const qtdPessoas = parseInt(document.getElementById('qtdPessoas')?.value || 0);
    const dataHora = document.getElementById('dataHora')?.value;

    if (!nomeCliente || nomeCliente.length < 3) {
        errors.nomeCliente = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!contatoCliente) {
        errors.contatoCliente = 'Contato é obrigatório';
    }

    if (!qtdPessoas || qtdPessoas < 1) {
        errors.qtdPessoas = 'Quantidade deve ser no mínimo 1 pessoa';
    }

    if (!dataHora) {
        errors.dataHora = 'Data e hora são obrigatórias';
    } else {
        const selectedDate = new Date(dataHora);
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        if (selectedDate < oneHourLater) {
            errors.dataHora = 'Reserva deve ser no mínimo 1 hora no futuro';
        }
    }

    Object.keys(errors).forEach(fieldId => {
        showFieldError(fieldId, errors[fieldId]);
    });

    return Object.keys(errors).length === 0;
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const formGroup = field.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('has-error');
            const errorEl = formGroup.querySelector('.form-error');
            if (errorEl) {
                errorEl.textContent = message;
            }
        }
    }
}

function clearFieldErrors() {
    document.querySelectorAll('.form-group.has-error').forEach(group => {
        group.classList.remove('has-error');
    });
}

// Auto-refresh mechanism
function startAutoRefresh(interval = 30000) {
    if (autoRefreshInterval) return;
    autoRefreshInterval = setInterval(() => {
        fetchDados();
    }, interval);
}

function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// Elementos DOM
const mapContainer = document.getElementById('restaurantMap');
const reservasList = document.getElementById('reservasList');
const modal = document.getElementById('mesaModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const searchFilter = document.getElementById('searchFilter');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initToastContainer();
    fetchDados();
    startAutoRefresh(30000);

    // Setup search filter
    if (searchFilter) {
        let debounceTimer;
        searchFilter.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                filterAndRenderReservas(e.target.value);
            }, 300);
        });
    }
});

// Filter and render reservations
function filterAndRenderReservas(query) {
    const filteredReservas = query.trim() === ''
        ? reservasData
        : reservasData.filter(r => r.nomeCliente.toLowerCase().includes(query.toLowerCase()));

    renderReservasListFiltered(filteredReservas);
}

async function fetchDados() {
    try {
        await fetch(`${API_URL}/reservas/sync`, { method: 'POST' }).catch(e => console.log('Erro ao sincronizar:', e));

        const [mesasRes, reservasRes] = await Promise.all([
            fetch(`${API_URL}/mesas`),
            fetch(`${API_URL}/reservas`)
        ]);

        if (!mesasRes.ok || !reservasRes.ok) {
            throw new Error('Erro ao buscar dados do servidor');
        }

        mesasData = await mesasRes.json();
        reservasData = await reservasRes.json();

        renderMap();
        renderReservasList();
    } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
        showToast("Erro ao conectar com o servidor. Verifique se o backend está rodando na porta 3000.", 'error', 4000);
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
        reservasList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 16px;">Sem reservas no momento.</p>';
        return;
    }

    renderReservasListFiltered(reservasData);
}

function renderReservasListFiltered(reservas) {
    reservasList.innerHTML = '';

    if (reservas.length === 0) {
        reservasList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 16px;">Nenhuma reserva encontrada.</p>';
        return;
    }

    reservas.forEach(reserva => {
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
            <div class="reserva-card-actions">
                <button class="btn btn-primary" onclick="openEditModal('${reserva._id}')">✏️ Editar</button>
                ${reserva.status === 'reservado' ? `<button class="btn btn-danger" onclick="cancelarReserva('${reserva._id}')">🗑️ Cancelar</button>` : ''}
            </div>
        `;
        reservasList.appendChild(reservaEl);
    });
}

function openModal(mesa, status) {
    modalTitle.textContent = `Mesa ${mesa.numero}`;

    if (status === 'disponivel') {
        modalBody.innerHTML = `
            <p style="margin-bottom: 1rem; color: var(--status-disponivel-text);">Mesa disponível para reserva.</p>
            <form id="reservaForm" onsubmit="submitReserva(event, ${mesa.numero})">
                <div class="form-group">
                    <label for="nomeCliente">Nome do Cliente</label>
                    <input type="text" id="nomeCliente" class="form-control" placeholder="Ex: João Silva" required>
                    <span class="form-error" id="nomeClienteError"></span>
                </div>
                <div class="form-group">
                    <label for="contatoCliente">Contato</label>
                    <input type="text" id="contatoCliente" class="form-control" placeholder="Ex: (11) 99999-9999" required>
                    <span class="form-error" id="contatoClienteError"></span>
                </div>
                <div class="form-group">
                    <label for="qtdPessoas">Quantidade de Pessoas</label>
                    <input type="number" id="qtdPessoas" class="form-control" min="1" max="${mesa.capacidade}" placeholder="1" required>
                    <span class="form-error" id="qtdPessoasError"></span>
                </div>
                <div class="form-group">
                    <label for="dataHora">Data e Hora da Reserva</label>
                    <input type="datetime-local" id="dataHora" class="form-control" required>
                    <span class="form-error" id="dataHoraError"></span>
                </div>
                <div class="form-group">
                    <label for="obs">Observações</label>
                    <input type="text" id="obs" class="form-control" placeholder="Opcional">
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%;">Confirmar Reserva</button>
            </form>
        `;
    } else {
        const reservasMesa = reservasData.filter(r => r.numeroMesa === mesa.numero && (r.status === 'reservado' || r.status === 'ocupado'));
        const reservaAtual = reservasMesa[0];

        const dataFomatada = new Date(reservaAtual.dataHora).toLocaleString('pt-BR');

        modalBody.innerHTML = `
            <div class="reserva-details" style="margin-bottom: 1.5rem; font-size: 1rem;">
                <p style="margin-bottom: 0.5rem; color: ${status === 'ocupado' ? 'var(--status-ocupado-text)' : 'var(--status-reservado-text)'}; font-weight: bold;">
                    Mesa atualmente ${status}.
                </p>
                <p><strong>Cliente:</strong> ${reservaAtual.nomeCliente}</p>
                <p><strong>Contato:</strong> ${reservaAtual.contatoCliente}</p>
                <p><strong>Pessoas:</strong> ${reservaAtual.quantidadePessoas} / ${mesa.capacidade}</p>
                <p><strong>Horário:</strong> ${dataFomatada}</p>
            </div>
            ${reservaAtual.status === 'reservado' ?
                `<button class="btn btn-danger" onclick="cancelarReserva('${reservaAtual._id}')" style="width: 100%;">Cancelar Reserva</button>` :
                `<p style="color: var(--text-muted); font-size: 0.9rem; text-align: center;">A mesa já está ocupada. Aguarde o término do horário.</p>`
            }
        `;
    }

    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
}

function openEditModal(reservaId) {
    const reserva = reservasData.find(r => r._id === reservaId);
    if (!reserva) return;

    const mesa = mesasData.find(m => m.numero === reserva.numeroMesa);

    modalTitle.textContent = `Editar Reserva - Mesa ${reserva.numeroMesa}`;

    const dataHoraLocal = new Date(reserva.dataHora).toISOString().slice(0, 16);

    modalBody.innerHTML = `
        <p style="margin-bottom: 1rem; color: var(--info-color);">Atualize os dados da reserva.</p>
        <form id="editReservaForm" onsubmit="submitEditReserva(event, '${reservaId}')">
            <div class="form-group">
                <label for="editNomeCliente">Nome do Cliente</label>
                <input type="text" id="editNomeCliente" class="form-control" placeholder="Ex: João Silva" value="${reserva.nomeCliente}" required>
                <span class="form-error" id="editNomeClienteError"></span>
            </div>
            <div class="form-group">
                <label for="editContatoCliente">Contato</label>
                <input type="text" id="editContatoCliente" class="form-control" placeholder="Ex: (11) 99999-9999" value="${reserva.contatoCliente}" required>
                <span class="form-error" id="editContatoClienteError"></span>
            </div>
            <div class="form-group">
                <label for="editQtdPessoas">Quantidade de Pessoas</label>
                <input type="number" id="editQtdPessoas" class="form-control" min="1" max="${mesa?.capacidade || 10}" value="${reserva.quantidadePessoas}" required>
                <span class="form-error" id="editQtdPessoasError"></span>
            </div>
            <div class="form-group">
                <label for="editDataHora">Data e Hora da Reserva</label>
                <input type="datetime-local" id="editDataHora" class="form-control" value="${dataHoraLocal}" required>
                <span class="form-error" id="editDataHoraError"></span>
            </div>
            <div class="form-group">
                <label for="editObs">Observações</label>
                <input type="text" id="editObs" class="form-control" placeholder="Opcional" value="${reserva.observacoes || ''}">
            </div>
            <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">💾 Salvar Alterações</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()" style="flex: 1;">Cancelar</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

async function submitReserva(event, numeroMesa) {
    event.preventDefault();

    if (!validateReservaForm()) {
        return;
    }

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
            showToast(json.error || 'Erro ao criar reserva.', 'error', 3000);
            return;
        }

        showToast('Reserva criada com sucesso!', 'success', 3000);
        closeModal();
        fetchDados();
    } catch (error) {
        console.error(error);
        showToast('Erro ao conectar com o servidor.', 'error', 3000);
    }
}

async function submitEditReserva(event, reservaId) {
    event.preventDefault();

    // Validate edit form
    clearFieldErrors();
    const errors = {};

    const nomeCliente = document.getElementById('editNomeCliente')?.value.trim();
    const contatoCliente = document.getElementById('editContatoCliente')?.value.trim();
    const qtdPessoas = parseInt(document.getElementById('editQtdPessoas')?.value || 0);
    const dataHora = document.getElementById('editDataHora')?.value;

    if (!nomeCliente || nomeCliente.length < 3) {
        errors.editNomeCliente = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!contatoCliente) {
        errors.editContatoCliente = 'Contato é obrigatório';
    }

    if (!qtdPessoas || qtdPessoas < 1) {
        errors.editQtdPessoas = 'Quantidade deve ser no mínimo 1 pessoa';
    }

    if (!dataHora) {
        errors.editDataHora = 'Data e hora são obrigatórias';
    }

    if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach(fieldId => {
            showFieldError(fieldId, errors[fieldId]);
        });
        return;
    }

    const dados = {
        nomeCliente: nomeCliente,
        contatoCliente: contatoCliente,
        quantidadePessoas: qtdPessoas,
        dataHora: dataHora,
        observacoes: document.getElementById('editObs')?.value || ''
    };

    try {
        const res = await fetch(`${API_URL}/reservas/${reservaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const json = await res.json();

        if (!res.ok) {
            showToast(json.error || 'Erro ao atualizar reserva.', 'error', 3000);
            return;
        }

        showToast('Reserva atualizada com sucesso!', 'success', 3000);
        closeModal();
        fetchDados();
    } catch (error) {
        console.error(error);
        showToast('Erro ao conectar com o servidor.', 'error', 3000);
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
            showToast(json.error || 'Erro ao cancelar reserva.', 'error', 3000);
            return;
        }

        showToast('Reserva cancelada!', 'success', 3000);
        closeModal();
        fetchDados();
    } catch (error) {
        console.error(error);
        showToast('Erro ao conectar com o servidor.', 'error', 3000);
    }
}
