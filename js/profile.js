async function saveUserData() {
    const reference = document.getElementById('user-reference').value.trim().toUpperCase(); // Nuevo campo ID
    const phone = document.getElementById('user-phone').value.trim();

    if (!reference || !phone) {
        showToast("Faltan datos");
        return;
    }

    const btn = document.getElementById('btnSave');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Validando...';

    try {
        // 1. Validar si la referencia existe en la tabla del casero
        const { data: propiedad, error: propError } = await _supabase
            .from('propiedades')
            .select('direccion_completa')
            .eq('referencia', reference)
            .maybeSingle();

        if (propError || !propiedad) {
            showToast("Código de vivienda no válido");
            btn.disabled = false;
            btn.innerHTML = 'Guardar Cambios';
            return;
        }

        // 2. Si existe, procedemos a guardar en el perfil del inquilino
        const { error: perfilError } = await _supabase
            .from('perfiles')
            .upsert({
                id: currentUser.id,
                codigo_referencia: reference, // Guardamos la llave
                direccion: propiedad.direccion_completa, // Guardamos la dirección real del casero
                telefono: phone
            });

        if (perfilError) throw perfilError;

        // 3. Actualizar la interfaz con los datos heredados
        document.getElementById('user-address').value = propiedad.direccion_completa;
        if (document.getElementById('inc-address')) {
             document.getElementById('inc-address').value = propiedad.direccion_completa;
        }
        if (document.getElementById('inc-phone')) {
             document.getElementById('inc-phone').value = phone;
        }

        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Vinculado con éxito';
        btn.classList.add('success');

        // Cerramos el modal de configuración inicial si existe
        if (document.getElementById('setup-modal')) {
            document.getElementById('setup-modal').style.display = 'none';
        }

        setTimeout(() => {
            btn.classList.remove('success');
            btn.innerHTML = 'Guardar Cambios';
            btn.disabled = false;
            showPage('home');
        }, 1500);

    } catch (error) {
        console.error("Error completo:", error);
        showToast("Error al guardar perfil");
        btn.disabled = false;
        btn.innerHTML = 'Guardar Cambios';
    }
}
