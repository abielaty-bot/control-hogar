import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Pagina, Usuario } from './models';

const CLAVE_TOKEN = 'ch_token';
const CLAVE_USUARIO = 'ch_usuario';

// Autenticacion contra la API: el backend usa HTTP Basic con el correo
// y la contrasena cifrada en BCrypt del lado del servidor (Bloque 2).
@Injectable({ providedIn: 'root' })
export class AuthService {

  private http = inject(HttpClient);

  // Valida las credenciales y localiza al usuario por su correo.
  iniciarSesion(correo: string, contrasena: string): Observable<Usuario> {
    const token = this.codificar(correo, contrasena);
    const headers = new HttpHeaders({
      Authorization: `Basic ${token}`
    });

    return this.http
      .get<Pagina<Usuario>>(
        `${environment.apiUrl}/usuarios?page=0&size=100`,
        { headers })
      .pipe(
        map((pagina) => {
          const usuario = pagina.content.find(
            (u) => u.correo.toLowerCase() === correo.toLowerCase());

          if (!usuario) {
            throw new Error('No se encontró un usuario con ese correo');
          }

          return usuario;
        }),
        tap((usuario) => {
          sessionStorage.setItem(CLAVE_TOKEN, token);
          sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
        })
      );
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(CLAVE_TOKEN);
    sessionStorage.removeItem(CLAVE_USUARIO);
  }

  token(): string | null {
    return sessionStorage.getItem(CLAVE_TOKEN);
  }

  estaLogueado(): boolean {
    return this.token() !== null;
  }

  usuarioActual(): Usuario | null {
    const datos = sessionStorage.getItem(CLAVE_USUARIO);
    return datos ? (JSON.parse(datos) as Usuario) : null;
  }

  usuarioId(): number {
    const usuario = this.usuarioActual();
    return usuario ? usuario.id : 0;
  }

  nombreCompleto(): string {
    const u = this.usuarioActual();
    return u ? `${u.nombres} ${u.apellidoPaterno}` : '';
  }

  // Basic usa Base64 sobre UTF-8 (la contrasena puede llevar tildes o ñ)
  private codificar(correo: string, contrasena: string): string {
    const bytes = new TextEncoder().encode(`${correo}:${contrasena}`);
    let binario = '';
    bytes.forEach((b) => (binario += String.fromCharCode(b)));
    return btoa(binario);
  }
}
