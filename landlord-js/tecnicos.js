let editingTecnicoId = null;

async function loadTecnicos() {
    const container = document.getElementById('tecnicos-container');
    container.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <div class="empty-state-text">Cargando técnicos...</div>
        </div>
    `;

    try {
        const { data: tecnicos, error } = await _supabase
            .from('tecnicos')
            .select('*')
            .eq('casero_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!tecnicos || tecnicos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-toolbox"></i>
                    <div class="empty-state-text">Aún no has añadido técnicos</div>
                </div>
            `;
            return;
        }

        renderTecnicos(tecnicos);

    } catch (error) {
        console.error('Error loading tecnicos:', error);
        showToast('Error al cargar los técnicos');
    }
}

function renderTecnicos(tecnicos) {
    const container = document.getElementById('tecnicos-container');

    const html = tecnicos.map(tec => `
        <div class="tecnico-card">
            <div class="tecnico-header">
                <div class="tecnico-name">${tec.nombre}</div>
                <div class="property-actions">
                    <button class="icon-btn" onclick="editTecnico('${tec.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteTecnico('${tec.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            ${tec.especialidad ? `<span class="specialty-badge">${tec.especialidad}</span>` : ''}
            <div class="tecnico-info">
                ${tec.telefono ? `
                    <div class="property-info-row">
                        <i class="fa-solid fa-phone"></i>
                        <span>${tec.telefono}</span>
                    </div>
                ` : ''}
                ${tec.email ? `
                    <div class="property-info-row">
                        <i class="fa-solid fa-envelope"></i>
                        <span>${tec.email}</span>
                    </div>
                ` : ''}
            </div>
            <span class="active-badge ${tec.activo ? 'active' : 'inactive'}">
                ${tec.activo ? 'Disponible' : 'No disponible'}
            </span>
        </div>
    `).join('');

    container.innerHTML = html;
}

function openTecnicoModal(tecnicoId = null) {
    editingTecnicoId = tecnicoId;
    const modal = document.getElementById('tecnico-form-modal');
    const form = document.getElementById('tecnicoForm');

    if (tecnicoId) {
        document.getElementById('tecnico-modal-title').textContent = 'Editar Técnico';
        loadTecnicoData(tecnicoId);
    } else {
        document.getElementById('tecnico-modal-title').textContent = 'Nuevo Técnico';
        form.reset();
        document.getElementById('tecnico-id').value = '';
        document.getElementById('tecnico-active').checked = true;
    }

    modal.classList.add('active');
}

async function loadTecnicoData(tecnicoId) {
    try {
        const { data: tecnico, error } = await _supabase
            .from('tecnicos')
            .select('*')
            .eq('id', tecnicoId)
            .single();

        if (error) throw error;

        document.getElementById('tecnico-id').value = tecnico.id;
        document.getElementById('tecnico-name').value = tecnico.nombre || '';
        document.getElementById('tecnico-specialty').value = tecnico.especialidad || '';
        document.getElementById('tecnico-phone').value = tecnico.telefono || '';
        document.getElementById('tecnico-email').value = tecnico.email || '';
        document.getElementById('tecnico-active').checked = tecnico.activo;

    } catch (error) {
        console.error('Error loading tecnico:', error);
        showToast('Error al cargar el técnico');
    }
}

function closeTecnicoModal() {
    document.getElementById('tecnico-form-modal').classList.remove('active');
    editingTecnicoId = null;
}

async function handleTecnicoSubmit(e) {
    e.preventDefault();

    const tecnicoId = document.getElementById('tecnico-id').value;
    const tecnicoData = {
        casero_id: currentUser.id,
        nombre: document.getElementById('tecnico-name').value,
        especialidad: document.getElementById('tecnico-specialty').value || null,
        telefono: document.getElementById('tecnico-phone').value || null,
        email: document.getElementById('tecnico-email').value || null,
        activo: document.getElementById('tecnico-active').checked
    };

    try {
        if (tecnicoId) {
            const { error } = await _supabase
                .from('tecnicos')
                .update(tecnicoData)
                .eq('id', tecnicoId);

            if (error) throw error;
            showToast('Técnico actualizado correctamente');
        } else {
            const { error } = await _supabase
                .from('tecnicos')
                .insert([tecnicoData]);

            if (error) throw error;
            showToast('Técnico añadido correctamente');
        }

        closeTecnicoModal();
        loadTecnicos();

    } catch (error) {
        console.error('Error saving tecnico:', error);
        showToast('Error al guardar el técnico');
    }
}

async function editTecnico(tecnicoId) {
    openTecnicoModal(tecnicoId);
}

async function deleteTecnico(tecnicoId) {
    if (!confirm('¿Estás seguro de eliminar este técnico?')) {
        return;
    }

    try {
        const { error } = await _supabase
            .from('tecnicos')
            .delete()
            .eq('id', tecnicoId);

        if (error) throw error;

        showToast('Técnico eliminado correctamente');
        loadTecnicos();

    } catch (error) {
        console.error('Error deleting tecnico:', error);
        showToast('Error al eliminar el técnico');
    }
}
