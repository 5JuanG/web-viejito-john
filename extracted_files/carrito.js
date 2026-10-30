// ============================================================
// CARRITO.JS — Carrito de compras compartido (catálogo, inicio y pedido).
// Guarda solo id + cantidad en el navegador del cliente; los precios siempre
// se leen de Firestore (VJCatalogo), así que nunca quedan precios viejos.
// Precio por cantidad: se suman las piezas del carrito y se aplica el nivel
// con el mínimo más alto que ya se alcanzó (los mínimos se editan en
// admin-precios.html → "Niveles de mayoreo").
// Envío: se suma el costo de envío de cada producto distinto del carrito.
// ============================================================
(function () {
    const KEY = 'vj_carrito_v1';
    const MAX_POR_LINEA = 99;
    let memoria = [];

    const num = v => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? undefined : Number(v);
    const dinero = n => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2 });
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function leer() {
        try {
            const a = JSON.parse(localStorage.getItem(KEY) || '[]');
            if (Array.isArray(a)) return a.filter(x => x && x.id && Number(x.cantidad) > 0).map(x => ({ id: String(x.id), cantidad: Math.min(MAX_POR_LINEA, Math.floor(Number(x.cantidad))) }));
        } catch (e) { return memoria.slice(); }
        return [];
    }
    function guardar(items) {
        memoria = items.slice();
        try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* sin almacenamiento: queda en memoria */ }
        window.dispatchEvent(new Event('vj-carrito'));
    }

    const items = () => leer();
    const cantidadTotal = () => leer().reduce((s, x) => s + x.cantidad, 0);

    function agregar(id, cantidad) {
        const a = leer();
        const l = a.find(x => x.id === id);
        if (l) l.cantidad = Math.min(MAX_POR_LINEA, l.cantidad + (cantidad || 1));
        else a.push({ id, cantidad: Math.min(MAX_POR_LINEA, cantidad || 1) });
        guardar(a);
    }
    function setCantidad(id, cantidad) {
        let a = leer();
        const c = Math.floor(Number(cantidad));
        if (!c || c < 1) a = a.filter(x => x.id !== id);
        else { const l = a.find(x => x.id === id); if (l) l.cantidad = Math.min(MAX_POR_LINEA, c); }
        guardar(a);
    }
    const quitar = id => setCantidad(id, 0);
    const vaciar = () => guardar([]);

    // Calcula líneas, nivel de precio aplicado, envío y total con los datos actuales de Firestore.
    async function calcular() {
        const { productos, niveles } = await VJCatalogo.cargar();
        const guardados = leer();
        const lineas = [];
        const noDisponibles = [];
        guardados.forEach(g => {
            const p = productos.find(x => x.id === g.id);
            if (!p) { noDisponibles.push(g.id); return; }
            lineas.push({ p, id: p.id, nombre: p.nombre, imagen: p.imagen, cantidad: g.cantidad, esCaja: p.tipo === 'caja', lista: VJCatalogo.precioFinal(p), costoEnvio: Number(p.costoEnvio || 0) });
        });
        if (noDisponibles.length) guardar(guardados.filter(g => !noDisponibles.includes(g.id)));

        const piezas = lineas.filter(l => !l.esCaja).reduce((s, l) => s + l.cantidad, 0);
        const conMinimo = Object.keys(niveles || {})
            .map(k => ({ clave: k, etiqueta: niveles[k].etiqueta || k, minimo: num(niveles[k].minimo) }))
            .filter(n => n.minimo && n.minimo > 0)
            .sort((a, b) => a.minimo - b.minimo);
        const alcanzados = conMinimo.filter(n => n.minimo <= piezas);
        const nivel = alcanzados.length ? alcanzados[alcanzados.length - 1] : null;
        const siguiente = conMinimo.find(n => n.minimo > piezas) || null;

        lineas.forEach(l => {
            let unit = l.lista;
            if (nivel && !l.esCaja) {
                const v = num(l.p[nivel.clave]);
                if (v && v > 0) unit = Math.min(v, l.lista);
            }
            l.precioUnitario = unit;
            l.subtotal = unit * l.cantidad;
        });
        const subtotal = lineas.reduce((s, l) => s + l.subtotal, 0);
        const envio = lineas.reduce((s, l) => s + l.costoEnvio, 0);
        return { lineas, piezas, nivel, siguiente, faltan: siguiente ? siguiente.minimo - piezas : 0, subtotal, envio, total: subtotal + envio, noDisponibles };
    }

    // ---------------- Interfaz (botón flotante + panel) ----------------
    const css = `
    #vjc-btn{position:fixed;right:18px;bottom:18px;z-index:9998;width:58px;height:58px;border-radius:50%;background:#154212;color:#fff;border:0;box-shadow:0 6px 20px rgba(0,0,0,.28);cursor:pointer;display:none;align-items:center;justify-content:center}
    #vjc-btn.on{display:flex}
    #vjc-btn .material-symbols-outlined{font-size:28px}
    #vjc-badge{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;padding:0 5px;border-radius:11px;background:#E85D04;color:#fff;font:700 12px/22px system-ui,sans-serif;text-align:center}
    #vjc-fondo{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;display:none}
    #vjc-panel{position:fixed;top:0;right:0;height:100%;width:min(420px,100%);background:#fff;z-index:9999;box-shadow:-8px 0 30px rgba(0,0,0,.2);display:none;flex-direction:column;font-family:'Plus Jakarta Sans',system-ui,sans-serif;color:#1f2937}
    #vjc-panel.on,#vjc-fondo.on{display:flex}
    #vjc-fondo.on{display:block}
    .vjc-cab{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #e5e7eb}
    .vjc-cab h2{font-size:18px;font-weight:800;color:#154212;margin:0}
    .vjc-x{background:none;border:0;cursor:pointer;font-size:26px;line-height:1;color:#6b7280}
    .vjc-cuerpo{flex:1;overflow-y:auto;padding:14px 18px}
    .vjc-l{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6}
    .vjc-l img{width:64px;height:64px;object-fit:contain;border:1px solid #e5e7eb;border-radius:10px;background:#fff;flex:none}
    .vjc-l .n{font-weight:700;font-size:14px;line-height:1.25}
    .vjc-l .u{font-size:12px;color:#6b7280;margin-top:2px}
    .vjc-q{display:inline-flex;align-items:center;border:1px solid #d1d5db;border-radius:999px;margin-top:6px}
    .vjc-q button{background:none;border:0;width:30px;height:30px;font-size:18px;cursor:pointer;color:#154212;font-weight:700}
    .vjc-q span{min-width:24px;text-align:center;font-weight:700;font-size:14px}
    .vjc-s{margin-left:auto;text-align:right;font-weight:800;font-size:14px;white-space:nowrap}
    .vjc-del{background:none;border:0;color:#9ca3af;font-size:12px;cursor:pointer;margin-top:6px;padding:0;text-decoration:underline}
    .vjc-aviso{background:#ecfdf5;color:#065f46;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:10px}
    .vjc-aviso.hint{background:#fff7ed;color:#9a3412}
    .vjc-pie{border-top:1px solid #e5e7eb;padding:16px 18px}
    .vjc-r{display:flex;justify-content:space-between;font-size:14px;color:#4b5563;margin-bottom:6px}
    .vjc-r.t{font-size:18px;font-weight:800;color:#154212;margin:10px 0 12px}
    .vjc-ir{display:block;text-align:center;background:#154212;color:#fff;text-decoration:none;font-weight:800;padding:14px;border-radius:12px}
    .vjc-vac{text-align:center;color:#6b7280;padding:40px 10px;font-size:14px}
    #vjc-toast{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111827;color:#fff;padding:10px 18px;border-radius:999px;font:600 13px system-ui,sans-serif;z-index:10000;opacity:0;pointer-events:none;transition:opacity .25s}
    #vjc-toast.on{opacity:1}`;

    let btn, fondo, panel, cuerpo, pie, badge, toastEl;

    function montar() {
        if (document.getElementById('vjc-btn')) return;
        const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
        btn = document.createElement('button');
        btn.id = 'vjc-btn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Abrir carrito');
        btn.innerHTML = '<span class="material-symbols-outlined">shopping_cart</span><span id="vjc-badge">0</span>';
        fondo = document.createElement('div'); fondo.id = 'vjc-fondo';
        panel = document.createElement('aside'); panel.id = 'vjc-panel'; panel.setAttribute('aria-label', 'Carrito');
        panel.innerHTML = '<div class="vjc-cab"><h2>Tu carrito</h2><button type="button" class="vjc-x" aria-label="Cerrar">×</button></div><div class="vjc-cuerpo"></div><div class="vjc-pie"></div>';
        toastEl = document.createElement('div'); toastEl.id = 'vjc-toast';
        document.body.append(btn, fondo, panel, toastEl);
        cuerpo = panel.querySelector('.vjc-cuerpo'); pie = panel.querySelector('.vjc-pie'); badge = btn.querySelector('#vjc-badge');

        btn.addEventListener('click', abrir);
        fondo.addEventListener('click', cerrar);
        panel.querySelector('.vjc-x').addEventListener('click', cerrar);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
        cuerpo.addEventListener('click', e => {
            const m = e.target.closest('[data-mas],[data-menos],[data-quitar]');
            if (!m) return;
            const id = m.dataset.mas || m.dataset.menos || m.dataset.quitar;
            const l = leer().find(x => x.id === id);
            if (!l) return;
            if (m.dataset.mas) setCantidad(id, l.cantidad + 1);
            else if (m.dataset.menos) setCantidad(id, l.cantidad - 1);
            else quitar(id);
        });
        window.addEventListener('vj-carrito', actualizar);
        window.addEventListener('storage', e => { if (e.key === KEY) actualizar(); });
        actualizar();
    }

    function avisar(t) {
        if (!toastEl) return;
        toastEl.textContent = t; toastEl.classList.add('on');
        clearTimeout(avisar._t); avisar._t = setTimeout(() => toastEl.classList.remove('on'), 1800);
    }

    function abrir() { if (!panel) return; panel.classList.add('on'); fondo.classList.add('on'); pintar(); }
    function cerrar() { if (!panel) return; panel.classList.remove('on'); fondo.classList.remove('on'); }

    function actualizar() {
        if (!btn) return;
        const n = cantidadTotal();
        badge.textContent = n;
        // En el catálogo el botón siempre se ve; en otras páginas solo si hay algo en el carrito
        btn.classList.toggle('on', n > 0 || /products/i.test(location.pathname));
        if (panel.classList.contains('on')) pintar();
    }

    async function pintar() {
        if (!leer().length) {
            cuerpo.innerHTML = '<div class="vjc-vac">Tu carrito está vacío.<br>Agrega productos desde el catálogo.</div>';
            pie.innerHTML = '';
            return;
        }
        cuerpo.innerHTML = '<div class="vjc-vac">Calculando…</div>';
        let c;
        try { c = await calcular(); }
        catch (e) { cuerpo.innerHTML = '<div class="vjc-vac">No se pudieron cargar los precios. Revisa tu conexión e inténtalo de nuevo.</div>'; pie.innerHTML = ''; return; }
        if (!c.lineas.length) { cuerpo.innerHTML = '<div class="vjc-vac">Los productos de tu carrito ya no están disponibles.</div>'; pie.innerHTML = ''; return; }

        let aviso = '';
        if (c.nivel) aviso += `<div class="vjc-aviso">✓ Precio <b>${esc(c.nivel.etiqueta)}</b> aplicado (${c.piezas} piezas).</div>`;
        if (c.siguiente) aviso += `<div class="vjc-aviso hint">Agrega ${c.faltan} pieza${c.faltan === 1 ? '' : 's'} más para precio <b>${esc(c.siguiente.etiqueta)}</b>.</div>`;

        cuerpo.innerHTML = aviso + c.lineas.map(l => `
            <div class="vjc-l">
                <img src="${esc(l.imagen)}" alt="" onerror="this.src='producto.webp'">
                <div>
                    <div class="n">${esc(l.nombre)}</div>
                    <div class="u">${dinero(l.precioUnitario)} c/u${l.precioUnitario < l.lista ? ` <s>${dinero(l.lista)}</s>` : ''}</div>
                    <div class="vjc-q"><button type="button" data-menos="${esc(l.id)}" aria-label="Quitar una">−</button><span>${l.cantidad}</span><button type="button" data-mas="${esc(l.id)}" aria-label="Agregar una">+</button></div><br>
                    <button type="button" class="vjc-del" data-quitar="${esc(l.id)}">Quitar</button>
                </div>
                <div class="vjc-s">${dinero(l.subtotal)}</div>
            </div>`).join('');

        pie.innerHTML = `
            <div class="vjc-r"><span>Subtotal</span><span>${dinero(c.subtotal)}</span></div>
            <div class="vjc-r"><span>Envío</span><span>${c.envio ? dinero(c.envio) : 'GRATIS'}</span></div>
            <div class="vjc-r t"><span>Total</span><span>${dinero(c.total)}</span></div>
            <a class="vjc-ir" href="checkout.html?carrito=1">Finalizar pedido</a>`;
    }

    // Botones "Agregar al carrito": cualquier elemento con data-add="ID_PRODUCTO"
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-add]');
        if (!b) return;
        e.preventDefault();
        agregar(b.dataset.add, 1);
        avisar('Agregado al carrito ✓');
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
    else montar();

    window.VJCarrito = { items, cantidadTotal, agregar, setCantidad, quitar, vaciar, calcular, abrir, cerrar, dinero };
})();
