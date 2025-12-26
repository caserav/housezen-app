async function loadProfile() {
    try {
        const { data: casero, error } = await _supabase
            .from('caseros')
            .select('*')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (casero) {
            document.getElementById('perfil-nombre').value = casero.nombre_completo || '';
            document.getElementById('perfil-dni').value = casero.dni_cif || '';
            document.getElementById('perfil-telefono').value = casero.telefono_principal || '';
            document.getElementById('perfil-emergencia').value = casero.telefono_emergencia || '';
            document.getElementById('perfil-direccion').value = casero.direccion || '';
        }

        document.getElementById('perfil-email').value = currentUser.email || '';

    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error al cargar el perfil');
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('btnSavePerfil');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    const profileData = {
        id: currentUser.id,
        nombre_completo: document.getElementById('perfil-nombre').value,
        dni_cif: document.getElementById('perfil-dni').value || null,
        email: currentUser.email,
        telefono_principal: document.getElementById('perfil-telefono').value || null,
        telefono_emergencia: document.getElementById('perfil-emergencia').value || null,
        direccion: document.getElementById('perfil-direccion').value || null
    };

    try {
        const { data: existing } = await _supabase
            .from('caseros')
            .select('id')
            .eq('id', currentUser.id)
            .maybeSingle();

        if (existing) {
            const { error } = await _supabase
                .from('caseros')
                .update(profileData)
                .eq('id', currentUser.id);

            if (error) throw error;
        } else {
            const { error } = await _supabase
                .from('caseros')
                .insert([profileData]);

            if (error) throw error;
        }

        showToast('Perfil guardado correctamente');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Guardado';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar Perfil';
        }, 2000);

    } catch (error) {
        console.error('Error saving profile:', error);
        showToast('Error al guardar el perfil');
        btn.innerHTML = '<i class="fa-solid fa-save"></i> Guardar Perfil';
    } finally {
        btn.disabled = false;
    }
}
