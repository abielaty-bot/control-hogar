# Control Hogar

Control Hogar es una API REST para gestionar información económica doméstica.

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
- GET `/api/usuarios`
- GET `/api/usuarios/{id}`
- PUT `/api/usuarios/{id}`
- DELETE `/api/usuarios/{id}`

### Categoria

- POST `/api/categorias`
- GET `/api/categorias?usuarioId={id}`
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

## Funcionalidades pendientes

- Inicio de sesión
- Spring Security
- Cifrado de contraseñas con BCrypt
- Autenticación mediante JWT
- CRUD completos para las demás entidades
- Interfaz web
