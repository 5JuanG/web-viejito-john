Mercado Pago - herramienta de pruebas (sandbox)

Esto es una utilidad mínima para crear una preferencia de pago en modo sandbox y obtener el `init_point` (URL) que puedes usar para probar redirecciones desde las páginas de checkout.

Requisitos

- Node.js 16+ y npm
- Token de prueba (sandbox) de Mercado Pago (colócalo en `.env` como `MP_ACCESS_TOKEN`).

Instalación

```bash
cd mercadopago
npm install
cp .env.example .env
# Edita .env y pega tu MP_ACCESS_TOKEN de pruebas
```

Crear una preferencia de prueba

```bash
# Sintaxis: node create_preference.js [titulo] [cantidad] [precio_unitario]
node create_preference.js "Gel Balsámico" 1 95
```

Salida esperada

- `id`: id de la preferencia
- `init_point` y/o `sandbox_init_point`: URL para redirigir al comprador (usa la `sandbox_init_point` si tu cuenta sandbox la provee).

Uso en el sitio

- Copia la URL `init_point`/`sandbox_init_point` y pégala en el valor `MERCADO_PAGO_LINK` dentro de las páginas de checkout (`extracted_files/checkout*.html`) para probar la compra.

Notas

- Este script crea una preferencia mínima con un solo artículo. Para integraciones reales conviene generar la preferencia desde un backend que reciba los datos del carrito del cliente.
- No subas credenciales reales al repositorio.
