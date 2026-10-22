# Control Hogar

Control Hogar es una API REST para gestionar información económica doméstica.

## Demo en vivo

- **Aplicación web:** https://heartfelt-salmiakki-d68dcd.netlify.app
- **API:** https://control-hogar.onrender.com (salud: `GET /api/salud`)

Para probarla, crea tu cuenta desde la opción **Crear cuenta** de la
propia aplicación. El despliegue es continuo desde la rama `main`.

## Arquitectura en producción

| Pieza | Tecnología | Dónde corre |
|---|---|---|
| Frontend SPA | Angular 20 + TypeScript | Netlify |
| Backend API REST | Spring Boot 4 · Java 21 | Render (Docker) |
| Base de datos (producción) | PostgreSQL | Neon |
| Base de datos (desarrollo) | MySQL (`controlhogar`) | Local |

## Mapa del sílabo

| Tema | Dónde está en el proyecto |
|---|---|
| 1. JPA (entidades y relaciones) | `entity/` — 18 entidades, 28 relaciones |
| 2. Maven | `pom.xml`, `mvnw` |
| 3. Git / GitHub | Historial de este repositorio |
| 4. Spring Boot y perfiles | `application.properties`, `application-dev.properties`, `application-prod.properties` |
| 5. Spring Data JPA (JPQL, paginación) | `repository/` — 18 repositorios `@Repository` |
| 6. Spring Web MVC (estereotipos) | `controller/` (8 `@RestController`), `service/` (8 `@Service`), `repository/` |
| 7. Spring Security | `security/` — admin en memoria + autenticación personalizada con BCrypt |
| 8. Spring RESTful | 42 endpoints en `controller/` |
| 9. JasperReports | `reportes/movimientos_por_categoria.jrxml` y `GET /api/reportes/*/pdf` |
| 10. Despliegue | `Dockerfile`, `render.yaml`, Netlify |
| 11. Angular y TypeScript | `frontend/src/app/` |
| 12. Componentes Angular | 12 componentes + servicios en `frontend/src/app/pages/` y `core/` |

## Tecnologías utilizadas

- Java 21
- Spring Boot 4
- Maven
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Jakarta Validation
- MySQL
- JasperReports Library
- JSON
- Git y GitHub
- Thunder Client

## Arquitectura

El proyecto utiliza arquitectura por capas:

Controller -> Service -> ServiceImpl -> Repository -> JPA/Hibernate -> MySQL

## Modelo de datos

El proyecto cuenta con:

- 18 entidades JPA
- 18 tablas generadas automáticamente
- 18 repositorios
- 28 claves foráneas
- Relaciones uno a uno y muchos a uno

Las tablas se generan automáticamente desde las entidades Java mediante JPA e Hibernate.

## CRUD implementados

### Usuario

- POST `/api/usuarios`
- GET `/api/usuarios` (paginado: `?page=0&size=10&sort=nombres,asc`)
- GET `/api/usuarios/buscar?texto={nombre}` (consulta JPQL)
- GET `/api/usuarios/{id}`
- PUT `/api/usuarios/{id}`
- DELETE `/api/usuarios/{id}`

### Categoria

- POST `/api/categorias`
- GET `/api/categorias?usuarioId={id}` (paginado: `&page=0&size=10&sort=nombre,asc`)
- GET `/api/categorias/{id}`
- PUT `/api/categorias/{id}`
- DELETE `/api/categorias/{id}`

La eliminación de categorías es lógica. El registro permanece almacenado en MySQL con el campo `activo` en `false`.

## Reporte con JasperReports

El sistema genera un reporte PDF con los usuarios activos mediante JasperReports Library.

Endpoint:

`GET /api/reportes/usuarios/pdf`

Archivo generado:

`reporte-usuarios.pdf`

## Base de datos

Nombre de la base de datos:

`controlhogar`

La configuración de conexión se encuentra en:

`src/main/resources/application.properties`

## Compilación y pruebas

Para limpiar, compilar y ejecutar las pruebas:

`.\mvnw.cmd clean test`

Resultado esperado:

- 18 repositorios JPA encontrados
- 1 prueba ejecutada
- 0 errores
- BUILD SUCCESS

## Ejecución

Para iniciar la aplicación:

`.\mvnw.cmd spring-boot:run`

La API quedará disponible en:

`http://localhost:8080`

## Estado actual

- Modelo de 18 entidades terminado
- 18 tablas generadas por Hibernate
- 28 claves foráneas
- 18 repositorios JPA
- CRUD de Usuario terminado
- CRUD de Categoria terminado
- Eliminación lógica comprobada
- Reporte PDF con JasperReports implementado
- Conexión con MySQL funcionando
- Compilación y pruebas exitosas

## Funcionalidades que figuraban como pendientes (ya implementadas)

- Inicio de sesión ✔
- Spring Security ✔
- Cifrado de contraseñas con BCrypt ✔
- CRUD completos para las demás entidades ✔
- Interfaz web ✔
- Autenticación mediante JWT: no implementada por diseño; la API usa HTTP Basic sin estado (Tema 7)

## Consultas JPQL y perfiles (Bloque 1)

- Consulta JPQL de agregacion con DTO: `GET /api/reportes/movimientos/total-por-categoria?usuarioId={id}&tipo=GASTO` devuelve el total y la cantidad de movimientos por categoria.
- Perfiles de Spring: `dev` (MySQL local, activo por defecto) y `prod` (variables de entorno `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, pensado para el despliegue en Render). Se elige con la variable `SPRING_PROFILES_ACTIVE`.

## Seguridad con Spring Security (Bloque 2 - Tema 7)

La API esta protegida con Spring Security y autenticacion HTTP Basic:

- Registro publico: `POST /api/usuarios` (no requiere autenticacion).
- Todo lo demas requiere enviar el correo y la contrasena del usuario (Basic Auth, por ejemplo en Thunder Client, pestana Auth -> Basic).
- Las contrasenas se guardan cifradas con **BCrypt** en la columna `password_hash`.
- La autenticacion es personalizada: se valida contra la tabla `usuario` (clase `UsuarioDetailsService`); los usuarios inactivos no pueden ingresar.
- Administrador en memoria: usuario `admin`, contrasena `admin123`, rol ADMIN.

Nota: los usuarios creados antes de este bloque tienen su contrasena sin cifrar y no podran autenticarse; hay que volver a registrarlos o actualizar su contrasena.

## CRUD del Bloque 3

Siguiendo el mismo patron de Usuario y Categoria se agregaron:

- **Movimientos** `/api/movimientos`: CRUD completo con borrado logico (campo `eliminadoEn`). Listado paginado por usuario.
- **Cuentas** `/api/cuentas`: CRUD completo; el nombre es unico por usuario y el borrado es logico (`activo`).
- **Presupuestos** `/api/presupuestos`: un presupuesto por usuario, anio y mes; detalle por categoria en `/api/presupuestos/{id}/detalle` (la categoria debe ser del mismo usuario).
- **Deudas** `/api/deudas`: CRUD de deudas y pagos en `/api/deudas/{id}/pagos`. Registrar un pago descuenta el saldo pendiente y marca la deuda como PAGADA al llegar a cero; no se puede pagar mas que el saldo ni eliminar una deuda con pagos.

## Reporte con Jasper Studio (Bloque 4 - Tema 9)

Nuevo reporte disenado como plantilla `.jrxml` (editable en Jaspersoft Studio), en `src/main/resources/reportes/movimientos_por_categoria.jrxml`:

- `GET /api/reportes/movimientos/pdf?usuarioId=1&tipo=GASTO` descarga el PDF.
- Incluye la tabla de totales por categoria (consulta JPQL del Bloque 1), fila de **totales generales** (resumen) y un **grafico circular** con la distribucion por categoria (dependencia `jasperreports-charts`).
- El reporte anterior de usuarios, construido por codigo Java, se mantiene como ejemplo de la otra forma de trabajar con JasperReports.

## Despliegue en Render (Bloque 5 - Tema 10)

El silabo pedia Heroku, pero Heroku exige tarjeta; se despliega en **Render** usando Docker:

1. En [render.com](https://render.com): **New + Web Service**, conectar el repositorio de GitHub y elegir la rama `main`. Render detecta el `Dockerfile` (o usar el `render.yaml` como Blueprint).
2. Crear la base de datos. Dos opciones:
   - **PostgreSQL de Render (recomendado, todo en un solo lugar):** New + PostgreSQL (plan Free). En su panel, seccion Connections, tomar Host, Port, Database, Username y Password.
   - **MySQL externo** (Clever Cloud, TiDB Cloud, etc.): crear la BD y tomar sus datos de conexion.
3. Variables de entorno del servicio web:
   - `SPRING_PROFILES_ACTIVE` = `prod`
   - `DB_URL` = `jdbc:postgresql://<host>:<port>/<database>` (o `jdbc:mysql://<host>:<port>/<database>` si es MySQL)
   - `DB_USERNAME` y `DB_PASSWORD` segun la BD creada
   - `DB_DRIVER` = `org.postgresql.Driver` (para MySQL no hace falta: el valor por defecto es el de MySQL)
4. **Create Web Service** y esperar el primer despliegue (compila con el Dockerfile). La app queda en `https://control-hogar.onrender.com` (el nombre puede variar).

Notas: las tablas se crean solas al arrancar (`ddl-auto=update`), pero la BD arranca vacia: registrar un usuario nuevo con `POST /api/usuarios`. Ademas, el `pom.xml` declara los repositorios de Jaspersoft porque `jasperreports-pdf` usa una version de OpenPDF que no esta en Maven Central; sin eso, cualquier compilacion limpia (como la de Docker) falla.

## Frontend Angular (Bloque 6 - Temas 11 y 12)

SPA en Angular (componentes standalone) dentro de la carpeta `frontend/`, que consume la API REST:

- **Login** con el correo y la contrasena del usuario (HTTP Basic contra Spring Security), guard de rutas e **interceptor** que agrega el encabezado `Authorization` a cada peticion.
- **Paginas**: Inicio (tarjetas de ingresos/gastos/balance y recientes), Movimientos (con paginacion), Categorias, Cuentas, Presupuestos (con su detalle por categoria), Deudas (con registro de pagos) y Reportes (totales por categoria y descarga del PDF de Jasper).
- El backend habilito **CORS** para `http://localhost:4200` en `SecurityConfig`.

Para ejecutarlo (requiere Node.js 20+):

```
cd frontend
npm install
npm start
```

y abrir `http://localhost:4200` con el backend corriendo en el puerto 8080. La URL de la API se configura en `frontend/src/environments/environment.ts` (desarrollo) y `environment.prod.ts` (produccion, con la URL de Render del Bloque 5).

## Continuación del proyecto (Bloques 7 a 15)

- **Bloque 7:** endpoint público de salud `GET /api/salud` y monitoreo programado con GitHub Actions que lo verifica periódicamente en horario útil.
- **Bloque 8:** rediseño visual del frontend: tema oscuro violeta, panel con KPIs, gráfico de ingresos vs. gastos, medidor de presupuesto y diseño adaptable (PC, tablet y celular).
- **Bloque 9:** el endpoint de salud también valida la conexión con la base de datos (`SELECT 1`); la espera máxima del ingreso quedó en 15 segundos.
- **Bloque 10:** interactividad del panel: tooltip con valores en el gráfico, rosca de presupuesto interactiva, contadores animados y efectos al pasar el mouse.
- **Bloque 11:** login endurecido (mostrar/ocultar contraseña, aviso de Bloq Mayús, validación por campo, `autocomplete`, página `/recuperar`), cabeceras de seguridad del sitio (`_headers`: CSP, X-Frame-Options, HSTS) y límite de intentos en el servidor con registro de fallos.
- **Bloque 12:** corrección de compatibilidad entre la CSP y la carga de estilos de Angular (`inlineCritical` desactivado).
- **Bloque 13:** medidor de progreso al generar el PDF, con mensajes por etapas, tope de 45 segundos y confirmación de descarga.
- **Bloque 14:** bloqueo progresivo según OWASP (1, 5, 15 y 30 minutos) con cabecera `Retry-After` y cuenta regresiva visible en el login.
- **Bloque 15:** casilla «Mantener mi sesión iniciada»: sesión persistente en `localStorage` o temporal en `sessionStorage`, a elección del usuario.

