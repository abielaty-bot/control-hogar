import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pagina de recuperacion de contraseña.
// Por ahora la recuperacion es manual: la aplicacion todavia no
// envia correos, asi que nadie puede recibir un enlace automatico.
// La pagina lo explica con honestidad y da los pasos disponibles.
@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="login-fondo">
      <div class="tarjeta recuperar">
        <div class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5"/><path d="M9.5 21v-5h5v5"/></svg>
        </div>
        <h1>Recuperar <span>contraseña</span></h1>
        <p class="texto">
          Por seguridad, la recuperación todavía es <strong>manual</strong>:
          la aplicación aún no envía correos automáticos, así que no puede
          mandarte un enlace de restablecimiento.
        </p>
        <p class="texto">
          Si olvidaste tu contraseña, pide al administrador del hogar que la
          restablezca por ti. Cuando el sistema de correo esté activo, esta
          página enviará el enlace directamente a tu correo.
        </p>
        <div class="consejo">
          <strong>Antes de pedir ayuda, revisa:</strong>
          <ul>
            <li>¿Está activado <em>Bloq Mayús</em>? Es el error más común.</li>
            <li>¿El correo está escrito igual que al registrarte?</li>
            <li>¿Tu gestor de contraseñas tiene la clave guardada?</li>
          </ul>
        </div>
        <a class="volver" routerLink="/login">← Volver al ingreso</a>
      </div>
    </div>
  `,
  styles: [`
    .login-fondo {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 22px 14px;
      background:
        radial-gradient(800px 420px at 85% -10%, rgba(124, 58, 237, 0.35), transparent 60%),
        radial-gradient(700px 420px at -10% 110%, rgba(233, 53, 193, 0.18), transparent 55%),
        var(--fondo);
    }
    .recuperar {
      width: 400px;
      max-width: 94vw;
      padding: 30px 28px 24px;
      border: 1px solid rgba(196, 164, 255, 0.38);
      translate: 0 -3vh;
    }
    .logo {
      width: 58px;
      height: 58px;
      margin: 0 auto 12px;
      border-radius: 17px;
      background: var(--degradado);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
    }
    .logo svg { width: 30px; height: 30px; }
    .recuperar h1 {
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 14px;
    }
    .recuperar h1 span {
      background: var(--degradado);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .texto {
      color: var(--texto-suave);
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 12px;
    }
    .texto strong { color: var(--texto); }
    .consejo {
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.22);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 13.5px;
      color: var(--texto-suave);
      margin: 16px 0 20px;
    }
    .consejo ul {
      margin: 8px 0 0;
      padding-left: 18px;
      line-height: 1.7;
    }
    .volver {
      display: block;
      text-align: center;
      font-weight: 700;
      font-size: 14.5px;
    }
  `]
})
export class RecuperarComponent {}
