import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Se muestra cuando el rol del usuario no habilita ninguna pantalla. */
@Component({
  selector: 'app-sin-acceso',
  templateUrl: './sin-acceso.component.html',
  styleUrl: './sin-acceso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinAccesoComponent {}
