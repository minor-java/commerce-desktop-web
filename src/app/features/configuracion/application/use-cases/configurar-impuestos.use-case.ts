import { inject, Injectable } from '@angular/core';
import { IMPUESTO_REPOSITORY } from '../ports/impuesto.repository.token';
import {
  ConfiguracionImpuestos,
  GuardarConfiguracionImpuestos,
  GuardarTarifaImpuesto,
  TarifaImpuestoConfig,
} from '../../domain/impuesto.model';

/** Configuración > Impuestos: responsable de IVA y catálogo de tarifas. Se provee en configuracion.routes. */
@Injectable()
export class ConfigurarImpuestosUseCase {
  private readonly repo = inject(IMPUESTO_REPOSITORY);

  obtenerConfiguracion(): Promise<ConfiguracionImpuestos> {
    return this.repo.obtenerConfiguracion();
  }

  guardarConfiguracion(request: GuardarConfiguracionImpuestos): Promise<ConfiguracionImpuestos> {
    return this.repo.guardarConfiguracion(request);
  }

  listarTarifas(): Promise<TarifaImpuestoConfig[]> {
    return this.repo.listarTarifas();
  }

  /** Crea (id null) o actualiza una tarifa. */
  guardarTarifa(id: number | null, request: GuardarTarifaImpuesto): Promise<TarifaImpuestoConfig> {
    return id === null ? this.repo.crearTarifa(request) : this.repo.actualizarTarifa(id, request);
  }

  eliminarTarifa(id: number): Promise<void> {
    return this.repo.eliminarTarifa(id);
  }
}
