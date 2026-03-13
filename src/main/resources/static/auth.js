const AUTH_USERS_KEY = "expense_tracker_users";
const AUTH_SESSION_KEY = "expense_tracker_session";

function safeParse(rawValue, fallbackValue) {
    if (!rawValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch (_error) {
        return fallbackValue;
    }
}

function readUsers() {
    let raw = null;
    try {
        raw = localStorage.getItem(AUTH_USERS_KEY);
    } catch (_error) {
        return [];
    }

    const users = safeParse(raw, []);
    return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
    try {
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    } catch (_error) {
        alert("Unable to save account on this browser.");
    }
}

function getSession() {
    let raw = null;
    try {
        raw = localStorage.getItem(AUTH_SESSION_KEY);
    } catch (_error) {
        return null;
    }

    const session = safeParse(raw, null);
    if (!session || typeof session !== "object") {
        return null;
    }

    if (!session.email || !session.name) {
        return null;
    }

    return session;
}

function saveSession(session) {
    try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch (_error) {
        alert("Unable to start session. Please allow browser storage.");
    }
}

function clearSession() {
    try {
        localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (_error) {
        // Ignore storage cleanup errors
    }
}

function isAuthPage() {
    return window.location.pathname.endsWith("/login.html") || window.location.pathname.endsWith("/signup.html");
}

function requireAuth() {
    if (isAuthPage()) {
        return;
    }

    const session = getSession();
    if (!session) {
        clearSession();
        window.location.href = "login.html";
    }
}

function bindProfileName() {
    const profileName = document.getElementById("profileName");
    if (!profileName) {
        return;
    }

    const session = getSession();
    profileName.textContent = session?.name || "User";
}

function handleSignup() {
    const signupForm = document.getElementById("signupForm");
    if (!signupForm) {
        return;
    }

    signupForm.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;

        const users = readUsers();
        const alreadyExists = users.some(user => user.email === email);
        if (alreadyExists) {
            alert("Account already exists with this email.");
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);
        saveSession({ name, email });

        window.location.href = "dashboard.html";
    });
}

function handleLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", event => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        const users = readUsers();
        const user = users.find(item => item.email === email && item.password === password);

        if (!user) {
            alert("Invalid email or password.");
            return;
        }

        saveSession({ name: user.name, email: user.email });
        window.location.href = "dashboard.html";
    });
}

function redirectIfLoggedIn() {
    if (!isAuthPage()) {
        return;
    }

    const session = getSession();
    if (session) {
        window.location.href = "dashboard.html";
    } else {
        clearSession();
    }
}

function doLogout() {
    clearSession();
    window.location.href = "login.html";
}

window.doLogout = doLogout;

document.addEventListener("DOMContentLoaded", () => {
    redirectIfLoggedIn();
    requireAuth();
    bindProfileName();
    handleSignup();
    handleLogin();
});
