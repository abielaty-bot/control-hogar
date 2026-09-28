package pe.controlhogar.controlhogar.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(
        name = "ajuste_usuario",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ajuste_usuario_usuario",
                        columnNames = "usuario_id"
                )
        }
)
public class AjusteUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El usuario es obligatorio")
    @OneToOne(optional = false)
    @JoinColumn(
            name = "usuario_id",
            nullable = false,
            unique = true
    )
    private Usuario usuario;

    @NotBlank(message = "La moneda principal es obligatoria")
    @Size(max = 3, message = "La moneda debe tener como máximo 3 caracteres")
    @Column(name = "moneda_principal", nullable = false, length = 3)
    private String monedaPrincipal = "PEN";

    @NotBlank(message = "La zona horaria es obligatoria")
    @Size(max = 50, message = "La zona horaria no puede superar los 50 caracteres")
    @Column(name = "zona_horaria", nullable = false, length = 50)
    private String zonaHoraria = "America/Lima";

    @NotBlank(message = "El idioma es obligatorio")
    @Size(max = 10, message = "El idioma no puede superar los 10 caracteres")
    @Column(nullable = false, length = 10)
    private String idioma = "es-PE";

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public AjusteUsuario() {
    }

    @PrePersist
    public void antesDeCrear() {
        LocalDateTime ahora = LocalDateTime.now();

        creadoEn = ahora;
        actualizadoEn = ahora;

        if (monedaPrincipal == null || monedaPrincipal.isBlank()) {
            monedaPrincipal = "PEN";
        }

        if (zonaHoraria == null || zonaHoraria.isBlank()) {
            zonaHoraria = "America/Lima";
        }

        if (idioma == null || idioma.isBlank()) {
            idioma = "es-PE";
        }
    }

    @PreUpdate
    public void antesDeActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getMonedaPrincipal() {
        return monedaPrincipal;
    }

    public void setMonedaPrincipal(String monedaPrincipal) {
        this.monedaPrincipal = monedaPrincipal;
    }

    public String getZonaHoraria() {
        return zonaHoraria;
    }

    public void setZonaHoraria(String zonaHoraria) {
        this.zonaHoraria = zonaHoraria;
    }

    public String getIdioma() {
        return idioma;
    }

    public void setIdioma(String idioma) {
        this.idioma = idioma;
    }

    public LocalDateTime getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(LocalDateTime creadoEn) {
        this.creadoEn = creadoEn;
    }

    public LocalDateTime getActualizadoEn() {
        return actualizadoEn;
    }

    public void setActualizadoEn(LocalDateTime actualizadoEn) {
        this.actualizadoEn = actualizadoEn;
    }
}