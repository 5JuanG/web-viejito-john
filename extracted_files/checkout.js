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
    const tierPrice = product[key];
    return Number(tierPrice !== undefined && tierPrice !== null ? tierPrice : base);
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

async function renderProduct() {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('p') || params.get('producto') || 'gel_balsamico_700g';
    const tier = params.get('tier') || params.get('t') || 'publico';

    await loadRemotePrices();
    currentProduct = await findProduct(pid);

    if (!currentProduct) {
        document.getElementById('co-product-name').textContent = 'Producto no encontrado';
        return;
    }

    const isMayoreo = currentProduct.tipo === 'mayoreo';
    const precioFinal = getPriceForTier(currentProduct, tier);
    const total = precioFinal + (currentProduct.costoEnvio || 0);

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
    const shipEl = document.getElementById('co-shipping');
    if ((currentProduct.costoEnvio || 0) === 0) {
        shipEl.textContent = 'GRATIS';
        shipEl.classList.add('text-green-600');
    } else {
        shipEl.textContent = fmt(currentProduct.costoEnvio);
        shipEl.classList.remove('text-green-600');
    }
    document.getElementById('co-total').textContent = fmt(total);

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

// ---------- FORM SUBMIT ----------
function initForm() {
    const form = document.getElementById('checkout-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitText = document.getElementById('submit-text');

    if (!form) return;

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

        const tierActual = new URLSearchParams(window.location.search).get('tier') || new URLSearchParams(window.location.search).get('t') || 'publico';
        const precioUnitario = getPriceForTier(currentProduct, tierActual);
        const envio = currentProduct.costoEnvio || 0;
        const orderData = {
            productoId: currentProduct.id,
            nivelPrecio: tierActual,
            precioUnitario,
            envio,
            totalNumero: precioUnitario + envio,
            estado: 'nuevo',
            producto: currentProduct.nombre,
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

        const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
        const isMayoreo = currentProduct.tipo === 'mayoreo';

        const msgLines = [
            isMayoreo ? '🛒 *NUEVO PEDIDO MAYOREO - VJ.Lab*' : '🛒 *NUEVO PEDIDO - VJ.Lab*',
            '─────────────────────',
            `📦 *Producto:* ${currentProduct.nombre}`,
            `💰 *Total:* ${total}`,
            `🕐 *Fecha:* ${fecha}`,
            '─────────────────────',
            isMayoreo ? '👤 *DATOS DEL DISTRIBUIDOR*' : '👤 *DATOS DEL CLIENTE*',
            `• Nombre: ${orderData.nombre}`,
            `• Tel: ${telefono}`,
            `• Email: ${email}`,
            '─────────────────────',
            '📍 *DIRECCIÓN DE ENTREGA*',
            `• Calle: ${direccion}`,
            `• Ciudad: ${ciudad}`,
            `• C.P.: ${cp}`,
            '─────────────────────',
            '💳 Pago: por coordinar con el cliente.',
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
            submitText.textContent = '¡Pedido registrado! Abriendo WhatsApp...';
            window.location.href = waURL;
        }, 800);
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