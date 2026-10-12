/* Inicio de sesión del panel de administración (Firebase Authentication).
   Solo la cuenta ADMIN_EMAIL puede entrar. La protección real de los datos
   la dan las reglas de Firestore (ver firestore.rules). */
(function () {
  var ADMIN_EMAIL = 'viejitojohn@gmail.com';
  var resolveReady;
  window.vjAuthReady = new Promise(function (r) { resolveReady = r; });

  var overlay, msg, emailInput, passInput, btn;

  function el(tag, css, html) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html) e.innerHTML = html;
    return e;
  }

  function buildOverlay() {
    overlay = el('div',
      'position:fixed;inset:0;z-index:2147483647;background:#f4f6f4;display:flex;' +
      'align-items:center;justify-content:center;font-family:system-ui,sans-serif;padding:16px;');
    var card = el('div',
      'background:#fff;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.12);' +
      'padding:28px;width:100%;max-width:360px;');
    card.appendChild(el('h1', 'margin:0 0 4px;font-size:20px;color:#1b4d2e;font-weight:800;', 'Viejito John'));
    card.appendChild(el('p', 'margin:0 0 18px;font-size:13px;color:#666;', 'Panel de administración'));

    emailInput = el('input',
      'width:100%;box-sizing:border-box;padding:10px 12px;margin-bottom:10px;border:1px solid #ccc;border-radius:8px;font-size:15px;');
    emailInput.type = 'email'; emailInput.placeholder = 'Correo'; emailInput.value = ADMIN_EMAIL;
    emailInput.autocomplete = 'username';
    passInput = el('input',
      'width:100%;box-sizing:border-box;padding:10px 12px;margin-bottom:10px;border:1px solid #ccc;border-radius:8px;font-size:15px;');
    passInput.type = 'password'; passInput.placeholder = 'Contraseña';
    passInput.autocomplete = 'current-password';

    btn = el('button',
      'width:100%;padding:11px;border:0;border-radius:8px;background:#1b4d2e;color:#fff;font-weight:700;font-size:15px;cursor:pointer;',
      'Entrar');
    msg = el('p', 'min-height:18px;margin:10px 0 0;font-size:13px;color:#b3261e;');
    var forgot = el('a', 'display:inline-block;margin-top:6px;font-size:12px;color:#1b4d2e;cursor:pointer;text-decoration:underline;',
      '¿Olvidaste tu contraseña?');

    card.appendChild(emailInput); card.appendChild(passInput);
    card.appendChild(btn); card.appendChild(msg); card.appendChild(forgot);
    overlay.appendChild(card);
    // Se agrega a <html> (no a <body>) porque el body usa x-cloak y está oculto hasta que Alpine inicia.
    document.documentElement.appendChild(overlay);

    btn.addEventListener('click', doLogin);
    passInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(); });
    forgot.addEventListener('click', doReset);
  }

  function errText(e) {
    var c = (e && e.code) || '';
    if (c === 'auth/invalid-credential' || c === 'auth/wrong-password' || c === 'auth/user-not-found' || c === 'auth/invalid-login-credentials')
      return 'Correo o contraseña incorrectos.';
    if (c === 'auth/too-many-requests') return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    if (c === 'auth/network-request-failed') return 'Sin conexión. Revisa tu internet.';
    if (c === 'auth/operation-not-allowed') return 'El acceso con correo y contraseña no está activado en Firebase.';
    return 'No se pudo iniciar sesión.';
  }

  function doLogin() {
    msg.style.color = '#b3261e'; msg.textContent = '';
    var email = emailInput.value.trim(), pass = passInput.value;
    if (!email || !pass) { msg.textContent = 'Escribe tu correo y contraseña.'; return; }
    btn.disabled = true; btn.textContent = 'Entrando...';
    firebase.auth().signInWithEmailAndPassword(email, pass)
      .catch(function (e) { msg.textContent = errText(e); })
      .then(function () { btn.disabled = false; btn.textContent = 'Entrar'; });
  }

  function doReset() {
    var email = emailInput.value.trim();
    if (!email) { msg.textContent = 'Escribe tu correo arriba primero.'; return; }
    firebase.auth().sendPasswordResetEmail(email).then(function () {
      msg.style.color = '#1b4d2e';
      msg.textContent = 'Si el correo existe, te enviamos un enlace para cambiar la contraseña.';
    }).catch(function (e) { msg.style.color = '#b3261e'; msg.textContent = errText(e); });
  }

  function addLogout() {
    if (document.getElementById('vj-logout')) return;
    var b = el('button',
      'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 10px;border:0;border-radius:8px;' +
      'background:rgba(0,0,0,.65);color:#fff;font-size:12px;cursor:pointer;', 'Cerrar sesión');
    b.id = 'vj-logout';
    b.addEventListener('click', function () { firebase.auth().signOut().then(function () { location.reload(); }); });
    document.documentElement.appendChild(b);
  }

  // Devuelve null si todo está listo, o un texto que explica qué falta.
  function diagnose() {
    if (typeof firebase === 'undefined')
      return 'No cargó Firebase. Revisa tu internet o desactiva bloqueadores de anuncios. (F1)';
    if (!firebase.auth)
      return 'No cargó el módulo de acceso de Firebase. Recarga con Ctrl+F5. (F2)';
    if (!firebase.apps || !firebase.apps.length) {
      try {
        if (typeof firebaseConfig !== 'undefined') firebase.initializeApp(firebaseConfig);
      } catch (e) {
        return 'Firebase no se pudo iniciar: ' + ((e && e.message) || e) + ' (F3)';
      }
      if (!firebase.apps || !firebase.apps.length)
        return 'Firebase no se inicializó (revisa firebase-config.js). (F3)';
    }
    return null;
  }

  function attach() {
    try {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user && user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
          overlay.style.display = 'none';
          addLogout();
          resolveReady(user);
        } else if (user) {
          msg.textContent = 'Esta cuenta no tiene acceso al panel.';
          firebase.auth().signOut();
        }
      });
    } catch (e) {
      msg.textContent = 'Error de acceso: ' + ((e && e.message) || e) +
        ' Abre el panel desde la dirección https://... y no como archivo del disco. (F4)';
      btn.disabled = true;
    }
  }

  function start() {
    buildOverlay();
    var problem = diagnose();
    if (!problem) { attach(); return; }
    // Reintento una vez cuando termine de cargar todo (por si algún script tardó)
    function retry() {
      setTimeout(function () {
        var p2 = diagnose();
        if (p2) { msg.textContent = p2; btn.disabled = true; }
        else attach();
      }, 500);
    }
    if (document.readyState === 'complete') retry();
    else window.addEventListener('load', retry);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
