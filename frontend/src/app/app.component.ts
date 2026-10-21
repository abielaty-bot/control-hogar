import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componente raiz de la SPA: solo aloja el router.
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {
}
