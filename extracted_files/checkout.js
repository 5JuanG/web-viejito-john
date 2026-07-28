// ============================================================
// CHECKOUT.JS — Lógica unificada para checkout.html
// Soporta: menudeo (Viejito John + Keratex) y mayoreo
// Parámetro URL: ?p=ID_DEL_PRODUCTO  o  ?producto=ID_DEL_PRODUCTO
// ============================================================

// ---------- CONFIGURACIÓN GLOBAL ----------
const WHATSAPP_NUMERO = '5218113160143'; // ⚠️ CAMBIA ESTO por tu número real
const MERCADO_PAGO_LINK_DEFAULT = 'https://mpago.la/1ALUHtu';

// ---------- CATÁLOGO MAESTRO ----------
// Menudeo — Línea Viejito John
const CATALOGO_MENUDEO_VJ = [
    { id: 'gel_balsamico',      nombre: 'Gel Balsámico del Viejito John', descripcion: '60g — Alivio muscular', precio: 95,  ofertaActiva: false, precioOferta: 95,  imagen: 'gel_balsamico_original.png', categoria: 'viejito' },
    { id: 'gel_balsamico_700g', nombre: 'El Gel Balsámico del Viejito John', descripcion: 'Tarro Original 700g', precio: 950, ofertaActiva: true,  precioOferta: 750, imagen: 'gel_balsamico_original.png', categoria: 'viejito' },
    { id: 'gel_varispa',        nombre: 'Gel Vari-Spa (700 grs)',         descripcion: 'Masaje terapéutico',    precio: 350, ofertaActiva: false, precioOferta: 350, imagen: 'gel_varispa_700g_original.png', categoria: 'viejito' },
    { id: 'balsamo_viejito',    nombre: 'Bálsamo del Viejito John',     descripcion: 'Ungüento tradicional',  precio: 95,  ofertaActiva: false, precioOferta: 95,  imagen: 'balsamo_viejito_john_original.png', categoria: 'viejito' },
    { id: 'spray_viejito',      nombre: 'Spray del Viejito John',       descripcion: 'Alta concentración',    precio: 120, ofertaActiva: false, precioOferta: 120, imagen: 'spray_viejito_john_original.png', categoria: 'viejito' },
    { id: 'unguento_tubo',      nombre: 'Ungüento del Viejito John (Tubo)', descripcion: 'Presentación tubo',   precio: 75,  ofertaActiva: false, precioOferta: 75,  imagen: 'unguento_viejito_john_tubo_original.png', categoria: 'viejito' },
    { id: 'inhalador',          nombre: 'Inhalador Viejito John',       descripcion: 'Aroma eucalipto y mentol', precio: 45, ofertaActiva: false, precioOferta: 45,  imagen: 'inhalador_viejito_john_original.png', categoria: 'viejito' },
    { id: 'unguento_pulmonar',  nombre: 'Ungüento Pulmonar (en Tubo)',  descripcion: 'Bálsamo aromático',     precio: 80,  ofertaActiva: false, precioOferta: 80,  imagen: 'unguento_pulmonar_tubo_original.png', categoria: 'viejito' },
    { id: 'crema_johny_boy',    nombre: 'Crema Johny Boy (8g)',         descripcion: 'Cuidado facial',        precio: 60,  ofertaActiva: false, precioOferta: 60,  imagen: 'crema_johny_boy_original.png', categoria: 'viejito' }
];

// Menudeo — Línea Keratex
const CATALOGO_MENUDEO_KERATEX = [
    { id: 'keratex_pomada',  nombre: 'Keratex Pomada (8g)',        descripcion: 'Cuidado pies y piel',           precio: 60, ofertaActiva: false, precioOferta: 60, imagen: 'keratex_pomada_original.png', categoria: 'keratex' },
    { id: 'keratex_tubo',    nombre: 'Tubo Keratex Pomada',        descripcion: 'Aplicación en tubo',            precio: 80, ofertaActiva: false, precioOferta: 80, imagen: 'keratex_pomada_tubo_nueva_original.png', imagenFrente: 'keratex_pomada_tubo_nueva_original_frente.png', imagenLado: 'keratex_pomada_tubo_nueva_original_lado.png', categoria: 'keratex' },
    { id: 'keratex_gotas',   nombre: 'Solución Gotas Keratex',     descripcion: 'Gotas para uñas y piel',        precio: 60, ofertaActiva: false, precioOferta: 60, imagen: 'keratex_gotas_original.png', categoria: 'keratex' },
    { id: 'fungiderm',       nombre: 'Fungiderm Keratex Pomada (10g)', descripcion: 'Óxido de Zinc y Azufre',     precio: 60, ofertaActiva: false, precioOferta: 60, imagen: 'fungiderm_original.png', categoria: 'keratex' },
    { id: 'talco_keratex',   nombre: 'Talco Keratex (125g)',       descripcion: 'Cuidado diario pies',           precio: 95, ofertaActiva: false, precioOferta: 95, imagen: 'talco_keratex_original.png', categoria: 'keratex' },
    { id: 'spray_keratex',   nombre: 'Spray Keratex (60ml)',       descripcion: 'Spray refrescante pies',        precio: 95, ofertaActiva: false, precioOferta: 95, imagen: 'spray_keratex_original.png', categoria: 'keratex' },
    { id: 'sulfato_cobre',   nombre: 'Sulfato de Cobre (5 sobres)', descripcion: 'Limpieza profunda',            precio: 35, ofertaActiva: false, precioOferta: 35, imagen: 'sulfato_original.png', categoria: 'keratex' }
];

// Mayoreo
const CATALOGO_MAYOREO = [
    { id: 'keratex_pomada_200',   nombre: 'Keratex Pomada (Caja de 200 pzas)',              descripcion: 'Caja cerrada con 200 pomadas de 8g c/u',                precioNormal: 12000, ofertaActiva: true, precioOferta: 8000,  textoPromo: 'Mayoreo Especial', imagen: 'keratex_pomada_caja_200_original.png',    linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'keratex_gotas_100',    nombre: 'Solución Gotas Keratex (Caja de 100 pzas)',      descripcion: 'Caja cerrada con 100 soluciones gotas',                precioNormal: 6000,  ofertaActiva: true, precioOferta: 4000,  textoPromo: 'Mayoreo Especial', imagen: 'keratex_gotas_caja_100_original.png',     linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'gel_balsamico_12',     nombre: 'Gel Balsámico Viejito John (Caja de 12 pzas)',   descripcion: 'Caja cerrada con 12 tarros grandes de 700g c/u',       precioNormal: 11400, ofertaActiva: true, precioOferta: 7200,  textoPromo: 'Mayoreo Especial', imagen: 'gel_balsamico_original.png',              linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'spray_viejito_24',     nombre: 'Spray del Viejito John (Caja de 24 pzas)',       descripcion: 'Caja cerrada con 24 atomizadores',                     precioNormal: 2880,  ofertaActiva: true, precioOferta: 2160,  textoPromo: 'Mayoreo Especial', imagen: 'spray_viejito_john_original.png',       linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'balsamo_viejito_24',   nombre: 'Bálsamo del Viejito John (Caja de 24 pzas)',     descripcion: 'Caja cerrada con 24 tarros de bálsamo corporal',       precioNormal: 2280,  ofertaActiva: true, precioOferta: 1680,  textoPromo: 'Mayoreo Especial', imagen: 'balsamo_viejito_john_original.png',     linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'crema_johny_boy_50',   nombre: 'Crema Johny Boy (Caja de 50 pzas)',              descripcion: 'Caja cerrada con 50 cremas de 8g c/u',                precioNormal: 3000,  ofertaActiva: true, precioOferta: 2000,  textoPromo: 'Mayoreo Especial', imagen: 'crema_johny_boy_original.png',          linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'gel_varispa_12',       nombre: 'Gel Vari-Spa 700g (Caja de 12 pzas)',            descripcion: 'Caja cerrada con 12 tarros de 700g de gel de masaje',  precioNormal: 4200,  ofertaActiva: true, precioOferta: 3000,  textoPromo: 'Mayoreo Especial', imagen: 'gel_varispa_700g_original.png',         linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'keratex_tubo_50',      nombre: 'Tubo Keratex Pomada (Caja de 50 pzas)',          descripcion: 'Caja cerrada con 50 tubos de pomada queratolítica',     precioNormal: 4000,  ofertaActiva: true, precioOferta: 2800,  textoPromo: 'Mayoreo Especial', imagen: 'keratex_pomada_tubo_nueva_original.png', linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'inhalador_viejito_50', nombre: 'Inhalador Viejito John (Caja de 50 pzas)',       descripcion: 'Caja cerrada con 50 inhaladores aromáticos',           precioNormal: 2250,  ofertaActiva: true, precioOferta: 1600,  textoPromo: 'Mayoreo Especial', imagen: 'inhalador_viejito_john_original.png',   linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'unguento_viejito_50',  nombre: 'Ungüento del Viejito John Tubo (Caja de 50 pzas)', descripcion: 'Caja cerrada con 50 tubos de ungüento de masaje',      precioNormal: 3750,  ofertaActiva: true, precioOferta: 2600,  textoPromo: 'Mayoreo Especial', imagen: 'unguento_viejito_john_tubo_original.png', linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'unguento_pulmonar_50', nombre: 'Ungüento Pulmonar en Tubo (Caja de 50 pzas)',    descripcion: 'Caja cerrada con 50 tubos de ungüento balsámico',      precioNormal: 4000,  ofertaActiva: true, precioOferta: 2800,  textoPromo: 'Mayoreo Especial', imagen: 'unguento_pulmonar_tubo_original.png',   linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'talco_keratex_24',     nombre: 'Talco Keratex 125g (Caja de 24 pzas)',           descripcion: 'Caja cerrada con 24 envases de talco desodorante',     precioNormal: 2280,  ofertaActiva: true, precioOferta: 1680,  textoPromo: 'Mayoreo Especial', imagen: 'talco_keratex_original.png',            linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 },
    { id: 'fungiderm_keratex_50', nombre: 'Fungiderm Keratex Pomada (Caja de 50 pzas)',     descripcion: 'Caja cerrada con 50 pomadas de 10g c/u',               precioNormal: 3000,  ofertaActiva: true, precioOferta: 2200,  textoPromo: 'Mayoreo Especial', imagen: 'fungiderm_original.png',                linkMercadoPago: 'https://mpago.la/1ALUHtu', costoEnvio: 0 }
];

// ---------- FUNCIONES AUXILIARES ----------
const fmt = n => '$' + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function mergeLocalStorage() {
    try {
        const storedMenudeo = JSON.parse(localStorage.getItem('vj_precios_menudeo'));
        if (storedMenudeo && Array.isArray(storedMenudeo)) {
            storedMenudeo.forEach(s => {
                const p = CATALOGO_MENUDEO_VJ.find(x => x.id === s.id) || CATALOGO_MENUDEO_KERATEX.find(x => x.id === s.id);
                if (p) { p.precio = s.precio; p.ofertaActiva = s.ofertaActiva; p.precioOferta = s.precioOferta; }
            });
        }
    } catch(e) {}
    try {
        const storedMayoreo = JSON.parse(localStorage.getItem('vj_precios_mayoreo'));
        if (storedMayoreo && Array.isArray(storedMayoreo)) {
            storedMayoreo.forEach(s => {
                const p = CATALOGO_MAYOREO.find(x => x.id === s.id);
                if (p) { p.precioNormal = s.precio; p.ofertaActiva = s.ofertaActiva; p.precioOferta = s.precioOferta; }
            });
        }
    } catch(e) {}
}

function findProduct(pid) {
    let p = CATALOGO_MENUDEO_VJ.find(x => x.id === pid);
    if (p) return { ...p, tipo: 'menudeo', origen: 'checkout-menudeo' };
    p = CATALOGO_MENUDEO_KERATEX.find(x => x.id === pid);
    if (p) return { ...p, tipo: 'menudeo', origen: 'checkout-menudeo' };
    p = CATALOGO_MAYOREO.find(x => x.id === pid);
    if (p) return { ...p, tipo: 'mayoreo', origen: 'checkout-mayoreo' };
    return null;
}

// ---------- RENDERIZADO ----------
let currentProduct = null;
let mercadoPagoLink = MERCADO_PAGO_LINK_DEFAULT;

function renderProduct() {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('p') || params.get('producto') || 'gel_balsamico_700g';

    mergeLocalStorage();
    currentProduct = findProduct(pid);

    if (!currentProduct) {
        document.getElementById('co-product-name').textContent = 'Producto no encontrado';
        return;
    }

    const isMayoreo = currentProduct.tipo === 'mayoreo';
    const precioFinal = isMayoreo
        ? (currentProduct.ofertaActiva ? currentProduct.precioOferta : currentProduct.precioNormal)
        : (currentProduct.ofertaActiva ? currentProduct.precioOferta : currentProduct.precio);
    const total = precioFinal + (currentProduct.costoEnvio || 0);
    mercadoPagoLink = currentProduct.linkMercadoPago || MERCADO_PAGO_LINK_DEFAULT;

    document.title = `Pago Seguro - ${currentProduct.nombre} | VJ.Lab`;
    document.getElementById('summary-title').textContent = isMayoreo ? 'Pedido de Mayoreo' : 'Resumen del Pedido';
    document.getElementById('co-product-name').textContent = currentProduct.nombre;
    document.getElementById('co-product-desc').textContent = currentProduct.descripcion;

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

// ---------- MÉTODOS DE PAGO ----------
function initPaymentMethods() {
    const radios = document.querySelectorAll('input[name="payment"]');
    const ccDetails = document.getElementById('cc-details');
    const ccInputs = ccDetails ? ccDetails.querySelectorAll('input') : [];

    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-option').forEach(el => {
                el.classList.remove('border-primary', 'bg-surface-container-low', 'border-2');
                el.classList.add('border-outline-variant', 'border');
            });
            const parent = e.target.closest('.payment-option');
            if (parent) {
                parent.classList.add('border-primary', 'bg-surface-container-low', 'border-2');
                parent.classList.remove('border-outline-variant', 'border');
            }
            if (e.target.value === 'tarjeta') {
                ccDetails?.classList.remove('hidden');
                ccInputs.forEach(i => i.setAttribute('required', 'true'));
            } else {
                ccDetails?.classList.add('hidden');
                ccInputs.forEach(i => i.removeAttribute('required'));
            }
        });
    });
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

        const orderData = {
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
            '⚠️ Cliente fue enviado a Mercado Pago para completar el pago.',
        ];
        const msg = msgLines.join('%0A');
        const waURL = `https://wa.me/${WHATSAPP_NUMERO}?text=${msg}`;

        submitBtn.disabled = true;
        submitIcon.textContent = 'hourglass_empty';
        submitIcon.classList.add('animate-spin');
        submitText.textContent = 'Preparando pedido...';

        setTimeout(() => {
            window.open(waURL, '_blank');
            submitText.textContent = 'Redirigiendo a Mercado Pago...';
            setTimeout(() => {
                window.location.href = mercadoPagoLink;
            }, 1500);
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
    initPaymentMethods();
    initForm();
    initFormFocus();
});