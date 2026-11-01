import { InjectionToken } from '@angular/core';
import { ComboRepository } from './combo.repository';

export const COMBO_REPOSITORY = new InjectionToken<ComboRepository>('COMBO_REPOSITORY');
