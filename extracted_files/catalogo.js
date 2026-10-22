// ============================================================
// CATALOGO.JS — Fuente única de productos para catálogo y pedido.
// Lee la colección "productos" de Firestore (la edita admin-precios.html).
// Si todavía no existe, usa catalogo-seed.js + los precios guardados antes.
// ============================================================
(function () {
    const NIVELES_DEFAULT = {
        medioMayoreo:   { etiqueta: 'Medio mayoreo',  minimo: null },
        mayoreo:        { etiqueta: 'Mayoreo',        minimo: null },
        distribuidores: { etiqueta: 'Distribuidores', minimo: null },
        cambaceo:       { etiqueta: 'Cambaceo',       minimo: null }
    };
    const ICONOS = { 'Línea de Alivio Muscular': 'fitness_center', 'Cuidado Respiratorio': 'air', 'Cuidado Facial': 'face', 'Cuidado de Pies y Piel (Keratex)': 'spa' };

    const fmt = n => '$' + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const num = v => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? undefined : Number(v);
    const conTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r(null), ms))]);

    let _cache = null;

    async function cargar(forzar, todos) {
        if (_cache && !forzar) return _cache;
        _cache = (async () => {
            let productos = null;
            let origen = 'firestore';
            let niveles = JSON.parse(JSON.stringify(NIVELES_DEFAULT));
            const listo = typeof loadCollection === 'function' && window.isFirebaseReady && window.isFirebaseReady();
            if (listo) {
                try {
                    const r = await conTimeout(Promise.all([loadCollection('productos'), loadCollection('config')]), 5000);
                    if (r) {
                        if (r[0] && r[0].length) productos = r[0];
                        const cfg = (r[1] || []).find(d => d.id === 'niveles');
                        if (cfg) Object.keys(niveles).forEach(k => { if (cfg[k]) niveles[k] = { ...niveles[k], ...cfg[k] }; });
                    }
                } catch (e) { console.warn('No se pudo leer productos de Firestore.', e); }
            }
            if (!productos) {
                // Respaldo: lista inicial + precios que se guardaron con el panel anterior
                origen = 'inicial';
                productos = JSON.parse(JSON.stringify(window.VJ_SEED || []));
                if (listo) {
                    try {
                        const r = await conTimeout(Promise.all([loadCollection('preciosMenudeo'), loadCollection('preciosMayoreo')]), 4000);
                        if (r) [...(r[0] || []), ...(r[1] || [])].forEach(g => {
                            const p = productos.find(x => x.id === g.id);
                            if (!p) return;
                            ['precio', 'precioOferta', 'mayoreo', 'medioMayoreo', 'distribuidores', 'cambaceo'].forEach(k => { const v = num(g[k]); if (v !== undefined) p[k] = v; });
                            if (typeof g.ofertaActiva === 'boolean') p.ofertaActiva = g.ofertaActiva;
                        });
                    } catch (e) {}
                }
            }
            if (!todos) productos = productos.filter(p => p.activo !== false);
            productos.sort((a, b) => (a.orden || 0) - (b.orden || 0));
            return { productos, niveles, origen };
        })();
        return _cache;
    }

    const precioFinal = p => Number(p.ofertaActiva ? (p.precioOferta ?? p.precio ?? 0) : (p.precio ?? 0));
    const precioNivel = (p, clave) => { const v = num(p[clave]); return v !== undefined ? v : precioFinal(p); };
    const textoMinimo = (niveles, clave) => {
        const m = niveles && niveles[clave] && num(niveles[clave].minimo);
        return m ? ` (desde ${m} pzas)` : '';
    };

    // Devuelve HTML para mostrar un video: YouTube → iframe, mp4/webm → <video>, otro → enlace
    function videoHTML(url) {
        if (!url) return '';
        const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
        if (yt) return `<iframe class="w-full aspect-video rounded-xl" src="https://www.youtube.com/embed/${yt[1]}" allowfullscreen loading="lazy"></iframe>`;
        if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return `<video class="w-full rounded-xl" src="${esc(url)}" controls preload="none"></video>`;
        return `<a href="${esc(url)}" target="_blank" rel="noopener" class="text-primary underline text-sm">Ver video</a>`;
    }

    window.VJCatalogo = { cargar, precioFinal, precioNivel, textoMinimo, videoHTML, fmt, esc, num, ICONOS, NIVELES_DEFAULT };
})();
