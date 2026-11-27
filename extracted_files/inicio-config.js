// ============================================================
// INICIO-CONFIG.JS — Contenido editable de la página de inicio.
// Lo usan index.html (para mostrar) y admin-inicio.html (para editar).
// Los textos se guardan en Firestore: inicio/main (público de lectura).
// Las fotos subidas por el administrador se guardan en inicioImg/<id>.
// Si no hay nada guardado, se usan los valores de DEFAULTS (siempre con
// fotos de TUS productos, nunca de internet).
//
// Una foto se puede indicar de 3 formas:
//   "prod:ID"   -> la foto principal de ese producto del catálogo
//   "img:ID"    -> una foto subida por el administrador (inicioImg/ID)
//   "archivo.webp" o URL -> un archivo del sitio
// ============================================================
(function () {
    const DEFAULTS = {
        banners: [
            { activo: true, etiqueta: 'PRODUCTO ESTRELLA', titulo: 'Gel Balsámico del Viejito John', texto: 'Herbolaria tradicional para el confort de tus músculos y articulaciones. Árnica, mentol, eucalipto y más.', boton: 'Comprar ahora', enlace: 'producto.html?p=gel_balsamico', imagen: 'prod:gel_balsamico', fondo: '#e6f2de', fondo2: '#c9e3bb' },
            { activo: true, etiqueta: 'LÍNEA KERATEX', titulo: 'Cuidado para tus pies y tu piel', texto: 'Pomada, gotas, talco y spray Keratex: la línea completa para el cuidado diario.', boton: 'Ver línea Keratex', enlace: 'products.html', imagen: 'prod:keratex_pomada', fondo: '#e4f0f7', fondo2: '#c5dfee' },
            { activo: true, etiqueta: 'MÁS PRESENTACIONES', titulo: 'Gel, spray, bálsamo y más', texto: 'Una presentación para cada necesidad. Envíos a todo México.', boton: 'Ver catálogo', enlace: 'products.html', imagen: 'prod:spray_viejito', fondo: '#f6eddc', fondo2: '#ecd9b2' },
            { activo: true, etiqueta: 'GEL VARI-SPA', titulo: 'Gel Vari-Spa 700 g', texto: 'Presentación grande para masaje y uso frecuente.', boton: 'Conocer más', enlace: 'producto.html?p=gel_varispa', imagen: 'prod:gel_varispa', fondo: '#efe6f5', fondo2: '#dccaea' }
        ],
        lineas: {
            titulo: 'Encuentra el producto', resaltado: 'para ti',
            items: [
                { titulo: 'Alivio muscular', imagen: 'prod:gel_balsamico', enlace: 'products.html', color: '#dcedd2' },
                { titulo: 'Keratex', imagen: 'prod:keratex_pomada', enlace: 'products.html', color: '#d6e8f3' },
                { titulo: 'Gel Vari-Spa', imagen: 'prod:gel_varispa', enlace: 'producto.html?p=gel_varispa', color: '#ecdff3' },
                { titulo: 'Johny Boy', imagen: 'prod:crema_johny_boy', enlace: 'producto.html?p=crema_johny_boy', color: '#f6e6d2' }
            ]
        },
        favoritos: {
            titulo: 'Los favoritos', resaltado: 'de todos',
            ids: ['gel_balsamico', 'spray_viejito', 'keratex_pomada', 'crema_johny_boy', 'gel_varispa', 'inhalador']
        },
        alivio: {
            titulo: 'Encuentra alivio', resaltado: 'para',
            items: [
                { titulo: 'Músculos y articulaciones', imagen: 'prod:gel_balsamico', enlace: 'products.html', color: '#dcedd2' },
                { titulo: 'Pies y piel', imagen: 'prod:keratex_pomada', enlace: 'products.html', color: '#d6e8f3' },
                { titulo: 'Masaje y relajación', imagen: 'prod:gel_varispa', enlace: 'producto.html?p=gel_varispa', color: '#ecdff3' },
                { titulo: 'Cuidado respiratorio', imagen: 'prod:inhalador', enlace: 'producto.html?p=inhalador', color: '#f6e6d2' },
                { titulo: 'Cuidado facial', imagen: 'prod:crema_johny_boy', enlace: 'producto.html?p=crema_johny_boy', color: '#f3dede' }
            ]
        },
        contienen: {
            titulo: '¿Qué contienen', resaltado: 'nuestros productos?',
            items: [
                { titulo: 'GEL BALSÁMICO', texto: 'Producto de herbolaria tradicional con árnica, mentol, eucalipto, gaultheria, clavo de olor, ajo y alcanfor. Uso tópico externo.', boton: 'Conoce más', enlace: 'producto.html?p=gel_balsamico', imagen: 'prod:gel_balsamico', color: '#d3e8c8' },
                { titulo: 'KERATEX', texto: 'Línea para el cuidado de pies y piel: pomada, gotas, talco y spray, elaborada con cuidado y calidad.', boton: 'Conoce más', enlace: 'products.html', imagen: 'prod:keratex_pomada', color: '#cde3f1' },
                { titulo: 'VARI-SPA', texto: 'Gel en presentación de 700 g para masajes y uso frecuente, con la esencia artesanal de El Viejito John.', boton: 'Conoce más', enlace: 'producto.html?p=gel_varispa', imagen: 'prod:gel_varispa', color: '#e6d6f0' }
            ]
        },
        ingredientes: {
            titulo: 'Ingredientes de origen natural',
            texto: 'Nuestra fórmula combina extractos botánicos tradicionales para el confort de tus músculos.',
            items: [
                { icono: 'spa', titulo: 'Árnica', texto: 'Planta de uso tradicional para el cuidado de la piel después de golpes y esfuerzo.' },
                { icono: 'ac_unit', titulo: 'Mentol y eucalipto', texto: 'Aportan una sensación refrescante en la zona donde se aplican.' },
                { icono: 'eco', titulo: 'Gaultheria', texto: 'Ingrediente tradicional en productos de masaje para después de la actividad física.' },
                { icono: 'bolt', titulo: 'Clavo', texto: 'Aporta su aroma característico y se usa de forma tradicional en la herbolaria.' },
                { icono: 'shield_moon', titulo: 'Ajo', texto: 'Ingrediente de uso tradicional en la herbolaria popular.' },
                { icono: 'thermostat', titulo: 'Alcanfor', texto: 'Aporta una sensación térmica reconfortante al masaje.' }
            ]
        },
        historia: {
            titulo: 'El legado de El Viejito John',
            texto1: 'Nacido de décadas de conocimiento herbolario tradicional, El Viejito John comenzó como un remedio casero buscado por toda la comunidad.',
            texto2: 'Hoy mantenemos esa misma esencia artesanal con altos estándares de calidad, para que cada envase lleve el mismo cuidado de siempre.',
            puntos: ['Ingredientes botánicos seleccionados', 'Libre de parabenos', 'No testado en animales'],
            boton: 'Conoce el catálogo', enlace: 'products.html', imagen: 'prod:balsamo_viejito'
        },
        cta: {
            titulo: '¿Listo para sentirte mejor?',
            texto: 'Pide tus productos y recíbelos en cualquier parte de México.',
            boton: 'Ir al catálogo', enlace: 'products.html'
        },
        pie: {
            descripcion: 'El bálsamo tradicional que cuida de tus músculos y articulaciones con lo mejor de la tierra.',
            aviso: 'Productos de herbolaria tradicional de uso tópico externo. No son medicamentos y su uso no reemplaza la consulta médica. En caso de irritación, suspender su uso. Mantener fuera del alcance de los niños. Lee las etiquetas.'
        }
    };

    const copia = o => JSON.parse(JSON.stringify(o));

    // Une lo guardado con los valores originales (secciones completas; las listas se reemplazan enteras)
    function combinar(guardado) {
        const r = copia(DEFAULTS);
        if (!guardado || typeof guardado !== 'object') return r;
        Object.keys(r).forEach(k => {
            const g = guardado[k];
            if (g === undefined || g === null) return;
            if (Array.isArray(r[k])) { if (Array.isArray(g)) r[k] = g; }
            else if (typeof r[k] === 'object') r[k] = { ...r[k], ...g };
        });
        return r;
    }

    async function leerGuardado() {
        try {
            if (typeof db === 'undefined' || !db) return null;
            const d = await db.collection('inicio').doc('main').get();
            return d.exists ? d.data() : null;
        } catch (e) { console.warn('No se pudo leer el contenido del inicio.', e); return null; }
    }

    // Obtiene la foto de una referencia ("prod:", "img:", archivo/URL)
    const cacheImg = {};
    async function foto(ref, productos) {
        ref = String(ref || '');
        if (!ref) return '';
        if (ref.startsWith('prod:')) {
            const p = (productos || []).find(x => x.id === ref.slice(5));
            return (p && p.imagen) || '';
        }
        if (ref.startsWith('img:')) {
            const id = ref.slice(4);
            if (cacheImg[id] !== undefined) return cacheImg[id];
            try {
                const d = await db.collection('inicioImg').doc(id).get();
                cacheImg[id] = d.exists ? (d.data().data || '') : '';
            } catch (e) { cacheImg[id] = ''; }
            return cacheImg[id];
        }
        return ref;
    }

    window.VJInicio = { DEFAULTS, copia, combinar, leerGuardado, foto, cacheImg };
})();
