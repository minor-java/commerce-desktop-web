import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';

import { routes } from './app.routes';
import { TemaService } from './core/tema/tema.service';
import { PRODUCTO_REPOSITORY } from './features/catalogo/application/ports/producto.repository.token';
import { ProductoApi } from './features/catalogo/infrastructure/api/producto/producto.api';
import { AREA_NEGOCIO_REPOSITORY } from './features/catalogo/application/ports/area-negocio.repository.token';
import { AreaNegocioApi } from './features/catalogo/infrastructure/api/area-negocio/area-negocio.api';
import { CAJA_REPOSITORY } from './features/caja/application/ports/caja.repository.token';
import { CajaApi } from './features/caja/infrastructure/api/caja.api';
import { STOCK_MOVIMIENTO_REPOSITORY } from './features/inventario/application/ports/stock-movimiento.repository.token';
import { StockMovimientoApi } from './features/inventario/infrastructure/api/stock-movimiento.api';
import { COMPRA_REPOSITORY } from './features/inventario/application/ports/compra.repository.token';
import { CompraApi } from './features/inventario/infrastructure/api/compra.api';
import { VENTA_REPOSITORY } from './features/caja/application/ports/venta.repository.token';
import { VentaApi } from './features/caja/infrastructure/api/venta.api';
import { MOVIMIENTO_REPOSITORY } from './features/movimientos/application/ports/movimiento.repository.token';
import { MovimientoApi } from './features/movimientos/infrastructure/api/movimiento.api';
import { DASHBOARD_REPOSITORY } from './features/home/application/ports/dashboard.repository.token';
import { DashboardApi } from './features/home/infrastructure/api/dashboard.api';
import { HISTORIAL_CAJA_REPOSITORY } from './features/inventario/application/ports/historial-caja.repository.token';
import { HistorialCajaApi } from './features/inventario/infrastructure/api/historial-caja.api';
import { DETALLE_CAJA_REPOSITORY } from './features/inventario/application/ports/detalle-caja.repository.token';
import { DetalleCajaApi } from './features/inventario/infrastructure/api/detalle-caja.api';
import { VENTA_DETALLE_CAJA_REPOSITORY } from './features/inventario/application/ports/venta-detalle-caja.repository.token';
import { VentaDetalleCajaApi } from './features/inventario/infrastructure/api/venta-detalle-caja.api';
import { REVERSO_DETALLE_CAJA_REPOSITORY } from './features/inventario/application/ports/reverso-detalle-caja.repository.token';
import { ReversoDetalleCajaApi } from './features/inventario/infrastructure/api/reverso-detalle-caja.api';
import { COMBO_REPOSITORY } from './features/caja/combos/application/ports/combo.repository.token';
import { ComboApi } from './features/caja/combos/infrastructure/api/combo.api';
import { PERDIDA_REPOSITORY } from './features/inventario/application/ports/perdida.repository.token';
import { PerdidaApi } from './features/inventario/infrastructure/api/perdida.api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Aplica de inmediato el ultimo estilo conocido y lo actualiza desde el backend sin bloquear el arranque.
    provideAppInitializer(() => { void inject(TemaService).cargar(); }),
    { provide: PRODUCTO_REPOSITORY, useClass: ProductoApi },  // TODO: mover a catalogo.routes cuando el use-case deje de ser providedIn root
    { provide: AREA_NEGOCIO_REPOSITORY, useClass: AreaNegocioApi }, // TODO: mover a catalogo.routes cuando el use-case deje de ser providedIn root
    { provide: CAJA_REPOSITORY, useClass: CajaApi },          // TODO: mover a caja.routes cuando el use-case deje de ser providedIn root
    { provide: STOCK_MOVIMIENTO_REPOSITORY, useClass: StockMovimientoApi }, // TODO: mover a inventario.routes cuando el use-case deje de ser providedIn root
    { provide: COMPRA_REPOSITORY, useClass: CompraApi },      // TODO: mover a inventario.routes cuando el use-case deje de ser providedIn root
    { provide: VENTA_REPOSITORY, useClass: VentaApi },        // TODO: mover a caja.routes cuando el use-case deje de ser providedIn root
    { provide: MOVIMIENTO_REPOSITORY, useClass: MovimientoApi }, // TODO: mover a movimientos.routes cuando el use-case deje de ser providedIn root
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardApi },
    { provide: HISTORIAL_CAJA_REPOSITORY, useClass: HistorialCajaApi }, // TODO: mover a inventario.routes cuando el use-case deje de ser providedIn root
    { provide: DETALLE_CAJA_REPOSITORY, useClass: DetalleCajaApi },    // TODO: mover a inventario.routes cuando el use-case deje de ser providedIn root
    { provide: VENTA_DETALLE_CAJA_REPOSITORY, useClass: VentaDetalleCajaApi },
    { provide: REVERSO_DETALLE_CAJA_REPOSITORY, useClass: ReversoDetalleCajaApi },
    { provide: COMBO_REPOSITORY, useClass: ComboApi },          // TODO: mover a caja.routes cuando el use-case deje de ser providedIn root
    { provide: PERDIDA_REPOSITORY, useClass: PerdidaApi },      // TODO: mover a inventario.routes cuando el use-case deje de ser providedIn root
  ],
};
