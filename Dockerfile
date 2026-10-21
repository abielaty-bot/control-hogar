# ===== Etapa 1: compilar el proyecto con Maven y Java 21 =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

# ===== Etapa 2: imagen ligera solo con el JRE y el .jar =====
FROM eclipse-temurin:21-jre
# JasperReports usa AWT para dibujar el texto de los PDF y necesita las
# fuentes del sistema; la imagen ligera del JRE no las trae y los
# reportes devolvian error 500 en produccion.
RUN apt-get update \
    && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-XX:MaxRAMPercentage=70.0", "-jar", "app.jar"]
