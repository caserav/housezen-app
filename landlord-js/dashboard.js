async function loadDashboard() {
    try {
        const { data: properties } = await _supabase
            .from('propiedades')
            .select('inquilino_email')
            .eq('casero_id', currentUser.id);

        if (!properties || properties.length === 0) {
            document.getElementById('stat-urgent').textContent = '0';
            document.getElementById('stat-pending').textContent = '0';
            document.getElementById('stat-progress').textContent = '0';
            document.getElementById('dashboard-recent-incidents').innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-home"></i>
                    <div class="empty-state-text">Primero añade tus propiedades en "Mis Propiedades"</div>
                </div>
            `;
            return;
        }

        const inquilinoEmails = properties.map(p => p.inquilino_email).filter(e => e);

        if (inquilinoEmails.length === 0) {
            document.getElementById('stat-urgent').textContent = '0';
            document.getElementById('stat-pending').textContent = '0';
            document.getElementById('stat-progress').textContent = '0';
            document.getElementById('dashboard-recent-incidents').innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-users"></i>
                    <div class="empty-state-text">Vincula inquilinos a tus propiedades</div>
                </div>
            `;
            return;
        }

        const { data: incidents } = await _supabase
            .from('incidencias')
            .select('*')
            .in('email_inquilino', inquilinoEmails)
            .order('created_at', { ascending: false });

        if (!incidents) return;

        const urgentes = incidents.filter(i => i.urgencia === 'alta' && i.estado !== 'Solucionado').length;
        const pendientes = incidents.filter(i => i.estado === 'Reportada').length;
        const enProceso = incidents.filter(i =>
            i.estado !== 'Reportada' && i.estado !== 'Solucionado'
        ).length;

        document.getElementById('stat-urgent').textContent = urgentes;
        document.getElementById('stat-pending').textContent = pendientes;
        document.getElementById('stat-progress').textContent = enProceso;

        const recentIncidents = incidents.slice(0, 5);
        renderRecentIncidents(recentIncidents);

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error al cargar el dashboard');
    }
}

function renderRecentIncidents(incidents) {
    const container = document.getElementById('dashboard-recent-incidents');

    if (!incidents || incidents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-clipboard-list"></i>
                <div class="empty-state-text">No hay incidencias recientes</div>
            </div>
        `;
        return;
    }

    const html = incidents.map(inc => `
        <div class="incident-card urgency-${inc.urgencia}" onclick="showIncidentDetail('${inc.id}')">
            <div class="incident-header">
                <div class="incident-title">${inc.titulo}</div>
                <span class="status-badge status-${inc.estado.replace(/ /g, '-')}" data-estado="${inc.estado}">${inc.estado}</span>
            </div>
            <div class="incident-info">
                <div class="incident-info-row">
                    <i class="fa-solid fa-user"></i>
                    <span>${inc.nombre_inquilino || 'Sin nombre'}</span>
                </div>
                <div class="incident-info-row">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${inc.direccion || 'Sin dirección'}</span>
                </div>
            </div>
            <div class="incident-footer">
                <span>${formatDate(inc.created_at)}</span>
                <span class="urgency-badge urgency-${inc.urgencia}">${inc.urgencia.toUpperCase()}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}
