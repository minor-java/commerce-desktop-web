import { ConfiguracionEstilo } from '../../domain/estilo.model';

export interface EstiloRepository {
  obtener(): Promise<ConfiguracionEstilo>;
  guardar(estilo: ConfiguracionEstilo): Promise<ConfiguracionEstilo>;
}
