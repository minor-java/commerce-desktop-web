import { InjectionToken } from '@angular/core';
import { LogRepository } from './log.repository';

export const LOG_REPOSITORY = new InjectionToken<LogRepository>('LOG_REPOSITORY');
