# Pruebas manuales pendientes — V3

Este archivo acumula TODAS las verificaciones manuales que requieren ojos humanos en produccion/dev. Se ejecutan al final de la implementacion de todos los specs V3, en una sesion de validacion dedicada.

---

## Spec S-01 — Cookies seguridad

### Pruebas en plataforma-textil-dev.vercel.app (DEV)

- [ ] Login con email + password — cookie authjs.session-token tiene flags HttpOnly, Secure, SameSite=Lax, Path=/
- [ ] Login con Google OAuth — misma verificacion de flags
- [ ] Login con Magic Link — misma verificacion de flags
- [ ] Cookie csrf-token tiene los mismos flags en los 3 escenarios

### Pruebas en plataforma-textil.vercel.app (PRODUCCION)

- [ ] Login con email + password — cookie __Secure-authjs.session-token tiene flags correctos
- [ ] Login con Google OAuth — misma verificacion
- [ ] Login con Magic Link — misma verificacion
- [ ] Cookie __Host-authjs.csrf-token con flags correctos

### Como ejecutar

1. Abri ventana incognito (Ctrl+Shift+N)
2. Anda a la URL del ambiente
3. Logueate con el metodo correspondiente
4. F12 → Application → Cookies → selecciona el dominio
5. Verifica los flags en cada cookie
