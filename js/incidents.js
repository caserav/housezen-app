let selectedUrgency = null;
let lastRadioChecked = null;
let isSubmitting = false;

function handleRadioClick(radio) {
    if (lastRadioChecked === radio) {
        radio.checked = false;
        lastRadioChecked = null;
    } else {
        lastRadioChecked = radio;
    }
}

function setupPriorityButtons() {
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.onclick = function() {
            const level = this.dataset.level;
            selectedUrgency = (selectedUrgency === level) ? null : level;
            document.querySelectorAll('.priority-btn').forEach(b => b.className = 'priority-btn');

            const urgencyInput = document.getElementById('urgency-input');
            if (selectedUrgency) {
                this.classList.add('selected', `urgency-${level}`);
                urgencyInput.value = selectedUrgency;
            } else {
                urgencyInput.value = '';
            }
        };
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    const category = e.target.querySelector('input[name="category"]:checked');
    const urgency = document.getElementById('urgency-input').value;
    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim();

    if (!category || !urgency || !title || !description) {
        alert('Completa todos los campos: Categoría, Urgencia, Título y Descripción');
        showToast('Completa todos los campos');
        return;
    }

    isSubmitting = true;
    const btn = document.getElementById('btnSubmit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    const { error } = await _supabase.from('incidencias').insert([{
        titulo: title,
        descripcion: e.target.description.value.trim(),
        categoria: category.value,
        urgencia: selectedUrgency,
        direccion: document.getElementById('inc-address').value,
        telefono: document.getElementById('inc-phone').value,
        user_id: currentUser.id,
        nombre_inquilino: currentUser.user_metadata.full_name,
        email_inquilino: currentUser.email
    }]);

    if (error) {
        showToast('Error al enviar');
        btn.disabled = false;
        btn.innerHTML = 'Enviar a Housezen <i class="fa-solid fa-paper-plane"></i>';
        isSubmitting = false;
    } else {
        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Enviado correctamente';
        btn.classList.add('success');

        setTimeout(() => {
            e.target.reset();
            selectedUrgency = null;
            lastRadioChecked = null;
            document.querySelectorAll('.priority-btn').forEach(b => b.className = 'priority-btn');
            document.getElementById('urgency-input').value = '';
            btn.className = 'submit-btn';
            btn.innerHTML = 'Enviar a Housezen <i class="fa-solid fa-paper-plane"></i>';
            btn.disabled = false;
            isSubmitting = false;
            showPage('incidencias');
        }, 1500);
    }
}

async function renderIncidents() {
    const container = document.getElementById('incidents-list-container');

    const localData = localStorage.getItem('cache_incidencias');
    if (localData) {
        const incidents = JSON.parse(localData);
        dibujarIncidencias(incidents, true);
    } else {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <div class="empty-state-text">Cargando reportes...</div>
            </div>
        `;
    }

    try {
        if (!currentUser) {
            const { data: { session } } = await _supabase.auth.getSession();
            if (session) currentUser = session.user;
            else return;
        }

        const { data, error } = await _supabase
            .from('incidencias')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        localStorage.setItem('cache_incidencias', JSON.stringify(data));
        dibujarIncidencias(data, false);

    } catch (err) {
        console.error("Error de red:", err);
        if (!localData) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-wifi-slash"></i>
                    <div class="empty-state-text">No se pudieron cargar los reportes</div>
                    <button class="submit-btn" style="margin-top: 20px; max-width: 250px;" onclick="renderIncidents()">
                        <i class="fa-solid fa-rotate"></i> Reintentar
                    </button>
                </div>
            `;
        }
    }
}

function dibujarIncidencias(data, isOffline) {
    const container = document.getElementById('incidents-list-container');

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-list"></i>
                <div class="empty-state-text">Aún no has reportado incidencias</div>
            </div>
        `;
        return;
    }

    let html = '';

    if (isOffline) {
        html += `
            <div class="offline-banner">
                <i class="fa-solid fa-clock-rotate-left"></i>
                Mostrando datos guardados.
                <span class="refresh-link" onclick="renderIncidents()">Refrescar para ver nuevos</span>
            </div>
        `;
    }

    html += data.map(inc => `
        <div class="incident-item">
            <div class="incident-header">
                <div class="incident-title">${inc.titulo}</div>
                <span class="status-badge status-${inc.estado || 'Enviada'}">${inc.estado || 'Enviada'}</span>
            </div>
            <p class="incident-description">${inc.descripcion || 'Sin descripción'}</p>
            <div class="incident-footer">
                <span>${new Date(inc.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span class="incident-category">#${inc.categoria.toUpperCase()}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}
