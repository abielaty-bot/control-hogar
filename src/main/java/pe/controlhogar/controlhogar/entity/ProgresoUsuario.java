package pe.controlhogar.controlhogar.entity;

import java.time.LocalDate;
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
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "progreso_usuario", uniqueConstraints = {
        @UniqueConstraint(name = "uk_progreso_usuario", columnNames = "usuario_id")
})
public class ProgresoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "El usuario es obligatorio")
    @OneToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private Usuario usuario;

    @NotNull(message = "Los puntos totales son obligatorios")
    @Min(value = 0, message = "Los puntos totales no pueden ser negativos")
    @Column(name = "puntos_totales", nullable = false)
    private Integer puntosTotales = 0;

    @NotNull(message = "El nivel es obligatorio")
    @Min(value = 1, message = "El nivel mínimo es 1")
    @Column(nullable = false)
    private Integer nivel = 1;

    @NotNull(message = "La racha actual es obligatoria")
    @Min(value = 0, message = "La racha actual no puede ser negativa")
    @Column(name = "racha_actual", nullable = false)
    private Integer rachaActual = 0;

    @NotNull(message = "La mejor racha es obligatoria")
    @Min(value = 0, message = "La mejor racha no puede ser negativa")
    @Column(name = "mejor_racha", nullable = false)
    private Integer mejorRacha = 0;

    @Column(name = "ultima_actividad")
    private LocalDate ultimaActividad;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public ProgresoUsuario() {
    }

    @PrePersist
    public void antesDeCrear() {
        LocalDateTime ahora = LocalDateTime.now();

        creadoEn = ahora;
        actualizadoEn = ahora;

        if (puntosTotales == null) {
            puntosTotales = 0;
        }

        if (nivel == null || nivel < 1) {
            nivel = 1;
        }

        if (rachaActual == null) {
            rachaActual = 0;
        }

        if (mejorRacha == null) {
            mejorRacha = 0;
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

    public Integer getPuntosTotales() {
        return puntosTotales;
    }

    public void setPuntosTotales(Integer puntosTotales) {
        this.puntosTotales = puntosTotales;
    }

    public Integer getNivel() {
        return nivel;
    }

    public void setNivel(Integer nivel) {
        this.nivel = nivel;
    }

    public Integer getRachaActual() {
        return rachaActual;
    }

    public void setRachaActual(Integer rachaActual) {
        this.rachaActual = rachaActual;
    }

    public Integer getMejorRacha() {
        return mejorRacha;
    }

    public void setMejorRacha(Integer mejorRacha) {
        this.mejorRacha = mejorRacha;
    }

    public LocalDate getUltimaActividad() {
        return ultimaActividad;
    }

    public void setUltimaActividad(LocalDate ultimaActividad) {
        this.ultimaActividad = ultimaActividad;
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