import { InjectionToken } from '@angular/core';
import { UsuarioRepository } from './usuario.repository';

export const USUARIO_REPOSITORY = new InjectionToken<UsuarioRepository>('USUARIO_REPOSITORY');
