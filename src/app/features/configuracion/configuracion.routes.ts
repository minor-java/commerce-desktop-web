import { Routes } from '@angular/router';
import { permisoGuard } from '../../core/auth/guards/role.guard';
import { PERMISOS } from '../../core/auth/permisos';
import { USUARIO_REPOSITORY } from './application/ports/usuario.repository.token';
import { ROL_REPOSITORY } from './application/ports/rol.repository.token';
import { UsuarioApi } from './infrastructure/api/usuario.api';
import { RolApi } from './infrastructure/api/rol.api';
import { RESPALDO_REPOSITORY } from './application/ports/respaldo.repository.token';
import { RespaldoApi } from './infrastructure/api/respaldo.api';
import { ListarRespaldosUseCase } from './application/use-cases/listar-respaldos.use-case';
import { GenerarRespaldoUseCase } from './application/use-cases/generar-respaldo.use-case';
import { DescargarRespaldoUseCase } from './application/use-cases/descargar-respaldo.use-case';
import { VistaPreviaRespaldoUseCase } from './application/use-cases/vista-previa-respaldo.use-case';
import { CargarRespaldoUseCase } from './application/use-cases/cargar-respaldo.use-case';
import { RestaurarRespaldoUseCase } from './application/use-cases/restaurar-respaldo.use-case';
import { ListarUsuariosUseCase } from './application/use-cases/listar-usuarios.use-case';
import { CrearUsuarioUseCase } from './application/use-cases/crear-usuario.use-case';
import { ActualizarUsuarioUseCase } from './application/use-cases/actualizar-usuario.use-case';
import { RestablecerContrasenaUseCase } from './application/use-cases/restablecer-contrasena.use-case';
import { DesbloquearUsuarioUseCase } from './application/use-cases/desbloquear-usuario.use-case';
import { ListarRolesUseCase } from './application/use-cases/listar-roles.use-case';
import { ListarPermisosUseCase } from './application/use-cases/listar-permisos.use-case';
import { CrearRolUseCase } from './application/use-cases/crear-rol.use-case';
import { ActualizarRolUseCase } from './application/use-cases/actualizar-rol.use-case';
import { EliminarRolUseCase } from './application/use-cases/eliminar-rol.use-case';
import { IMPRESION_REPOSITORY } from './application/ports/impresion.repository.token';
import { ImpresionApi } from './infrastructure/api/impresion.api';
import { ObtenerConfiguracionImpresionUseCase } from './application/use-cases/obtener-configuracion-impresion.use-case';
import { GuardarConfiguracionImpresionUseCase } from './application/use-cases/guardar-configuracion-impresion.use-case';
import { VistaPreviaReciboUseCase } from './application/use-cases/vista-previa-recibo.use-case';
import { ListarImpresorasUseCase } from './application/use-cases/listar-impresoras.use-case';
import { ProbarConexionImpresoraUseCase } from './application/use-cases/probar-conexion-impresora.use-case';
import { ImprimirPruebaUseCase } from './application/use-cases/imprimir-prueba.use-case';
import { ESTILO_REPOSITORY } from './application/ports/estilo.repository.token';
import { EstiloApi } from './infrastructure/api/estilo.api';
import { ObtenerEstiloUseCase } from './application/use-cases/obtener-estilo.use-case';
import { GuardarEstiloUseCase } from './application/use-cases/guardar-estilo.use-case';
import { LOG_REPOSITORY } from './application/ports/log.repository.token';
import { LogApi } from './infrastructure/api/log.api';
import { ListarLogsUseCase } from './application/use-cases/listar-logs.use-case';
import { DescargarLogDiaUseCase } from './application/use-cases/descargar-log-dia.use-case';
import { DescargarLogsUseCase } from './application/use-cases/descargar-logs.use-case';
import { AREA_NEGOCIO_CONFIG_REPOSITORY } from './application/ports/area-negocio-config.repository.token';
import { AreaNegocioConfigApi } from './infrastructure/api/area-negocio-config.api';
import { ListarAreasNegocioConfigUseCase } from './application/use-cases/listar-areas-negocio-config.use-case';
import { GuardarAreaNegocioUseCase } from './application/use-cases/guardar-area-negocio.use-case';
import { EliminarAreaNegocioUseCase } from './application/use-cases/eliminar-area-negocio.use-case';
import { IMPUESTO_REPOSITORY } from './application/ports/impuesto.repository.token';
import { ImpuestoApi } from './infrastructure/api/impuesto.api';
import { ConfigurarImpuestosUseCase } from './application/use-cases/configurar-impuestos.use-case';
import { ParametrosVentaUseCase } from './application/use-cases/parametros-venta.use-case';
import { GenerarReporteImpuestosUseCase } from './application/use-cases/generar-reporte-impuestos.use-case';

export const configuracionRoutes: Routes = [
  {
    path: '',
    providers: [
      { provide: USUARIO_REPOSITORY, useClass: UsuarioApi },
      { provide: ROL_REPOSITORY, useClass: RolApi },
      { provide: RESPALDO_REPOSITORY, useClass: RespaldoApi },
      { provide: IMPRESION_REPOSITORY, useClass: ImpresionApi },
      { provide: ESTILO_REPOSITORY, useClass: EstiloApi },
      { provide: LOG_REPOSITORY, useClass: LogApi },
      { provide: AREA_NEGOCIO_CONFIG_REPOSITORY, useClass: AreaNegocioConfigApi },
      { provide: IMPUESTO_REPOSITORY, useClass: ImpuestoApi },
      ListarUsuariosUseCase,
      CrearUsuarioUseCase,
      ActualizarUsuarioUseCase,
      RestablecerContrasenaUseCase,
      DesbloquearUsuarioUseCase,
      ListarRolesUseCase,
      ListarPermisosUseCase,
      CrearRolUseCase,
      ActualizarRolUseCase,
      EliminarRolUseCase,
      ListarRespaldosUseCase,
      GenerarRespaldoUseCase,
      DescargarRespaldoUseCase,
      VistaPreviaRespaldoUseCase,
      CargarRespaldoUseCase,
      RestaurarRespaldoUseCase,
      ObtenerConfiguracionImpresionUseCase,
      GuardarConfiguracionImpresionUseCase,
      VistaPreviaReciboUseCase,
      ListarImpresorasUseCase,
      ProbarConexionImpresoraUseCase,
      ImprimirPruebaUseCase,
      ObtenerEstiloUseCase,
      GuardarEstiloUseCase,
      ListarLogsUseCase,
      DescargarLogDiaUseCase,
      DescargarLogsUseCase,
      ListarAreasNegocioConfigUseCase,
      GuardarAreaNegocioUseCase,
      EliminarAreaNegocioUseCase,
      ConfigurarImpuestosUseCase,
      ParametrosVentaUseCase,
      GenerarReporteImpuestosUseCase,
    ],
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        canActivate: [permisoGuard(PERMISOS.CONFIG_USUARIOS)],
        loadComponent: () =>
          import('./presentation/pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
      {
        path: 'roles',
        canActivate: [permisoGuard(PERMISOS.CONFIG_ROLES)],
        loadComponent: () =>
          import('./presentation/pages/roles/roles.component').then(m => m.RolesComponent),
      },
      {
        path: 'respaldos',
        canActivate: [permisoGuard(PERMISOS.RESPALDO_CREAR, PERMISOS.RESPALDO_RESTAURAR, PERMISOS.RESPALDO_CARGAR)],
        loadComponent: () =>
          import('./presentation/pages/respaldos/respaldos.component').then(m => m.RespaldosComponent),
      },
      {
        path: 'impresion',
        canActivate: [permisoGuard(PERMISOS.CONFIG_SISTEMA)],
        loadComponent: () =>
          import('./presentation/pages/impresion/impresion.component').then(m => m.ImpresionComponent),
      },
      {
        path: 'areas-negocio',
        canActivate: [permisoGuard(PERMISOS.CONFIG_AREAS_NEGOCIO)],
        loadComponent: () =>
          import('./presentation/pages/areas-negocio/areas-negocio.component').then(m => m.AreasNegocioComponent),
      },
      {
        path: 'estilos',
        canActivate: [permisoGuard(PERMISOS.CONFIG_ESTILOS)],
        loadComponent: () =>
          import('./presentation/pages/estilos/estilos.component').then(m => m.EstilosComponent),
      },
      {
        path: 'impuestos',
        canActivate: [permisoGuard(PERMISOS.CONFIG_IMPUESTOS)],
        loadComponent: () =>
          import('./presentation/pages/impuestos/impuestos.component').then(m => m.ImpuestosComponent),
      },
      {
        path: 'parametros-venta',
        canActivate: [permisoGuard(PERMISOS.CONFIG_VENTA)],
        loadComponent: () =>
          import('./presentation/pages/parametros-venta/parametros-venta.component').then(
            m => m.ParametrosVentaComponent
          ),
      },
      {
        path: 'reporte-impuestos',
        canActivate: [permisoGuard(PERMISOS.REPORTE_IMPUESTOS)],
        loadComponent: () =>
          import('./presentation/pages/reporte-impuestos/reporte-impuestos.component').then(
            m => m.ReporteImpuestosComponent
          ),
      },
      {
        path: 'logs',
        canActivate: [permisoGuard(PERMISOS.CONFIG_LOGS)],
        loadComponent: () =>
          import('./presentation/pages/logs/logs.component').then(m => m.LogsComponent),
      },
    ],
  },
];
