// ============================================================
// DISTRIBUIDOR.JS — Acceso de distribuidores (correo y contraseña de Firebase).
// El administrador crea la cuenta en Firebase y la autoriza en
// admin-distribuidores.html. Solo un distribuidor autorizado puede leer la
// colección privada "preciosDistribuidor" (lo exigen las reglas de Firestore);
// para el resto de los visitantes ese precio simplemente no existe.
//
// window.VJDistribuidor = { activo, correo, nombre, precios{id:precio}, listo, abrir(), salir() }
// ============================================================
(function () {
    const API = { activo: false, correo: '', nombre: '', precios: {}, listo: null, abrir: () => {}, salir: () => {} };
    window.VJDistribuidor = API;

    let resolverListo;
    API.listo = new Promise(r => { resolverListo = r; });
    let version = 0;

    const authOk = () => typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && typeof firebase.auth === 'function';
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // Carga el estado del usuario actual: ¿está autorizado como distribuidor? ¿qué precios tiene?
    async function cargarEstado(user) {
        const mia = ++version;
        let activo = false, correo = '', nombre = '', precios = {};
        if (user && user.email) {
            correo = user.email.toLowerCase();
            try {
                const dbx = firebase.firestore();
                const d = await dbx.collection('distribuidores').doc(correo).get();
                if (d.exists) {
                    activo = true;
                    nombre = (d.data() && d.data().nombre) || correo;
                    const snap = await dbx.collection('preciosDistribuidor').get();
                    snap.forEach(x => { const v = Number(x.data().precio); if (v > 0) precios[x.id] = v; });
                }
            } catch (e) {
                console.warn('No se pudo verificar el acceso de distribuidor:', e);
                activo = false; precios = {};
            }
        }
        if (mia !== version) return; // llegó un cambio más reciente
        API.activo = activo; API.correo = activo ? correo : ''; API.nombre = nombre; API.precios = precios;
        pintarPastilla();
        window.dispatchEvent(new Event('vj-distribuidor'));
    }

    // ---------------- Interfaz ----------------
    const css = `
    #vjd-fondo{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10001;display:none;align-items:center;justify-content:center;padding:16px;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
    #vjd-fondo.on{display:flex}
    #vjd-caja{background:#fff;border-radius:18px;max-width:380px;width:100%;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.3);color:#1f2937}
    #vjd-caja h2{margin:0 0 4px;font-size:20px;font-weight:800;color:#154212}
    #vjd-caja p.s{margin:0 0 16px;font-size:13px;color:#6b7280}
    #vjd-caja input{display:block;width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:10px;padding:11px 12px;font-size:15px;margin-bottom:10px}
    #vjd-caja .b{width:100%;border:0;background:#154212;color:#fff;font-weight:800;font-size:15px;padding:12px;border-radius:12px;cursor:pointer}
    #vjd-caja .b:disabled{opacity:.6;cursor:default}
    #vjd-caja .l{background:none;border:0;color:#154212;text-decoration:underline;font-size:13px;cursor:pointer;padding:6px 0}
    #vjd-msg{font-size:13px;margin:8px 0;min-height:18px}
    #vjd-pill{position:fixed;left:14px;bottom:14px;z-index:9997;background:#fff;border:1px solid #d1d5db;border-radius:999px;padding:8px 14px;font:700 12px 'Plus Jakarta Sans',system-ui,sans-serif;color:#154212;box-shadow:0 4px 14px rgba(0,0,0,.15);cursor:pointer;display:none;max-width:70vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #vjd-pill.on{display:block}`;

    let fondo, msg, pill;

    function montar() {
        if (document.getElementById('vjd-fondo')) return;
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
        fondo = document.createElement('div'); fondo.id = 'vjd-fondo';
        fondo.innerHTML = `<div id="vjd-caja" role="dialog" aria-modal="true" aria-label="Acceso de distribuidores">
            <h2>Acceso de distribuidores</h2>
            <p class="s">Entra con el correo y la contraseña que te dio VJ.Lab para ver tus precios.</p>
            <input id="vjd-correo" type="email" placeholder="Correo" autocomplete="username">
            <input id="vjd-clave" type="password" placeholder="Contraseña" autocomplete="current-password">
            <div id="vjd-msg"></div>
            <button type="button" class="b" id="vjd-entrar">Entrar</button>
            <div style="display:flex;justify-content:space-between;margin-top:6px">
                <button type="button" class="l" id="vjd-olvide">Olvidé mi contraseña</button>
                <button type="button" class="l" id="vjd-cerrar">Cancelar</button>
            </div></div>`;
        pill = document.createElement('div'); pill.id = 'vjd-pill'; pill.title = 'Cerrar sesión de distribuidor';
        document.body.append(fondo, pill);
        msg = fondo.querySelector('#vjd-msg');

        fondo.addEventListener('click', e => { if (e.target === fondo) cerrar(); });
        fondo.querySelector('#vjd-cerrar').addEventListener('click', cerrar);
        fondo.querySelector('#vjd-entrar').addEventListener('click', entrar);
        fondo.querySelector('#vjd-olvide').addEventListener('click', olvide);
        fondo.querySelector('#vjd-clave').addEventListener('keydown', e => { if (e.key === 'Enter') entrar(); });
        pill.addEventListener('click', () => { if (confirm('¿Cerrar la sesión de distribuidor?')) API.salir(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
        pintarPastilla();
    }

    function pintarPastilla() {
        if (!pill) return;
        if (API.activo) { pill.textContent = '✓ Distribuidor: ' + API.nombre + ' · Salir'; pill.classList.add('on'); }
        else pill.classList.remove('on');
    }

    function aviso(t, ok) { msg.style.color = ok ? '#065f46' : '#b3261e'; msg.textContent = t; }
    function abrir() { if (!fondo) montar(); aviso('', true); fondo.classList.add('on'); setTimeout(() => document.getElementById('vjd-correo').focus(), 50); }
    function cerrar() { if (fondo) fondo.classList.remove('on'); }

    function textoError(e) {
        const c = (e && e.code) || '';
        if (c === 'auth/invalid-email') return 'El correo no es válido.';
        if (c === 'auth/user-not-found' || c === 'auth/wrong-password' || c === 'auth/invalid-credential' || c === 'auth/invalid-login-credentials') return 'Correo o contraseña incorrectos.';
        if (c === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
        if (c === 'auth/network-request-failed') return 'Sin conexión. Revisa tu internet.';
        if (c === 'auth/user-disabled') return 'Esta cuenta está desactivada. Comunícate con VJ.Lab.';
        return 'No se pudo entrar. ' + (c || (e && e.message) || '');
    }

    async function entrar() {
        const correo = document.getElementById('vjd-correo').value.trim();
        const clave = document.getElementById('vjd-clave').value;
        if (!correo || !clave) { aviso('Escribe tu correo y contraseña.'); return; }
        if (!authOk()) { aviso('No cargó el sistema de acceso. Recarga la página.'); return; }
        const btn = document.getElementById('vjd-entrar');
        btn.disabled = true; aviso('Entrando…', true);
        try {
            const cred = await firebase.auth().signInWithEmailAndPassword(correo, clave);
            await cargarEstado(cred.user);
            if (!API.activo) {
                await firebase.auth().signOut();
                aviso('Esta cuenta no tiene acceso de distribuidor. Comunícate al 8113160143.');
                btn.disabled = false;
                return;
            }
            location.reload();
        } catch (e) {
            aviso(textoError(e)); btn.disabled = false;
        }
    }

    async function olvide() {
        const correo = document.getElementById('vjd-correo').value.trim();
        if (!correo) { aviso('Escribe tu correo arriba y vuelve a presionar.'); return; }
        try { await firebase.auth().sendPasswordResetEmail(correo); aviso('Si el correo está registrado, te enviamos un enlace para cambiar la contraseña.', true); }
        catch (e) { aviso(textoError(e)); }
    }

    API.abrir = abrir;
    API.salir = async () => { try { await firebase.auth().signOut(); } catch (e) {} location.reload(); };

    document.addEventListener('click', e => {
        const b = e.target.closest('[data-distribuidor]');
        if (b) { e.preventDefault(); abrir(); }
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
    else montar();

    // ---------------- Arranque ----------------
    if (!authOk()) { console.warn('Distribuidor: Firebase Auth no está disponible en esta página.'); resolverListo(); return; }
    let primera = true;
    const respaldo = setTimeout(() => { if (primera) { primera = false; resolverListo(); } }, 6000);
    firebase.auth().onAuthStateChanged(async user => {
        await cargarEstado(user);
        if (primera) { primera = false; clearTimeout(respaldo); resolverListo(); }
    });
})();
