async function login() {
    const returnUrl = "https://caserav.github.io/housezen-app/";

    const { data, error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: returnUrl,
            skipBrowserRedirect: true
        }
    });

    if (error) {
        showToast("Error al iniciar sesión");
        return;
    }

    if (data.url) {
        window.location.href = data.url;
    }
}

async function logout() {
    console.log("Intentando cerrar sesión...");

    const { error } = await _supabase.auth.signOut();

    localStorage.clear();
    sessionStorage.clear();

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
        window.location.href = "https://caserav.github.io/housezen-app/";
    } else {
        console.log("Sesión cerrada con éxito");
        window.location.href = "https://caserav.github.io/housezen-app/";
    }
}

async function initializeAuth() {
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        await handleUserSession(session);
    } else {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('app-content').style.display = 'none';
    }
    authInitialized = true;
}

async function handleUserSession(session) {
    currentUser = session.user;
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';

    const fullName = currentUser.user_metadata?.full_name || "Usuario";
    const firstName = fullName.split(' ')[0];

    document.getElementById('user-name').innerText = firstName;
    document.getElementById('profile-name').value = fullName;
    document.getElementById('profile-email').value = currentUser.email || '';

    const { data: profile } = await _supabase
        .from('perfiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (!profile || !profile.direccion || !profile.telefono) {
        document.getElementById('setup-modal').style.display = 'flex';
    } else {
        document.getElementById('inc-address').value = profile.direccion;
        document.getElementById('inc-phone').value = profile.telefono;
        document.getElementById('user-address').value = profile.direccion;
        document.getElementById('user-phone').value = profile.telefono;
    }
}

window.onbeforeunload = function() {
    _supabase.auth.signOut();
};
