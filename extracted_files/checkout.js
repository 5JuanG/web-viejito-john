// ============================================================
// CHECKOUT.JS — Lógica unificada para checkout.html
// Soporta: menudeo (Viejito John + Keratex) y mayoreo
// Parámetro URL: ?p=ID_DEL_PRODUCTO  o  ?producto=ID_DEL_PRODUCTO
// ============================================================

// ---------- CONFIGURACIÓN GLOBAL ----------
const WHATSAPP_NUMERO = '5218113160143'; // Celular donde llegan los pedidos

// Los productos vienen de catalogo.js (colección "productos" de Firestore,
// que se edita en admin-precios.html).
let NIVELES = {};

// ---------- FUNCIONES AUXILIARES ----------
const fmt = n => '$' + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

async function loadRemotePrices() {
    const { niveles } = await VJCatalogo.cargar();
    NIVELES = niveles || {};
}

function getPriceForTier(product, tier) {
    const normalizedTier = (tier || 'publico').toLowerCase();
    const key = {
        publico: 'publico',
        retail: 'publico',
        mayoreo: 'mayoreo',
        wholesale: 'mayoreo',
        mediomayoreo: 'medioMayoreo',
        midwholesale: 'medioMayoreo',
        distribuidores: 'distribuidores',
        distributor: 'distribuidores',
        cambaceo: 'cambaceo'
    }[normalizedTier] || 'publico';
    // Precio de lista (con oferta si está activa): es el mismo que muestran el inicio y el catálogo
    const base = Number(product.ofertaActiva ? (product.precioOferta ?? product.precio ?? product.precioNormal ?? 0)
                                             : (product.precio ?? product.precioNormal ?? 0));
    if (key === 'publico') return base;
    if (key === 'distribuidores') {
        // El precio de distribuidor es privado: solo existe para un distribuidor autorizado
        const d = window.VJDistribuidor;
        const v = (d && d.activo && product.tipo !== 'mayoreo') ? Number(d.precios[product.id] || 0) : 0;
        return v > 0 ? Math.min(v, base) : base;
    }
    const tierPrice = product[key];
    return Number(tierPrice !== undefined && tierPrice !== null ? tierPrice : base);
}

// Un distribuidor autorizado siempre paga su precio; para cualquier otra persona
// el nivel "distribuidores" de la URL se ignora.
function tierEfectivo(t) {
    const d = window.VJDistribuidor;
    if (d && d.activo) return 'distribuidores';
    const n = String(t || 'publico').toLowerCase();
    return (n === 'distribuidores' || n === 'distributor') ? 'publico' : (t || 'publico');
}

function getPriceTierLabel(tier) {
    const labels = {
        publico: 'Público',
        retail: 'Público',
        mayoreo: 'Mayoreo',
        wholesale: 'Mayoreo',
        medioMayoreo: 'Medio mayoreo',
        midWholesale: 'Medio mayoreo',
        distribuidores: 'Distribuidores',
        distributor: 'Distribuidores',
        cambaceo: 'Cambaceo'
    };
    return labels[tier] || tier || 'Público';
}

async function findProduct(pid) {
    const { productos } = await VJCatalogo.cargar();
    const p = productos.find(x => x.id === pid);
    if (!p) return null;
    const esCaja = p.tipo === 'caja';
    return {
        ...p,
        precio: Number(p.precio || 0),
        precioNormal: Number(p.precio || 0),
        categoria: p.linea || 'viejito',
        imagen: (esCaja && p.imagenMayoreo) ? p.imagenMayoreo : p.imagen,
        textoPromo: p.textoPromo || (esCaja ? 'Mayoreo Especial' : ''),
        costoEnvio: Number(p.costoEnvio || 0),
        tipo: esCaja ? 'mayoreo' : 'menudeo',
        origen: esCaja ? 'checkout-mayoreo' : 'checkout-menudeo'
    };
}

// ---------- RENDERIZADO ----------
let currentProduct = null;

let carritoCalc = null;

// ---------- ENVÍO POR C.P. (envio.js) ----------
// subtotalActual: productos; envioLegacy: envío fijo por producto (si el envío por C.P.
// no está activo); envioInfo: resultado del cálculo por C.P. (o null).
let subtotalActual = 0;
let envioLegacy = 0;
let envioInfo = null;
const envioMonto = () => envioInfo ? (envioInfo.monto || 0) : envioLegacy;
const envioPorConfirmar = () => !!(envioInfo && envioInfo.tipo === 'consultar');

function pintarTotales() {
    const shipEl = document.getElementById('co-shipping');
    const notaEl = document.getElementById('co-envio-nota');
    const monto = envioMonto();
    shipEl.classList.remove('text-green-600');
    if (envioInfo && envioInfo.monto === null) {
        shipEl.textContent = envioPorConfirmar() ? 'Por confirmar' : 'Escribe tu C.P.';
    } else if (!monto) {
        shipEl.textContent = 'GRATIS'; shipEl.classList.add('text-green-600');
    } else {
        shipEl.textContent = fmt(monto);
    }
    if (notaEl) notaEl.textContent = envioInfo ? envioInfo.mensaje : '';
    document.getElementById('co-total').textContent = fmt(subtotalActual + monto);
}

async function actualizarEnvio() {
    if (!currentProduct) return;
    const cfg = window.VJEnvio ? await VJEnvio.cargar() : null;
    if (!cfg) { envioInfo = null; pintarTotales(); return; }
    const campo = document.getElementById('campo-cp');
    if (campo && !campo.value && VJEnvio.cpGuardado()) campo.value = VJEnvio.cpGuardado();
    const cp = campo ? campo.value : '';
    if (VJEnvio.limpiaCP(cp).length === 5) VJEnvio.guardarCP(cp);
    const peso = carritoCalc ? carritoCalc.pesoTotal : VJEnvio.pesoDe(currentProduct, 1, cfg);
    envioInfo = VJEnvio.calcular(cfg, cp, peso);
    pintarTotales();
}

async function renderCarrito() {
    if (window.VJDistribuidor) await VJDistribuidor.listo;
    await loadRemotePrices();
    const c = await VJCarrito.calcular();
    const esc = VJCatalogo.esc;
    const bloque = document.getElementById('product-img-simple').parentElement;
    document.title = 'Tu pedido - Carrito | VJ.Lab';
    document.getElementById('summary-title').textContent = 'Tu carrito';

    if (!c.lineas.length) {
        bloque.innerHTML = '<p class="text-on-surface-variant">Tu carrito está vacío. <a href="products.html" class="text-primary font-bold underline">Ir al catálogo</a></p>';
        document.getElementById('co-subtotal').textContent = fmt(0);
        document.getElementById('co-shipping').textContent = fmt(0);
        document.getElementById('co-total').textContent = fmt(0);
        document.getElementById('submit-btn').disabled = true;
        currentProduct = null;
        return;
    }

    carritoCalc = c;
    currentProduct = { id: 'carrito', nombre: 'Carrito', descripcion: '', tipo: 'menudeo', origen: 'checkout-carrito' };
    bloque.className = 'mb-8 pb-6 border-b border-outline-variant/30';
    bloque.innerHTML = (c.nivel ? `<p class="text-xs font-bold text-primary mb-3">✓ Precio ${esc(c.nivel.etiqueta)} aplicado (${c.piezas} piezas)</p>` : '') +
        c.lineas.map(l => `<div class="flex items-center gap-3 mb-4">
            <div class="w-16 h-16 rounded-lg bg-white border border-outline-variant/20 flex items-center justify-center overflow-hidden shrink-0"><img src="${esc(l.imagen)}" alt="" class="max-h-full object-contain" onerror="this.src='producto.webp'"></div>
            <div class="flex-1 min-w-0"><p class="font-bold text-primary leading-tight">${esc(l.nombre)}</p><p class="text-xs text-on-surface-variant">${l.cantidad} × ${fmt(l.precioUnitario)}</p></div>
            <span class="font-bold text-primary">${fmt(l.subtotal)}</span></div>`).join('') +
        '<a href="products.html" class="text-xs text-primary underline">Seguir comprando</a>' +
        '<p class="text-on-surface-variant/60 text-xs mt-3 italic leading-tight">Productos cosméticos elaborados con ingredientes naturales para uso tópico externo. No sustituyen consulta médica.</p>';

    document.getElementById('label-subtotal').textContent = 'Subtotal';
    document.getElementById('co-subtotal').textContent = fmt(c.subtotal);
    subtotalActual = c.subtotal;
    envioLegacy = c.envioInfo ? 0 : c.envio;
    await actualizarEnvio();
}

async function renderProduct() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('carrito')) { await renderCarrito(); return; }
    const pid = params.get('p') || params.get('producto') || 'gel_balsamico_700g';
    if (window.VJDistribuidor) await VJDistribuidor.listo;
    const tier = tierEfectivo(params.get('tier') || params.get('t') || 'publico');

    await loadRemotePrices();
    currentProduct = await findProduct(pid);

    if (!currentProduct) {
        document.getElementById('co-product-name').textContent = 'Producto no encontrado';
        return;
    }

    const isMayoreo = currentProduct.tipo === 'mayoreo';
    const precioFinal = getPriceForTier(currentProduct, tier);

    document.title = `Tu pedido - ${currentProduct.nombre} | VJ.Lab`;
    document.getElementById('summary-title').textContent = isMayoreo ? 'Pedido de Mayoreo' : 'Resumen del Pedido';
    document.getElementById('co-product-name').textContent = currentProduct.nombre;
    document.getElementById('co-product-desc').textContent = currentProduct.descripcion;
    const tierEl = document.getElementById('co-price-tier');
    if (tierEl) {
        const tierKey = ({ wholesale: 'mayoreo', mediomayoreo: 'medioMayoreo', midwholesale: 'medioMayoreo', distributor: 'distribuidores' })[String(tier).toLowerCase()] || tier;
        tierEl.textContent = `Precio ${getPriceTierLabel(tier)}${VJCatalogo.textoMinimo(NIVELES, tierKey)}`;
    }

    const hasCarousel = currentProduct.imagenFrente && currentProduct.imagenLado;
    const simpleContainer = document.getElementById('product-img-simple');
    const carouselContainer = document.getElementById('product-img-carousel');

    if (hasCarousel) {
        simpleContainer.classList.add('hidden');
        carouselContainer.classList.remove('hidden');
        const s0 = document.getElementById('carousel-slide-0');
        const s1 = document.getElementById('carousel-slide-1');
        if (s0) { s0.style.backgroundImage = `url('${currentProduct.imagenFrente}')`; }
        if (s1) { s1.style.backgroundImage = `url('${currentProduct.imagenLado}')`; }
        initCarousel();
    } else {
        carouselContainer.classList.add('hidden');
        simpleContainer.classList.remove('hidden');
        const img = document.getElementById('co-product-img');
        if (img) { img.src = currentProduct.imagen; img.alt = currentProduct.nombre; }
    }

    const origEl = document.getElementById('co-price-original');
    const finalEl = document.getElementById('co-price-final');
    const badgeEl = document.getElementById('co-promo-badge');

    if (currentProduct.ofertaActiva) {
        const precioNormal = isMayoreo ? currentProduct.precioNormal : currentProduct.precio;
        origEl.textContent = fmt(precioNormal);
        origEl.classList.remove('hidden');
        finalEl.textContent = fmt(precioFinal);
        finalEl.classList.add('text-red-600');
        badgeEl.textContent = currentProduct.textoPromo || '¡Oferta!';
        badgeEl.classList.remove('hidden');
    } else {
        origEl.classList.add('hidden');
        finalEl.textContent = fmt(precioFinal);
        finalEl.classList.remove('text-red-600');
        badgeEl.classList.add('hidden');
    }

    document.getElementById('co-subtotal').textContent = fmt(precioFinal);
    subtotalActual = precioFinal;
    envioLegacy = currentProduct.costoEnvio || 0;
    await actualizarEnvio();

    if (isMayoreo) {
        document.getElementById('label-subtotal').textContent = 'Subtotal Mayoreo';
        document.getElementById('label-envio').textContent = 'Envío Terrestre';
        document.getElementById('submit-text').textContent = 'Confirmar y Pagar Mayoreo';
    }

    const cofeprisEl = document.getElementById('co-cofepris-text');
    if (currentProduct.categoria === 'keratex') {
        cofeprisEl.textContent = 'Keratex es un producto cosmético formulado con ingredientes naturales para favorecer la apariencia estética de la piel de pies y manos. No sustituye diagnóstico ni tratamiento médico. Apto para uso en piel sana. Conforme a NOM-141-SSA1/SCFI-2012.';
    } else {
        cofeprisEl.textContent = 'Producto cosmético elaborado con ingredientes naturales para favorecer el bienestar mediante uso tópico externo. No sustituye consulta médica.';
    }
}

// ---------- CARRUSEL ----------
function initCarousel() {
    const track = document.getElementById('co-carousel-track');
    const prevBtn = document.getElementById('co-carousel-prev');
    const nextBtn = document.getElementById('co-carousel-next');
    const dots = document.querySelectorAll('[data-carousel-dot]');
    if (!track) return;

    let currentIndex = 0;
    function update() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === currentIndex);
            dot.classList.toggle('bg-white/50', i !== currentIndex);
        });
    }

    nextBtn?.addEventListener('click', () => { currentIndex = (currentIndex + 1) % 2; update(); });
    prevBtn?.addEventListener('click', () => { currentIndex = (currentIndex - 1 + 2) % 2; update(); });
    dots.forEach((dot, i) => { dot.addEventListener('click', () => { currentIndex = i; update(); }); });
    update();
    setInterval(() => { currentIndex = (currentIndex + 1) % 2; update(); }, 3000);
}

// Número de pedido para el rastreo (VJ-XXXXXXXX, sin letras/números que se confundan)
function nuevoCodigoPedido() {
    const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return 'VJ-' + Array.from(bytes, b => alfabeto[b % alfabeto.length]).join('');
}

// ---------- FORM SUBMIT ----------
function initForm() {
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitText = document.getElementById('submit-text');

    if (!form) return;

    const cpInput = document.getElementById('campo-cp');
    if (cpInput) cpInput.addEventListener('input', () => {
        cpInput.value = cpInput.value.replace(/\D/g, '').slice(0, 5);
        actualizarEnvio();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentProduct) return;

        const nombre    = document.getElementById('campo-nombre')?.value.trim()    || 'Sin nombre';
        const apellidos = document.getElementById('campo-apellidos')?.value.trim() || '';
        const direccion = document.getElementById('campo-direccion')?.value.trim() || 'Sin dirección';
        const ciudad    = document.getElementById('campo-ciudad')?.value.trim()    || 'Sin ciudad';
        const cp        = document.getElementById('campo-cp')?.value.trim()        || 'Sin CP';
        const email     = document.getElementById('campo-email')?.value.trim()     || 'Sin correo';
        const telefono  = document.getElementById('campo-telefono')?.value.trim()  || 'Sin teléfono';
        const totalEl   = document.getElementById('co-total');
        const total     = totalEl ? totalEl.textContent : '?';

        const tierActual = tierEfectivo(new URLSearchParams(window.location.search).get('tier') || new URLSearchParams(window.location.search).get('t') || 'publico');
        const esCarrito = !!carritoCalc;
        const precioUnitario = esCarrito ? 0 : getPriceForTier(currentProduct, tierActual);
        const envio = envioMonto();
        const resumenCarrito = esCarrito ? ('Carrito: ' + carritoCalc.lineas.map(l => `${l.cantidad}× ${l.nombre}`).join(', ')).slice(0, 190) : '';
        const codigoPedido = nuevoCodigoPedido();
        const orderData = {
            codigo: codigoPedido,
            productoId: currentProduct.id,
            nivelPrecio: esCarrito ? (carritoCalc.nivel ? carritoCalc.nivel.clave : 'publico') : tierActual,
            ...(((esCarrito && carritoCalc.distribuidor) || (!esCarrito && tierActual === 'distribuidores')) && window.VJDistribuidor && VJDistribuidor.activo
                ? { distribuidorCorreo: VJDistribuidor.correo, distribuidorNombre: VJDistribuidor.nombre } : {}),
            precioUnitario,
            envio,
            envioPorConfirmar: envioPorConfirmar(),
            envioDetalle: envioInfo ? { tipo: envioInfo.tipo, zona: envioInfo.zona || '', estado: envioInfo.estado || '', caja: envioInfo.caja || '', pesoKg: envioInfo.pesoKg || 0, pesoCobrado: envioInfo.pesoCobrado || 0 } : null,
            totalNumero: esCarrito ? carritoCalc.subtotal + envio : precioUnitario + envio,
            estado: 'nuevo',
            ...(esCarrito ? { items: carritoCalc.lineas.map(l => ({ id: l.id, nombre: l.nombre, cantidad: l.cantidad, precioUnitario: l.precioUnitario, subtotal: l.subtotal })), subtotal: carritoCalc.subtotal } : {}),
            producto: esCarrito ? resumenCarrito : currentProduct.nombre,
            descripcion: currentProduct.descripcion,
            total,
            nombre: `${nombre} ${apellidos}`.trim(),
            direccion,
            ciudad,
            cp,
            email,
            telefono,
            origen: currentProduct.origen,
            fecha: new Date().toISOString()
        };

        try {
            if (typeof saveOrder === 'function') {
                await saveOrder(orderData);
            }
        } catch (err) {
            console.warn('Error guardando pedido en Firebase:', err);
        }
        // Registro público mínimo para que el cliente consulte el estado con su número de pedido
        try {
            if (typeof db !== 'undefined' && db) {
                await db.collection('seguimiento').doc(codigoPedido).set({ codigo: codigoPedido, estado: 'nuevo', fecha: orderData.fecha });
            }
        } catch (err) {
            console.warn('No se pudo crear el registro de seguimiento:', err);
        }

        const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
        const isMayoreo = currentProduct.tipo === 'mayoreo';
        const envioTexto = envioPorConfirmar() ? 'POR CONFIRMAR' : (envio ? fmt(envio) : 'GRATIS');

        const msgLines = [
            isMayoreo ? '*NUEVO PEDIDO MAYOREO - VJ.Lab*' : '*NUEVO PEDIDO - VJ.Lab*',
            '─────────────────────',
            ...(esCarrito
                ? ['*Productos:*', ...carritoCalc.lineas.map(l => `• ${l.cantidad} × ${l.nombre} — ${fmt(l.subtotal)}`), `*Envío:* ${envioTexto}`]
                : [`*Producto:* ${currentProduct.nombre}`, ...(envioInfo ? [`*Envío:* ${envioTexto}`] : [])]),
            `*Total:* ${total}`,
            ...(envioPorConfirmar() ? ['El envío se confirma por WhatsApp (no está incluido en el total).'] : []),
            `*Fecha:* ${fecha}`,
            `*Número de pedido:* ${codigoPedido}`,
            `Rastrea tu pedido: ${location.origin}/rastreo.html?c=${codigoPedido}`,
            '─────────────────────',
            isMayoreo ? '*DATOS DEL DISTRIBUIDOR*' : '*DATOS DEL CLIENTE*',
            `• Nombre: ${orderData.nombre}`,
            `• Tel: ${telefono}`,
            `• Email: ${email}`,
            '─────────────────────',
            '*DIRECCIÓN DE ENTREGA*',
            `• Calle: ${direccion}`,
            `• Ciudad: ${ciudad}`,
            `• C.P.: ${cp}`,
            '─────────────────────',
            'Pago: enviar link de Mercado Pago al cliente.',
        ];
        const msg = msgLines.map(encodeURIComponent).join('%0A');
        const waURL = `https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`;

        submitBtn.disabled = true;
        submitIcon.textContent = 'hourglass_empty';
        submitIcon.classList.add('animate-spin');
        submitText.textContent = 'Preparando pedido...';

        setTimeout(() => {
            submitIcon.classList.remove('animate-spin');
            submitIcon.textContent = 'check_circle';
            submitText.textContent = `¡Pedido ${codigoPedido} registrado! Abriendo WhatsApp...`;
            if (esCarrito && window.VJCarrito) VJCarrito.vaciar();
            window.location.href = waURL;
        }, 1500);
    });
}

// ---------- FORM FOCUS FEEDBACK ----------
function initFormFocus() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.querySelector('label')?.classList.add('text-primary');
        });
        input.addEventListener('blur', () => {
            input.parentElement.querySelector('label')?.classList.remove('text-primary');
        });
    });
}

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded', () => {
    renderProduct();
    initForm();
    initFormFocus();
});