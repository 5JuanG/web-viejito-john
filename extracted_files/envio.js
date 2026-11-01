// ============================================================
// ENVIO.JS — Costo de envío por código postal y peso del paquete.
// La configuración vive en Firestore: config/envio (se edita en admin-envios.html).
// Si ese documento no existe o está desactivado, el sitio sigue usando el
// "Costo de envío" fijo de cada producto (comportamiento anterior).
//
// Reglas:
//  1. C.P. dentro de los prefijos locales  -> cuota local (entrega propia).
//  2. Otro C.P. -> estado (por los 2 primeros dígitos) -> zona -> tarifa.
//  3. Peso del pedido = suma de pesoKg de los productos. Se elige la caja más
//     chica que alcance; se cobra el mayor entre peso real y volumétrico
//     (largo x ancho x alto / divisor), mínimo 1 kg, redondeado hacia arriba
//     al siguiente peso cotizado (1, 5, 7, 10, 12 kg...).
//  4. Si no cabe en ninguna caja, no hay tarifa para ese peso/zona o la tarifa
//     está en $0 (sin capturar) -> "por confirmar" (se avisa por WhatsApp).
// ============================================================
(function () {
    const CP_KEY = 'vj_cp_envio';
    const RANGOS = [
        [1, 16, 'Ciudad de México'], [20, 20, 'Aguascalientes'], [21, 22, 'Baja California'], [23, 23, 'Baja California Sur'],
        [24, 24, 'Campeche'], [25, 27, 'Coahuila'], [28, 28, 'Colima'], [29, 30, 'Chiapas'], [31, 33, 'Chihuahua'],
        [34, 35, 'Durango'], [36, 38, 'Guanajuato'], [39, 41, 'Guerrero'], [42, 43, 'Hidalgo'], [44, 49, 'Jalisco'],
        [50, 57, 'Estado de México'], [58, 61, 'Michoacán'], [62, 62, 'Morelos'], [63, 63, 'Nayarit'], [64, 67, 'Nuevo León'],
        [68, 71, 'Oaxaca'], [72, 75, 'Puebla'], [76, 76, 'Querétaro'], [77, 77, 'Quintana Roo'], [78, 79, 'San Luis Potosí'],
        [80, 82, 'Sinaloa'], [83, 85, 'Sonora'], [86, 86, 'Tabasco'], [87, 89, 'Tamaulipas'], [90, 90, 'Tlaxcala'],
        [91, 96, 'Veracruz'], [97, 97, 'Yucatán'], [98, 99, 'Zacatecas']
    ];
    const ESTADOS = RANGOS.map(r => r[2]).sort((a, b) => a.localeCompare(b, 'es'));

    const ZONAS = [
        ['nl', 'Nuevo León (fuera de la zona local)', ['Nuevo León']],
        ['noreste', 'Noreste', ['Tamaulipas', 'Coahuila']],
        ['norte', 'Norte', ['Chihuahua', 'Durango', 'Zacatecas', 'San Luis Potosí', 'Aguascalientes']],
        ['bajio', 'Bajío y Occidente', ['Guanajuato', 'Querétaro', 'Jalisco', 'Colima', 'Nayarit', 'Michoacán']],
        ['centro', 'Centro', ['Ciudad de México', 'Estado de México', 'Morelos', 'Puebla', 'Tlaxcala', 'Hidalgo']],
        ['golfo-sur', 'Golfo y Sur', ['Veracruz', 'Tabasco', 'Oaxaca', 'Guerrero', 'Chiapas']],
        ['sureste', 'Sureste', ['Yucatán', 'Quintana Roo', 'Campeche']],
        ['noroeste', 'Noroeste', ['Sonora', 'Sinaloa', 'Baja California', 'Baja California Sur']]
    ];
    const PESOS = [1, 5, 7, 10, 12];

    // Configuración inicial que se muestra en admin-envios.html la primera vez
    // (las tarifas empiezan en 0 = "por confirmar" hasta que se capturen).
    function porDefecto() {
        const estadoZona = {};
        ZONAS.forEach(z => z[2].forEach(e => { estadoZona[e] = z[0]; }));
        return {
            activo: true,
            cuotaLocal: 0,
            prefijosLocales: '',
            pesoDefaultKg: 0.3,
            divisorVolumetrico: 5000,
            pesos: PESOS.slice(),
            cajas: [
                { nombre: 'Chica', largo: 15, ancho: 10, alto: 5, hastaKg: 1 },
                { nombre: 'Mediana', largo: 30, ancho: 30, alto: 30, hastaKg: 7 },
                { nombre: 'Grande', largo: 40, ancho: 32, alto: 27, hastaKg: 12 }
            ],
            zonas: ZONAS.map(z => ({ id: z[0], nombre: z[1], precios: PESOS.reduce((o, w) => { o[w] = 0; return o; }, {}) })),
            estadoZona
        };
    }

    const n = v => (v === undefined || v === null || v === '' || isNaN(Number(v))) ? 0 : Number(v);
    const kg = v => Math.round(v * 1000) / 1000;
    const limpiaCP = cp => String(cp || '').replace(/\D/g, '').slice(0, 5);

    function estadoDeCP(cp) {
        cp = limpiaCP(cp);
        if (cp.length < 2) return '';
        const d = parseInt(cp.slice(0, 2), 10);
        const r = RANGOS.find(x => d >= x[0] && d <= x[1]);
        return r ? r[2] : '';
    }

    // Peso total (kg) de `cantidad` piezas de un producto del catálogo
    function pesoDe(p, cantidad, cfg) {
        const def = n(cfg && cfg.pesoDefaultKg) || 0.3;
        let unit = n(p && p.pesoKg);
        const esCaja = p && (p.tipo === 'caja' || p.tipo === 'mayoreo');
        if (!(unit > 0)) unit = esCaja ? (n(p.piezas) || 1) * def : def;
        return kg(unit * cantidad);
    }

    function calcular(cfg, cp, pesoKg) {
        cp = limpiaCP(cp);
        const res = { tipo: 'sin-cp', monto: null, estado: '', zona: '', caja: '', pesoKg: kg(pesoKg), pesoCobrado: 0, mensaje: 'Captura tu código postal para calcular el envío' };
        if (cp.length !== 5) return res;

        const locales = String(cfg.prefijosLocales || '').split(/[\s,]+/).filter(Boolean);
        if (locales.some(p => cp.startsWith(p))) {
            return { ...res, tipo: 'local', monto: n(cfg.cuotaLocal), zona: 'Entrega local', estado: estadoDeCP(cp), mensaje: 'Entrega local' };
        }

        const por = m => ({ ...res, tipo: 'consultar', estado: estadoDeCP(cp), mensaje: m });
        const estado = estadoDeCP(cp);
        if (!estado) return por('No reconocemos ese código postal: te confirmamos el envío por WhatsApp');
        const zona = (cfg.zonas || []).find(z => z.id === (cfg.estadoZona || {})[estado]);
        if (!zona) return por('Te confirmamos el costo de envío a ' + estado + ' por WhatsApp');

        const cajas = (cfg.cajas || []).slice().sort((a, b) => n(a.hastaKg) - n(b.hastaKg));
        const caja = cajas.find(c => n(c.hastaKg) >= pesoKg - 1e-9);
        if (!caja) return por('Pedido de más de ' + (cajas.length ? n(cajas[cajas.length - 1].hastaKg) : 0) + ' kg: te confirmamos el envío por WhatsApp');

        const divisor = n(cfg.divisorVolumetrico) || 5000;
        const volumetrico = n(caja.largo) * n(caja.ancho) * n(caja.alto) / divisor;
        const cobrado = Math.max(1, pesoKg, volumetrico);
        const pesos = (cfg.pesos || []).map(Number).filter(w => w > 0).sort((a, b) => a - b);
        const w = pesos.find(x => x >= cobrado - 1e-9);
        const precio = w ? n((zona.precios || {})[w]) : 0;
        const base = { ...res, estado, zona: zona.nombre, caja: caja.nombre || '', pesoCobrado: w || kg(cobrado) };
        if (!(precio > 0)) return { ...base, tipo: 'consultar', mensaje: 'Te confirmamos el costo de envío por WhatsApp' };
        return { ...base, tipo: 'nacional', monto: precio, mensaje: 'Envío a ' + estado + ' (paquete de ' + w + ' kg)' };
    }

    let _cfg = null;
    // Devuelve la configuración activa, o null si no hay (se usa el envío fijo por producto)
    function cargar(forzar) {
        if (_cfg && !forzar) return _cfg;
        _cfg = (async () => {
            try {
                if (typeof db === 'undefined' || !db) return null;
                const lectura = db.collection('config').doc('envio').get();
                const snap = await Promise.race([lectura, new Promise(r => setTimeout(() => r(null), 6000))]);
                if (!snap || !snap.exists) return null;
                const c = snap.data();
                return c && c.activo ? c : null;
            } catch (e) { console.warn('No se pudo leer la configuración de envío.', e); return null; }
        })();
        return _cfg;
    }

    const cpGuardado = () => { try { return limpiaCP(localStorage.getItem(CP_KEY)); } catch (e) { return ''; } };
    const guardarCP = cp => { try { localStorage.setItem(CP_KEY, limpiaCP(cp)); } catch (e) { /* sin almacenamiento */ } };

    window.VJEnvio = { cargar, calcular, pesoDe, estadoDeCP, porDefecto, limpiaCP, cpGuardado, guardarCP, ESTADOS };
})();
