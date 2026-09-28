package pe.controlhogar.controlhogar.service.impl;

import java.awt.Color;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRMapCollectionDataSource;
import net.sf.jasperreports.engine.design.JRDesignBand;
import net.sf.jasperreports.engine.design.JRDesignExpression;
import net.sf.jasperreports.engine.design.JRDesignField;
import net.sf.jasperreports.engine.design.JRDesignSection;
import net.sf.jasperreports.engine.design.JRDesignStaticText;
import net.sf.jasperreports.engine.design.JRDesignTextField;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.type.HorizontalTextAlignEnum;
import net.sf.jasperreports.engine.type.ModeEnum;
import net.sf.jasperreports.engine.type.OrientationEnum;
import net.sf.jasperreports.engine.type.VerticalTextAlignEnum;
import pe.controlhogar.controlhogar.entity.Usuario;
import pe.controlhogar.controlhogar.repository.UsuarioRepository;
import pe.controlhogar.controlhogar.service.ReporteService;

@Service
public class ReporteServiceImpl implements ReporteService {

    private final UsuarioRepository usuarioRepository;

    public ReporteServiceImpl(
            UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public byte[] generarReporteUsuariosPdf() {
        try {
            List<Usuario> usuarios = usuarioRepository
                    .findByActivoTrueOrderByNombresAsc();

            List<Map<String, ?>> datos = convertirUsuarios(usuarios);

            JasperDesign diseno = crearDisenoReporte();

            JasperReport reporteCompilado = JasperCompileManager.compileReport(diseno);

            JRMapCollectionDataSource fuenteDatos = new JRMapCollectionDataSource(datos);

            Map<String, Object> parametros = new HashMap<>();

            JasperPrint reporteLleno = JasperFillManager.fillReport(
                    reporteCompilado,
                    parametros,
                    fuenteDatos);

            return JasperExportManager
                    .exportReportToPdf(reporteLleno);

        } catch (JRException excepcion) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo generar el reporte PDF de usuarios",
                    excepcion);
        }
    }

    private List<Map<String, ?>> convertirUsuarios(
            List<Usuario> usuarios) {
        List<Map<String, ?>> datos = new ArrayList<>();

        for (Usuario usuario : usuarios) {
            Map<String, Object> fila = new HashMap<>();

            fila.put(
                    "id",
                    usuario.getId());

            fila.put(
                    "nombres",
                    valorSeguro(usuario.getNombres()));

            fila.put(
                    "apellidoPaterno",
                    valorSeguro(
                            usuario.getApellidoPaterno()));

            fila.put(
                    "apellidoMaterno",
                    valorSeguro(
                            usuario.getApellidoMaterno()));

            fila.put(
                    "correo",
                    valorSeguro(usuario.getCorreo()));

            fila.put(
                    "telefono",
                    valorSeguro(usuario.getTelefono()));

            fila.put(
                    "estado",
                    Boolean.TRUE.equals(usuario.getActivo())
                            ? "ACTIVO"
                            : "INACTIVO");

            datos.add(fila);
        }

        return datos;
    }

    private String valorSeguro(String valor) {
        return valor == null ? "" : valor;
    }

    private JasperDesign crearDisenoReporte()
            throws JRException {

        JasperDesign diseno = new JasperDesign();

        diseno.setName("reporte_usuarios");

        diseno.setPageWidth(842);
        diseno.setPageHeight(595);

        diseno.setOrientation(
                OrientationEnum.LANDSCAPE);

        diseno.setLeftMargin(30);
        diseno.setRightMargin(30);
        diseno.setTopMargin(30);
        diseno.setBottomMargin(30);

        diseno.setColumnWidth(782);

        agregarCampo(
                diseno,
                "id",
                Long.class);

        agregarCampo(
                diseno,
                "nombres",
                String.class);

        agregarCampo(
                diseno,
                "apellidoPaterno",
                String.class);

        agregarCampo(
                diseno,
                "apellidoMaterno",
                String.class);

        agregarCampo(
                diseno,
                "correo",
                String.class);

        agregarCampo(
                diseno,
                "telefono",
                String.class);

        agregarCampo(
                diseno,
                "estado",
                String.class);

        configurarTitulo(diseno);
        configurarEncabezado(diseno);
        configurarDetalle(diseno);
        configurarPiePagina(diseno);

        return diseno;
    }

    private void agregarCampo(
            JasperDesign diseno,
            String nombre,
            Class<?> tipo) throws JRException {

        JRDesignField campo = new JRDesignField();

        campo.setName(nombre);
        campo.setValueClass(tipo);

        diseno.addField(campo);
    }

    private void configurarTitulo(
            JasperDesign diseno) {
        JRDesignBand bandaTitulo = new JRDesignBand();

        bandaTitulo.setHeight(60);

        JRDesignStaticText titulo = new JRDesignStaticText();

        titulo.setX(0);
        titulo.setY(0);
        titulo.setWidth(782);
        titulo.setHeight(32);

        titulo.setText("CONTROL HOGAR");
        titulo.setFontSize(20f);
        titulo.setBold(true);

        titulo.setForecolor(
                new Color(39, 84, 138));

        titulo.setHorizontalTextAlign(
                HorizontalTextAlignEnum.CENTER);

        titulo.setVerticalTextAlign(
                VerticalTextAlignEnum.MIDDLE);

        JRDesignStaticText subtitulo = new JRDesignStaticText();

        subtitulo.setX(0);
        subtitulo.setY(34);
        subtitulo.setWidth(782);
        subtitulo.setHeight(20);

        subtitulo.setText(
                "Reporte de usuarios activos");

        subtitulo.setFontSize(12f);

        subtitulo.setHorizontalTextAlign(
                HorizontalTextAlignEnum.CENTER);

        subtitulo.setVerticalTextAlign(
                VerticalTextAlignEnum.MIDDLE);

        bandaTitulo.addElement(titulo);
        bandaTitulo.addElement(subtitulo);

        diseno.setTitle(bandaTitulo);
    }

    private void configurarEncabezado(
            JasperDesign diseno) {
        JRDesignBand encabezado = new JRDesignBand();

        encabezado.setHeight(28);

        agregarEncabezado(
                encabezado,
                "ID",
                0,
                40);

        agregarEncabezado(
                encabezado,
                "Nombres",
                40,
                140);

        agregarEncabezado(
                encabezado,
                "Apellido paterno",
                180,
                125);

        agregarEncabezado(
                encabezado,
                "Apellido materno",
                305,
                125);

        agregarEncabezado(
                encabezado,
                "Correo",
                430,
                180);

        agregarEncabezado(
                encabezado,
                "Telefono",
                610,
                100);

        agregarEncabezado(
                encabezado,
                "Estado",
                710,
                72);

        diseno.setColumnHeader(encabezado);
    }

    private void agregarEncabezado(
            JRDesignBand banda,
            String texto,
            int posicionX,
            int ancho) {
        JRDesignStaticText encabezado = new JRDesignStaticText();

        encabezado.setX(posicionX);
        encabezado.setY(0);
        encabezado.setWidth(ancho);
        encabezado.setHeight(25);

        encabezado.setText(texto);
        encabezado.setBold(true);
        encabezado.setFontSize(9f);

        encabezado.setForecolor(
                Color.WHITE);

        encabezado.setBackcolor(
                new Color(39, 84, 138));

        encabezado.setMode(
                ModeEnum.OPAQUE);

        encabezado.setHorizontalTextAlign(
                HorizontalTextAlignEnum.CENTER);

        encabezado.setVerticalTextAlign(
                VerticalTextAlignEnum.MIDDLE);

        banda.addElement(encabezado);
    }

    private void configurarDetalle(
            JasperDesign diseno) {
        JRDesignBand detalle = new JRDesignBand();

        detalle.setHeight(25);

        agregarCampoTexto(
                detalle,
                "$F{id}",
                0,
                40,
                HorizontalTextAlignEnum.CENTER);

        agregarCampoTexto(
                detalle,
                "$F{nombres}",
                40,
                140,
                HorizontalTextAlignEnum.LEFT);

        agregarCampoTexto(
                detalle,
                "$F{apellidoPaterno}",
                180,
                125,
                HorizontalTextAlignEnum.LEFT);

        agregarCampoTexto(
                detalle,
                "$F{apellidoMaterno}",
                305,
                125,
                HorizontalTextAlignEnum.LEFT);

        agregarCampoTexto(
                detalle,
                "$F{correo}",
                430,
                180,
                HorizontalTextAlignEnum.LEFT);

        agregarCampoTexto(
                detalle,
                "$F{telefono}",
                610,
                100,
                HorizontalTextAlignEnum.CENTER);

        agregarCampoTexto(
                detalle,
                "$F{estado}",
                710,
                72,
                HorizontalTextAlignEnum.CENTER);

        JRDesignSection seccionDetalle = (JRDesignSection) diseno
                .getDetailSection();

        seccionDetalle.addBand(detalle);
    }

    private void agregarCampoTexto(
            JRDesignBand banda,
            String expresion,
            int posicionX,
            int ancho,
            HorizontalTextAlignEnum alineacion) {
        JRDesignTextField campo = new JRDesignTextField();

        campo.setX(posicionX);
        campo.setY(0);
        campo.setWidth(ancho);
        campo.setHeight(23);

        campo.setFontSize(8f);
        campo.setBlankWhenNull(true);

        campo.setHorizontalTextAlign(
                alineacion);

        campo.setVerticalTextAlign(
                VerticalTextAlignEnum.MIDDLE);

        campo.setExpression(
                new JRDesignExpression(expresion));

        banda.addElement(campo);
    }

    private void configurarPiePagina(
            JasperDesign diseno) {
        JRDesignBand piePagina = new JRDesignBand();

        piePagina.setHeight(25);

        JRDesignStaticText sistema = new JRDesignStaticText();

        sistema.setX(0);
        sistema.setY(5);
        sistema.setWidth(400);
        sistema.setHeight(15);

        sistema.setText(
                "Generado por Control Hogar con JasperReports");

        sistema.setFontSize(8f);

        JRDesignTextField numeroPagina = new JRDesignTextField();

        numeroPagina.setX(650);
        numeroPagina.setY(5);
        numeroPagina.setWidth(132);
        numeroPagina.setHeight(15);

        numeroPagina.setFontSize(8f);

        numeroPagina.setHorizontalTextAlign(
                HorizontalTextAlignEnum.RIGHT);

        numeroPagina.setVerticalTextAlign(
                VerticalTextAlignEnum.MIDDLE);

        numeroPagina.setExpression(
                new JRDesignExpression(
                        "\"Pagina \" + $V{PAGE_NUMBER}"));

        piePagina.addElement(sistema);
        piePagina.addElement(numeroPagina);

        diseno.setPageFooter(piePagina);
    }
}