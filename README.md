# Sitio Web El Gel del Viejito John

Este proyecto contiene la versión estática de la app en `extracted_files/`.

## Estructura

- `extracted_files/`: contenido principal del sitio web.
- `firebase.json`: configuración de Firebase Hosting.
- `.firebaserc`: proyecto Firebase por defecto.
- `.gitignore`: archivos y carpetas que no deben subirse.

## Subir a GitHub

1. Crea un repositorio nuevo en GitHub.
2. En tu terminal dentro de `c:\Users\Propietario\Desktop\diseño de web vj` ejecuta:

```bash
git remote add origin <URL_DEL_REPO>
git branch -M main
git push -u origin main
```

3. Si quieres usar `master` en lugar de `main`:

```bash
git push -u origin master
```

## Despliegue en Firebase Hosting

1. Reemplaza `YOUR_FIREBASE_PROJECT_ID` en `.firebaserc` por el ID de tu proyecto Firebase.
2. Si aún no tienes proyecto, crea uno en la consola de Firebase o avísame para crear uno desde la CLI.
3. Desde el directorio raíz del proyecto ejecuta:

```bash
firebase deploy --only hosting
```

4. El contenido se servirá desde la carpeta `extracted_files/`.

## Nota

- Ya hay un repositorio git local inicializado con los archivos del app.
- Para subir a GitHub se necesita configurar un remoto.
- Para desplegar en Firebase se necesita un proyecto Firebase válido.
