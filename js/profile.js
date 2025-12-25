async function saveUserData() {
    const address = document.getElementById('user-address').value.trim();
    const phone = document.getElementById('user-phone').value.trim();

    if (!address || !phone) {
        showToast("Faltan datos");
        return;
    }

    const btn = document.getElementById('btnSave');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    const { error } = await _supabase
        .from('perfiles')
        .upsert({
            id: currentUser.id,
            direccion: address,
            telefono: phone
        });

    if (error) {
        showToast("Error al guardar");
        btn.disabled = false;
        btn.innerHTML = 'Guardar Cambios';
    } else {
        document.getElementById('inc-address').value = address;
        document.getElementById('inc-phone').value = phone;

        btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Guardado correctamente';
        btn.classList.add('success');

        document.getElementById('setup-modal').style.display = 'none';

        setTimeout(() => {
            btn.classList.remove('success');
            btn.innerHTML = 'Guardar Cambios';
            btn.disabled = false;
            showPage('home');
        }, 1500);
    }
}
