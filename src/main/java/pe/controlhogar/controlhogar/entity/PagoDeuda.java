package pe.controlhogar.controlhogar.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "pago_deuda")
public class PagoDeuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "La deuda es obligatoria")
    @ManyToOne(optional = false)
    @JoinColumn(name = "deuda_id", nullable = false)
    private Deuda deuda;

    @NotNull(message = "La cuenta es obligatoria")
    @ManyToOne(optional = false)
    @JoinColumn(name = "cuenta_id", nullable = false)
    private Cuenta cuenta;

    @ManyToOne
    @JoinColumn(name = "medio_pago_id")
    private MedioPago medioPago;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor que cero")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal monto;

    @NotNull(message = "La fecha de pago es obligatoria")
    @Column(name = "fecha_pago", nullable = false)
    private LocalDate fechaPago;

    @Size(max = 500, message = "La observación no puede superar los 500 caracteres")
    @Column(length = 500)
    private String observacion;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public PagoDeuda() {
    }

    @PrePersist
    public void antesDeCrear() {
        LocalDateTime ahora = LocalDateTime.now();

        creadoEn = ahora;
        actualizadoEn = ahora;

        if (fechaPago == null) {
            fechaPago = LocalDate.now();
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

    public Deuda getDeuda() {
        return deuda;
    }

    public void setDeuda(Deuda deuda) {
        this.deuda = deuda;
    }

    public Cuenta getCuenta() {
        return cuenta;
    }

    public void setCuenta(Cuenta cuenta) {
        this.cuenta = cuenta;
    }

    public MedioPago getMedioPago() {
        return medioPago;
    }

    public void setMedioPago(MedioPago medioPago) {
        this.medioPago = medioPago;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
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