import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { MovimientosComponent } from './pages/movimientos/movimientos.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { CuentasComponent } from './pages/cuentas/cuentas.component';
import { PresupuestosComponent } from './pages/presupuestos/presupuestos.component';
import { DeudasComponent } from './pages/deudas/deudas.component';
import { ReportesComponent } from './pages/reportes/reportes.component';

// SPA: una sola pagina; el router cambia el componente sin recargar.
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'movimientos', component: MovimientosComponent },
      { path: 'categorias', component: CategoriasComponent },
      { path: 'cuentas', component: CuentasComponent },
      { path: 'presupuestos', component: PresupuestosComponent },
      { path: 'deudas', component: DeudasComponent },
      { path: 'reportes', component: ReportesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
