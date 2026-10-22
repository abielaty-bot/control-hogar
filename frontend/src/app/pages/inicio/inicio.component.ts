import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Movimiento, TotalPorCategoria } from '../../core/models';
import { formatoMoneda, formatoMontoCorto, mensajeDeError } from '../../core/util';

interface MesSerie {
  etiqueta: string;
  ingresos: number;
  gastos: number;
}

interface Delta {
  pct: number;
  sube: boolean;
}

// Pagina de inicio estilo panel premium: heroe con degradado,
// tarjetas KPI, grafico de lineas en SVG, medidor de presupuesto,
// gastos por categoria con barras y movimientos recientes.
// Todo se calcula en el cliente con los datos reales de la API.
@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="error" *ngIf="error">{{ error }}</div>

    <!-- ===== Heroe ===== -->
    <section class="heroe">
      <div class="heroe-saludo">
        <div class="heroe-etiqueta">Panel del hogar · {{ mesActualTexto }}</div>
        <h1>{{ saludo }}, {{ primerNombre }} 👋</h1>
        <p>Así va el dinero de tu hogar este mes.</p>
        <a class="heroe-boton" routerLink="/movimientos">Registrar movimiento →</a>
      </div>
      <div class="heroe-cifras">
        <div class="mini">
          <div class="mini-monto">{{ formato(vista.balance) }}</div>
          <div class="mini-rotulo">Balance del mes</div>
        </div>
        <div class="mini">
          <div class="mini-monto">{{ formato(vista.ingresos) }}</div>
          <div class="mini-rotulo">Ingresos</div>
        </div>
        <div class="mini">
          <div class="mini-monto">{{ formato(vista.gastos) }}</div>
          <div class="mini-rotulo">Gastos</div>
        </div>
      </div>
    </section>

    <!-- ===== Esqueletos de carga ===== -->
    <div class="kpis" *ngIf="cargando">
      <div class="esqueleto" *ngFor="let i of [1, 2, 3, 4]"></div>
    </div>

    <!-- ===== Tarjetas KPI ===== -->
    <div class="kpis" *ngIf="!cargando">
      <div class="kpi-tarjeta">
        <div class="kpi-cabecera">
          <div class="kpi-icono verde">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
          </div>
          <span class="pastilla sube" *ngIf="deltaIngresos">▲ {{ deltaIngresos.pct }}%</span>
        </div>
        <div class="kpi-monto">{{ formato(vista.ingresos) }}</div>
        <div class="kpi-rotulo">Ingresos del mes</div>
        <div class="barritas">
          <span *ngFor="let b of barrasIngresos; let u = last; let j = index"
                [style.height.%]="b" [class.actual]="u"
                [title]="serie[j].etiqueta + ': ' + formato(serie[j].ingresos)"></span>
        </div>
      </div>

      <div class="kpi-tarjeta">
        <div class="kpi-cabecera">
          <div class="kpi-icono rosa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 18l-9.5-9.5-5 5L1 6"/><path d="M17 18h6v-6"/></svg>
          </div>
          <span class="pastilla" *ngIf="deltaGastos"
                [class.sube]="!deltaGastos.sube" [class.baja]="deltaGastos.sube">
            {{ deltaGastos.sube ? '▲' : '▼' }} {{ deltaGastos.pct }}%
          </span>
        </div>
        <div class="kpi-monto">{{ formato(vista.gastos) }}</div>
        <div class="kpi-rotulo">Gastos del mes</div>
        <div class="barritas rosa">
          <span *ngFor="let b of barrasGastos; let u = last; let j = index"
                [style.height.%]="b" [class.actual]="u"
                [title]="serie[j].etiqueta + ': ' + formato(serie[j].gastos)"></span>
        </div>
      </div>

      <div class="kpi-tarjeta">
        <div class="kpi-cabecera">
          <div class="kpi-icono violeta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <span class="pastilla" *ngIf="deltaBalance"
                [class.sube]="deltaBalance.sube" [class.baja]="!deltaBalance.sube">
            {{ deltaBalance.sube ? '▲' : '▼' }} {{ deltaBalance.pct }}%
          </span>
        </div>
        <div class="kpi-monto">{{ formato(vista.balance) }}</div>
        <div class="kpi-rotulo">Balance del mes</div>
        <div class="kpi-nota">Ingresos menos gastos de {{ mesActualTexto }}.</div>
      </div>

      <div class="kpi-tarjeta">
        <div class="kpi-cabecera">
          <div class="kpi-icono ambar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>
          </div>
          <span class="pastilla neutra" *ngIf="deudasActivas">{{ deudasActivas }} activa{{ deudasActivas === 1 ? '' : 's' }}</span>
        </div>
        <div class="kpi-monto">{{ formato(vista.deudas) }}</div>
        <div class="kpi-rotulo">Deudas pendientes</div>
        <div class="kpi-nota" *ngIf="proximoVencimiento">Vencimiento más cercano: {{ proximoVencimiento }}</div>
        <div class="kpi-nota" *ngIf="!proximoVencimiento">Sin deudas por pagar. 🎉</div>
      </div>
    </div>

    <!-- ===== Grafico + medidor ===== -->
    <div class="rejilla-graficos" *ngIf="!cargando">
      <div class="tarjeta grafico">
        <div class="grafico-cabecera">
          <div>
            <h3>Ingresos vs. gastos</h3>
            <p class="grafico-sub">Últimos 6 meses</p>
          </div>
          <div class="leyenda">
            <span><i class="punto ing"></i>Ingresos</span>
            <span><i class="punto gas"></i>Gastos</span>
          </div>
        </div>

        <div class="envoltura"><svg *ngIf="hayDatosGrafico" class="lienzo" viewBox="0 0 640 240" preserveAspectRatio="none" role="img">
          <g class="rejilla">
            <line *ngFor="let n of niveles" [attr.x1]="46" [attr.x2]="630"
                  [attr.y1]="yDe(n)" [attr.y2]="yDe(n)"></line>
          </g>
          <polyline class="linea-gastos" [attr.points]="puntosGastos"></polyline>
          <polyline class="linea-ingresos" [attr.points]="puntosIngresos"></polyline>
          <g *ngFor="let p of puntosIngresosLista">
            <circle class="pto-ing" [attr.cx]="p.x" [attr.cy]="p.y" r="3.5"></circle>
          </g>
          <g *ngFor="let p of puntosGastosLista">
            <circle class="pto-gas" [attr.cx]="p.x" [attr.cy]="p.y" r="3.5"></circle>
          </g>
          <g *ngFor="let p of puntosIngresosLista; let i = index">
            <rect [attr.x]="p.x - 58" y="0" width="117" height="240"
                  fill="#ffffff" fill-opacity="0" class="banda"
                  (mouseenter)="alPasar(i)" (mouseleave)="activo = null"></rect>
          </g>
          <g *ngIf="activo">
            <line class="guia-v" [attr.x1]="activo.x" [attr.x2]="activo.x" y1="8" y2="214"></line>
            <circle class="pto-activo pto-a-ing" [attr.cx]="activo.x" [attr.cy]="activo.yi" r="5.5"></circle>
            <circle class="pto-activo pto-a-gas" [attr.cx]="activo.x" [attr.cy]="activo.yg" r="5.5"></circle>
          </g>
        </svg>
        <div class="tooltip-grafico" *ngIf="activo"
             [style.left.%]="activo.x / 6.4" [style.transform]="transformTooltip(activo.i)">
          <strong>{{ serie[activo.i].etiqueta }}</strong>
          <span class="tt-ing">Ingresos {{ formato(serie[activo.i].ingresos) }}</span>
          <span class="tt-gas">Gastos {{ formato(serie[activo.i].gastos) }}</span>
        </div>
        <div class="ejes" *ngIf="hayDatosGrafico">
          <span *ngFor="let m of serie">{{ m.etiqueta }}</span>
        </div>
        </div>
        <p class="vacio" *ngIf="!hayDatosGrafico">
          Todavía no hay movimientos para graficar. Registra el primero y aquí verás tu tendencia.
        </p>
      </div>

      <div class="tarjeta medidor">
        <h3>Presupuesto del mes</h3>
        <p class="grafico-sub">Qué tanto del presupuesto ya se gastó</p>
        <div class="rosca" *ngIf="presupuestoPct !== null">
          <svg viewBox="0 0 140 140">
            <circle class="rosca-fondo" cx="70" cy="70" r="56"></circle>
            <circle class="rosca-resto" cx="70" cy="70" r="56"
                    [style.stroke-dasharray]="roscaRestoTrazo" [style.stroke-dashoffset]="roscaRestoOffset"
                    [style.stroke-width]="hoverRosca === 'libre' ? 16 : 13"
                    (mouseenter)="hoverRosca = 'libre'" (mouseleave)="hoverRosca = null"></circle>
            <circle class="rosca-valor" cx="70" cy="70" r="56"
                    [style.stroke-dasharray]="roscaTrazo"
                    [style.stroke-width]="hoverRosca === 'gastado' ? 16 : 13"
                    (mouseenter)="hoverRosca = 'gastado'" (mouseleave)="hoverRosca = null"></circle>
          </svg>
          <div class="rosca-centro">
            <ng-container *ngIf="hoverRosca === 'gastado'">
              <div class="rosca-pct monto">{{ formato(gastosMes) }}</div>
              <div class="rosca-rotulo">gastado</div>
            </ng-container>
            <ng-container *ngIf="hoverRosca === 'libre'">
              <div class="rosca-pct monto">{{ formato(restantePresupuesto()) }}</div>
              <div class="rosca-rotulo">te queda</div>
            </ng-container>
            <ng-container *ngIf="!hoverRosca">
              <div class="rosca-pct">{{ presupuestoPct }}%</div>
              <div class="rosca-rotulo">del presupuesto</div>
            </ng-container>
          </div>
        </div>
        <p class="medidor-detalle" *ngIf="presupuestoPct !== null">
          Gastado: <strong>{{ formato(gastosMes) }}</strong><br>
          Presupuesto: <strong>{{ formato(presupuestoMes) }}</strong>
        </p>
        <p class="vacio" *ngIf="presupuestoPct === null">
          No tienes un presupuesto para este mes.
          <a routerLink="/presupuestos">Crear uno</a> y aquí verás tu avance.
        </p>
      </div>
    </div>

    <!-- ===== Categorias + recientes ===== -->
    <div class="rejilla-graficos dos" *ngIf="!cargando">
      <div class="tarjeta">
        <h3>Gastos por categoría</h3>
        <div *ngIf="gastosPorCategoria.length; else sinGastos">
          <div class="categoria-fila" *ngFor="let t of gastosPorCategoria; let i = index">
            <div class="categoria-datos">
              <span>{{ t.categoria || 'Sin categoría' }}</span>
              <span class="categoria-monto">{{ formato(t.total) }} · {{ pctDelTotal(t) }}%</span>
            </div>
            <div class="barra">
              <div class="barra-relleno" [style.--w]="anchoBarra(t) + '%'"
                   [style.background]="colorCategoria(i)"></div>
            </div>
          </div>
        </div>
        <ng-template #sinGastos>
          <p class="vacio">Todavía no registras gastos. Cuando lo hagas, aquí verás en qué se va tu dinero.</p>
        </ng-template>
      </div>

      <div class="tarjeta">
        <h3>Movimientos recientes</h3>
        <div *ngIf="recientes.length; else sinMovs">
          <div class="reciente" *ngFor="let m of recientes">
            <div class="reciente-icono" [class.ing]="m.tipo === 'INGRESO'" [class.gas]="m.tipo !== 'INGRESO'">
              {{ m.tipo === 'INGRESO' ? '↓' : '↑' }}
            </div>
            <div class="reciente-datos">
              <div class="reciente-desc">{{ m.descripcion }}</div>
              <div class="reciente-meta">{{ m.fecha }} · {{ m.categoria?.nombre || 'Sin categoría' }}</div>
            </div>
            <div class="reciente-monto" [class.ing]="m.tipo === 'INGRESO'" [class.gas]="m.tipo !== 'INGRESO'">
              {{ m.tipo === 'INGRESO' ? '+' : '−' }}{{ formato(m.montoTotal) }}
            </div>
          </div>
        </div>
        <ng-template #sinMovs>
          <p class="vacio">Sin movimientos registrados todavía.</p>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    /* ===== Heroe ===== */
    .heroe {
      background: var(--degradado);
      border-radius: 24px;
      padding: 28px 28px 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 26px;
      flex-wrap: wrap;
      box-shadow: 0 24px 48px rgba(150, 45, 210, 0.35);
      position: relative;
      overflow: hidden;
      margin-bottom: 20px;
      animation: aparecer 0.45s ease both;
    }

    .heroe::after {
      content: '';
      position: absolute;
      width: 340px;
      height: 340px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.13);
      right: -110px;
      top: -170px;
      pointer-events: none;
    }

    .heroe-etiqueta {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: rgba(255, 255, 255, 0.22);
      padding: 5px 11px;
      border-radius: 999px;
      margin-bottom: 13px;
    }

    .heroe h1 {
      font-size: 30px;
      font-weight: 800;
      margin: 0 0 6px;
      color: #fff;
    }

    .heroe p {
      color: rgba(255, 255, 255, 0.85);
      margin: 0 0 18px;
    }

    .heroe-boton {
      display: inline-block;
      background: #fff;
      color: #7c3aed;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 999px;
      box-shadow: 0 10px 24px rgba(30, 5, 60, 0.3);
    }

    .heroe-cifras {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      position: relative;
      z-index: 1;
    }

    .mini {
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 16px;
      padding: 13px 17px;
      min-width: 128px;
      backdrop-filter: blur(4px);
    }

    .mini-monto {
      font-size: 19px;
      font-weight: 800;
      color: #fff;
    }

    .mini-rotulo {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }

    /* ===== KPI ===== */
    .kpi-tarjeta {
      background: linear-gradient(180deg, var(--tarjeta-2), var(--tarjeta));
      border: 1px solid var(--borde);
      border-radius: var(--radio);
      padding: 19px;
      box-shadow: var(--sombra);
      animation: aparecer 0.45s ease both;
    }

    .kpi-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 13px;
    }

    .kpi-icono {
      width: 42px;
      height: 42px;
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .kpi-icono svg {
      width: 21px;
      height: 21px;
    }

    .kpi-icono.verde { background: var(--exito-fondo); color: #6ee7b7; }
    .kpi-icono.rosa { background: var(--peligro-fondo); color: #fda4af; }
    .kpi-icono.violeta { background: rgba(168, 85, 247, 0.16); color: #d8b4fe; }
    .kpi-icono.ambar { background: rgba(251, 191, 36, 0.13); color: #fcd34d; }

    .pastilla {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 999px;
    }

    .pastilla.sube { background: var(--exito-fondo); color: #6ee7b7; }
    .pastilla.baja { background: var(--peligro-fondo); color: #fda4af; }
    .pastilla.neutra { background: rgba(251, 191, 36, 0.13); color: #fcd34d; }

    .kpi-monto {
      font-size: 25px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .kpi-rotulo {
      color: var(--texto-suave);
      font-size: 13.5px;
      margin-top: 2px;
    }

    .kpi-nota {
      color: var(--texto-tenue);
      font-size: 12.5px;
      margin-top: 13px;
    }

    .barritas {
      display: flex;
      align-items: flex-end;
      gap: 5px;
      height: 30px;
      margin-top: 14px;
    }

    .barritas span {
      flex: 1;
      border-radius: 99px;
      background: rgba(52, 211, 153, 0.25);
      min-height: 12%;
    }

    .barritas span.actual {
      background: var(--exito);
    }

    .barritas.rosa span {
      background: rgba(251, 113, 133, 0.22);
    }

    .barritas.rosa span.actual {
      background: var(--peligro);
    }

    /* ===== Graficos ===== */
    .rejilla-graficos {
      display: grid;
      grid-template-columns: 1.9fr 1fr;
      gap: 20px;
      align-items: start;
    }

    .rejilla-graficos.dos {
      grid-template-columns: 1fr 1fr;
    }

    .grafico-cabecera {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .grafico-sub {
      color: var(--texto-tenue);
      font-size: 13px;
      margin: -6px 0 12px;
    }

    .leyenda {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--texto-suave);
    }

    .leyenda .punto {
      display: inline-block;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      margin-right: 6px;
    }

    .punto.ing { background: #c084fc; }
    .punto.gas { background: #fb7185; }

    .lienzo {
      width: 100%;
      height: 230px;
    }

    .lienzo .rejilla line {
      stroke: rgba(178, 148, 255, 0.12);
      stroke-dasharray: 3 5;
    }

    .linea-ingresos, .linea-gastos {
      fill: none;
      stroke-width: 2.6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .linea-ingresos { stroke: #c084fc; }
    .linea-gastos { stroke: #fb7185; }

    .pto-ing { fill: #c084fc; }
    .pto-gas { fill: #fb7185; }

    .ejes {
      display: flex;
      justify-content: space-between;
      padding: 2px 4px 0 46px;
      color: var(--texto-tenue);
      font-size: 12px;
      text-transform: capitalize;
    }

    .vacio {
      color: var(--texto-tenue);
      font-size: 14px;
    }

    /* ===== Medidor (rosca) ===== */
    .rosca {
      position: relative;
      width: 148px;
      height: 148px;
      margin: 6px auto 10px;
    }

    .rosca svg {
      width: 148px;
      height: 148px;
      transform: rotate(-90deg);
    }

    .rosca-fondo {
      fill: none;
      stroke: rgba(178, 148, 255, 0.14);
      stroke-width: 13;
    }

    .rosca-valor {
      fill: none;
      stroke: #c026d3;
      stroke-width: 13;
      stroke-linecap: round;
      transition: stroke-dasharray 0.8s ease;
    }

    .rosca-centro {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .rosca-pct {
      font-size: 29px;
      font-weight: 800;
    }

    .rosca-rotulo {
      font-size: 11.5px;
      color: var(--texto-tenue);
    }

    .medidor-detalle {
      text-align: center;
      font-size: 13.5px;
      color: var(--texto-suave);
      line-height: 1.65;
    }

    .medidor-detalle strong {
      color: var(--texto);
    }

    /* ===== Categorias ===== */
    .categoria-fila {
      margin-bottom: 15px;
    }

    .categoria-datos {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      margin-bottom: 6px;
    }

    .categoria-monto {
      color: var(--texto-suave);
      font-variant-numeric: tabular-nums;
    }

    .barra {
      height: 9px;
      border-radius: 99px;
      background: rgba(178, 148, 255, 0.12);
      overflow: hidden;
    }

    .barra-relleno {
      height: 100%;
      border-radius: 99px;
      transition: width 0.7s ease;
    }

    /* ===== Recientes ===== */
    .reciente {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 2px;
      border-bottom: 1px solid rgba(178, 148, 255, 0.08);
    }

    .reciente:last-child {
      border-bottom: none;
    }

    .reciente-icono {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      font-weight: 700;
      flex: none;
    }

    .reciente-icono.ing { background: var(--exito-fondo); color: #6ee7b7; }
    .reciente-icono.gas { background: var(--peligro-fondo); color: #fda4af; }

    .reciente-datos {
      flex: 1;
      min-width: 0;
    }

    .reciente-desc {
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reciente-meta {
      font-size: 12.5px;
      color: var(--texto-tenue);
    }

    .reciente-monto {
      font-weight: 700;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
    }

    .reciente-monto.ing { color: #6ee7b7; }
    .reciente-monto.gas { color: #fda4af; }

    /* ===== Esqueletos ===== */
    .esqueleto {
      height: 148px;
      border-radius: var(--radio);
      background: linear-gradient(100deg, var(--tarjeta) 40%, var(--tarjeta-2) 50%, var(--tarjeta) 60%);
      background-size: 200% 100%;
      animation: brillo 1.3s infinite;
      border: 1px solid var(--borde);
    }

    /* ===== Interactividad (Bloque 10) ===== */
    .kpi-tarjeta, .grafico, .medidor {
      transition: translate 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .kpi-tarjeta:hover, .grafico:hover, .medidor:hover {
      translate: 0 -3px;
      border-color: rgba(168, 85, 247, 0.5);
      box-shadow: 0 16px 34px rgba(0, 0, 0, 0.4);
    }

    .envoltura { position: relative; }

    .banda { cursor: crosshair; }

    .guia-v {
      stroke: rgba(255, 255, 255, 0.35);
      stroke-width: 1;
      stroke-dasharray: 3 4;
      pointer-events: none;
    }

    .pto-activo {
      stroke: #fff;
      stroke-width: 2;
      pointer-events: none;
    }

    .pto-a-ing { fill: #c084fc; }
    .pto-a-gas { fill: #fb7185; }

    .tooltip-grafico {
      position: absolute;
      top: 0;
      z-index: 3;
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: #150a2e;
      border: 1px solid rgba(168, 85, 247, 0.55);
      border-radius: 10px;
      padding: 7px 10px;
      pointer-events: none;
      white-space: nowrap;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
    }

    .tooltip-grafico strong { font-size: 12px; text-transform: capitalize; }
    .tooltip-grafico span { font-size: 11.5px; }
    .tt-ing { color: #c084fc; }
    .tt-gas { color: #fda4af; }

    .barritas span {
      transition: filter 0.15s ease, transform 0.15s ease;
      transform-origin: bottom;
      cursor: pointer;
    }

    .barritas span:hover { filter: brightness(1.6); transform: scaleY(1.06); }

    .barra-relleno {
      width: var(--w, 0%);
      animation: crece 0.9s cubic-bezier(0.22, 0.8, 0.36, 1) both;
    }

    @keyframes crece { from { width: 0; } }

    .categoria-fila {
      border-radius: 10px;
      padding: 6px 8px;
      margin: 0 -8px 9px;
      transition: background 0.15s ease;
    }

    .categoria-fila:hover { background: rgba(168, 85, 247, 0.05); }

    .reciente {
      border-radius: 10px;
      padding-left: 8px;
      padding-right: 8px;
      margin: 0 -8px;
      transition: background 0.15s ease;
    }

    .reciente:hover { background: rgba(168, 85, 247, 0.06); }

    .rosca-valor, .rosca-resto {
      transition: stroke-width 0.2s ease, stroke-dasharray 0.8s ease;
      cursor: pointer;
    }

    .rosca-resto {
      fill: none;
      stroke: rgba(178, 148, 255, 0.14);
    }

    .rosca-pct.monto { font-size: 19px; }

    @keyframes brillo {
      to { background-position: -200% 0; }
    }

    /* ===== Responsive ===== */
    @media (max-width: 1023px) {
      .rejilla-graficos, .rejilla-graficos.dos {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .heroe {
        padding: 22px 18px 18px;
        border-radius: 20px;
      }

      .heroe h1 {
        font-size: 24px;
      }

      .heroe-cifras {
        width: 100%;
      }

      .mini {
        flex: 1;
        min-width: 100px;
        padding: 11px 13px;
      }

      .mini-monto {
        font-size: 16.5px;
      }

      .lienzo {
        height: 190px;
      }
    }
  `]
})
export class InicioComponent implements OnInit {

  private api = inject(ApiService);
  auth = inject(AuthService);

  private readonly MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  private readonly MESES_CORTOS = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  private readonly COLORES = ['#a855f7', '#e935c1', '#38bdf8', '#fbbf24', '#34d399', '#fb7185'];

  cargando = true;
  error = '';

  ingresosMes = 0;
  gastosMes = 0;
  balanceMes = 0;
  deltaIngresos: Delta | null = null;
  deltaGastos: Delta | null = null;
  deltaBalance: Delta | null = null;
  barrasIngresos: number[] = [];
  barrasGastos: number[] = [];

  deudasPendientes = 0;
  deudasActivas = 0;
  proximoVencimiento: string | null = null;

  presupuestoMes = 0;
  presupuestoPct: number | null = null;

  serie: MesSerie[] = [];
  puntosIngresos = '';
  puntosGastos = '';
  puntosIngresosLista: { x: number; y: number }[] = [];
  puntosGastosLista: { x: number; y: number }[] = [];
  niveles: number[] = [0, 0.25, 0.5, 0.75, 1];
  hayDatosGrafico = false;
  private maxGrafico = 1;

  gastosPorCategoria: TotalPorCategoria[] = [];
  activo: { i: number; x: number; yi: number; yg: number } | null = null;
  hoverRosca: 'gastado' | 'libre' | null = null;
  vista = { ingresos: 0, gastos: 0, balance: 0, deudas: 0 };
  recientes: Movimiento[] = [];

  formato = formatoMoneda;
  formatoCorto = formatoMontoCorto;

  get saludo(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  get primerNombre(): string {
    const u = this.auth.usuarioActual();
    return u ? (u.nombres || '').split(' ')[0] : '';
  }

  get mesActualTexto(): string {
    const d = new Date();
    return `${this.MESES[d.getMonth()]} ${d.getFullYear()}`;
  }

  get roscaRestoTrazo(): string {
    const c = 2 * Math.PI * 56;
    const pct = Math.min(100, Math.max(0, this.presupuestoPct ?? 0));
    return `${((100 - pct) / 100) * c} ${c}`;
  }

  get roscaRestoOffset(): string {
    const c = 2 * Math.PI * 56;
    const pct = Math.min(100, Math.max(0, this.presupuestoPct ?? 0));
    return `${-(pct / 100) * c}`;
  }

  get roscaTrazo(): string {
    const c = 2 * Math.PI * 56;
    const pct = Math.min(100, Math.max(0, this.presupuestoPct ?? 0));
    return `${(pct / 100) * c} ${c}`;
  }

  ngOnInit(): void {
    const usuarioId = this.auth.usuarioId();

    this.api.listarMovimientos(usuarioId, 0, 100).subscribe({
      next: (pagina) => {
        this.recientes = pagina.content.slice(0, 5);
        this.procesarMovimientos(pagina.content);
        this.cargando = false;
      },
      error: (e) => {
        this.error = mensajeDeError(e);
        this.cargando = false;
      }
    });

    this.api.listarDeudas(usuarioId).subscribe({
      next: (pagina) => {
        const pendientes = pagina.content.filter((d) => d.estado !== 'PAGADA');
        this.deudasActivas = pendientes.length;
        this.deudasPendientes = pendientes.reduce((s, d) => s + Number(d.saldoPendiente), 0);
        const conFecha = pendientes
          .map((d) => d.fechaVencimiento)
          .filter((f): f is string => !!f)
          .sort();
        this.proximoVencimiento = conFecha.length ? conFecha[0] : null;
        this.animar(this.deudasPendientes, (v) => (this.vista.deudas = v));
      },
      error: (e) => (this.error = mensajeDeError(e))
    });

    this.api.listarPresupuestos(usuarioId).subscribe({
      next: (pagina) => {
        const hoy = new Date();
        const actual = pagina.content.find(
          (p) => p.anio === hoy.getFullYear() && p.mes === hoy.getMonth() + 1 && p.activo);
        if (actual) {
          this.presupuestoMes = Number(actual.montoTotal);
          this.actualizarRosca();
        }
      },
      error: () => undefined
    });

    this.api.totalesPorCategoria(usuarioId, 'GASTO').subscribe({
      next: (totales) => (this.gastosPorCategoria = totales),
      error: (e) => (this.error = mensajeDeError(e))
    });
  }

  private procesarMovimientos(movs: Movimiento[]): void {
    const clave = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const suma = (tipo: string, claveMes: string) =>
      movs
        .filter((m) => m.tipo === tipo && (m.fecha || '').startsWith(claveMes))
        .reduce((s, m) => s + Number(m.montoTotal), 0);

    const hoy = new Date();
    const claveActual = clave(hoy);
    const anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const claveAnterior = clave(anterior);

    this.ingresosMes = suma('INGRESO', claveActual);
    this.gastosMes = suma('GASTO', claveActual);
    this.balanceMes = this.ingresosMes - this.gastosMes;

    const ingAnt = suma('INGRESO', claveAnterior);
    const gasAnt = suma('GASTO', claveAnterior);
    this.deltaIngresos = this.calcularDelta(this.ingresosMes, ingAnt);
    this.deltaGastos = this.calcularDelta(this.gastosMes, gasAnt);
    this.deltaBalance = this.calcularDelta(this.balanceMes, ingAnt - gasAnt);

    // Serie de los ultimos 6 meses (grafico y barritas)
    this.serie = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const c = clave(d);
      this.serie.push({
        etiqueta: this.MESES_CORTOS[d.getMonth()],
        ingresos: suma('INGRESO', c),
        gastos: suma('GASTO', c)
      });
    }

    this.barrasIngresos = this.barrasDe(this.serie.map((m) => m.ingresos));
    this.barrasGastos = this.barrasDe(this.serie.map((m) => m.gastos));
    this.construirGrafico();
    this.actualizarRosca();
    this.animar(this.ingresosMes, (v) => (this.vista.ingresos = v));
    this.animar(this.gastosMes, (v) => (this.vista.gastos = v));
    this.animar(this.balanceMes, (v) => (this.vista.balance = v));
  }

  private calcularDelta(actual: number, anterior: number): Delta | null {
    if (anterior === 0) {
      return null;
    }
    const pct = Math.round(((actual - anterior) / Math.abs(anterior)) * 100);
    return { pct: Math.abs(pct), sube: pct >= 0 };
  }

  private barrasDe(valores: number[]): number[] {
    const max = Math.max(...valores, 1);
    return valores.map((v) => Math.max(14, Math.round((v / max) * 100)));
  }

  private construirGrafico(): void {
    const ancho = 640, alto = 240;
    const padI = 46, padD = 10, padA = 12, padB = 26;
    const util = ancho - padI - padD;
    const utilAlto = alto - padA - padB;

    this.maxGrafico = Math.max(
      ...this.serie.map((m) => Math.max(m.ingresos, m.gastos)), 1);
    this.hayDatosGrafico = this.serie.some((m) => m.ingresos > 0 || m.gastos > 0);

    const punto = (i: number, v: number) => ({
      x: Math.round(padI + (util / (this.serie.length - 1)) * i),
      y: Math.round(padA + utilAlto * (1 - v / this.maxGrafico))
    });

    this.puntosIngresosLista = this.serie.map((m, i) => punto(i, m.ingresos));
    this.puntosGastosLista = this.serie.map((m, i) => punto(i, m.gastos));
    this.puntosIngresos = this.puntosIngresosLista.map((p) => `${p.x},${p.y}`).join(' ');
    this.puntosGastos = this.puntosGastosLista.map((p) => `${p.x},${p.y}`).join(' ');
  }

  // Eje Y: posicion de una fraccion (0 a 1) del maximo del grafico.
  yDe(fraccion: number): number {
    const padA = 12, padB = 26, alto = 240;
    return Math.round(padA + (alto - padA - padB) * (1 - fraccion));
  }

  private actualizarRosca(): void {
    if (this.presupuestoMes > 0) {
      this.presupuestoPct = Math.min(
        100, Math.round((this.gastosMes / this.presupuestoMes) * 100));
    }
  }

  // Porcentaje del gasto total (texto junto al monto).
  pctDelTotal(t: TotalPorCategoria): number {
    const total = this.gastosPorCategoria.reduce((s, g) => s + Number(g.total), 0);
    return total > 0 ? Math.round((Number(t.total) / total) * 100) : 0;
  }

  // Ancho de la barra: relativo a la categoria mayor (se ve mejor).
  anchoBarra(t: TotalPorCategoria): number {
    const max = Math.max(...this.gastosPorCategoria.map((g) => Number(g.total)), 1);
    return Math.round((Number(t.total) / max) * 100);
  }

  alPasar(i: number): void {
    const pi = this.puntosIngresosLista[i];
    const pg = this.puntosGastosLista[i];
    if (pi && pg) {
      this.activo = { i, x: pi.x, yi: pi.y, yg: pg.y };
    }
  }

  transformTooltip(i: number): string {
    if (i === 0) return 'translateX(-4%)';
    if (i === this.serie.length - 1) return 'translateX(-96%)';
    return 'translateX(-50%)';
  }

  restantePresupuesto(): number {
    return Math.max(0, this.presupuestoMes - this.gastosMes);
  }

  private animar(objetivo: number, aplicar: (v: number) => void): void {
    const duracion = 900;
    const inicio = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      aplicar(Math.round(objetivo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }

  colorCategoria(i: number): string {
    return this.COLORES[i % this.COLORES.length];
  }
}
