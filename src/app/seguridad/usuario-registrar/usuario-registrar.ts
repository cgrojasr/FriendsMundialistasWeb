import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../core/services/autenticacion.service';

@Component({
  selector: 'app-usuario-registrar',
  imports: [FormsModule],
  templateUrl: './usuario-registrar.html',
  styleUrl: './usuario-registrar.css',
})
export class UsuarioRegistrar {
  private readonly autenticacionService = inject(AutenticacionService);

  readonly autenticado = signal(this.autenticacionService.estaAutenticado());
  readonly cargando = signal(false);
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');

  dni = '';

  ingresar(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');

    const dniNormalizado = this.dni.trim();

    if (!dniNormalizado) {
      this.mensajeError.set('El DNI es obligatorio.');
      return;
    }

    if (!/^\d{8}$/.test(dniNormalizado)) {
      this.mensajeError.set('El DNI es inválido. Debe contener exactamente 8 dígitos numéricos.');
      return;
    }

    this.cargando.set(true);
    this.autenticacionService.autenticarPorDni(dniNormalizado).subscribe({
      next: (response) => {
        this.cargando.set(false);

        if (!response.exitoso) {
          this.mensajeError.set(response.mensaje);
          return;
        }

        this.autenticado.set(true);
        this.mensajeExito.set(
          response.data.usuarioNuevo
            ? 'Usuario creado automáticamente con datos mínimos (DNI y fecha de creación). Acceso concedido.'
            : 'DNI reconocido. Se utilizó el usuario existente y el acceso fue concedido.'
        );
      },
      error: () => {
        this.cargando.set(false);
        this.mensajeError.set('No se pudo completar la autenticación.');
      },
    });
  }

  limpiarMensajes(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
  }

  cerrarSesion(): void {
    this.autenticacionService.cerrarSesion();
    this.autenticado.set(false);
    this.mensajeExito.set('');
    this.mensajeError.set('Sesión cerrada correctamente.');
    this.dni = '';
  }
}
