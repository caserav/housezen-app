async function initAuth() {
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        currentUser = session.user;
        showApp();
    } else {
        showLogin();
    }

    _supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            showApp();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            showLogin();
        }
    });

    authInitialized = true;
}

async function loginWithGoogle() {
    const { error } = await _supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname
        }
    });

    if (error) {
        showToast('Error al iniciar sesión');
    }
}

async function logout() {
    const { error } = await _supabase.auth.signOut();
    if (!error) {
        showToast('Sesión cerrada');
        currentUser = null;
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('app-content').style.display = 'none';
}

function showApp() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';

    if (currentUser) {
        const displayName = currentUser.user_metadata?.full_name || currentUser.email;
        document.getElementById('sidebar-username').textContent = displayName;

        loadDashboard();
        loadProfile();
    }
}
