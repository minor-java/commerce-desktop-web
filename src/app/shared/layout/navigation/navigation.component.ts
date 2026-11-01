import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { Permiso, PERMISOS } from '../../../core/auth/permisos';

interface NavItem {
  label: string;
  route?: string;
  disabled?: boolean;
  /** El item se muestra si el usuario tiene alguno de estos permisos. */
  permisos: Permiso[];
}

interface NavSectionDef {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationComponent {
  private readonly auth = inject(AuthService);

  private readonly sectionDefs: NavSectionDef[] = [
    {
      label: 'Inicio',
      items: [
        { label: 'Dashboard', route: '/home', permisos: [PERMISOS.DASHBOARD_VER] },
        { label: 'Reporte de impuestos', route: '/configuracion/reporte-impuestos', permisos: [PERMISOS.REPORTE_IMPUESTOS] },
      ],
    },
    {
      label: 'Caja',
      items: [
        { label: 'Punto de Venta', route: '/caja/nueva-venta', permisos: [PERMISOS.VENTA_REGISTRAR] },
        { label: 'Apertura / Cierre', route: '/caja/caja', permisos: [PERMISOS.CAJA_OPERAR] },
        { label: 'Historial de Ventas', route: '/caja/historial-ventas', permisos: [PERMISOS.VENTA_HISTORIAL] },
        { label: 'Devoluciones', route: '/caja/devoluciones', permisos: [PERMISOS.VENTA_DEVOLUCION] },
      ],
    },
    {
      label: 'Combos',
      items: [
        { label: 'Gestión de Combos', route: '/caja/combos', permisos: [PERMISOS.COMBO_GESTIONAR] },
      ],
    },
    {
      label: 'Inventario',
      items: [
        { label: 'Productos', route: '/catalogo/producto', permisos: [PERMISOS.PRODUCTO_VER] },
        { label: 'Compras', route: '/inventario/compra', permisos: [PERMISOS.COMPRA_VER] },
        { label: 'Stock', route: '/inventario/stock', permisos: [PERMISOS.STOCK_VER] },
        { label: 'Pérdidas', route: '/inventario/perdidas', permisos: [PERMISOS.PERDIDA_GESTIONAR] },
        { label: 'Movimientos', route: '/movimientos/movimientos', permisos: [PERMISOS.MOVIMIENTO_VER] },
        { label: 'Historial Cajas', route: '/inventario/historial-caja', permisos: [PERMISOS.CAJA_HISTORIAL] },
      ],
    },
    {
      label: 'Configuración',
      items: [
        { label: 'Usuarios', route: '/configuracion/usuarios', permisos: [PERMISOS.CONFIG_USUARIOS] },
        { label: 'Roles y permisos', route: '/configuracion/roles', permisos: [PERMISOS.CONFIG_ROLES] },
        {
          label: 'Respaldos',
          route: '/configuracion/respaldos',
          permisos: [PERMISOS.RESPALDO_CREAR, PERMISOS.RESPALDO_RESTAURAR, PERMISOS.RESPALDO_CARGAR],
        },
        { label: 'Áreas de negocio', route: '/configuracion/areas-negocio', permisos: [PERMISOS.CONFIG_AREAS_NEGOCIO] },
        { label: 'Impuestos', route: '/configuracion/impuestos', permisos: [PERMISOS.CONFIG_IMPUESTOS] },
        { label: 'Parámetros de venta', route: '/configuracion/parametros-venta', permisos: [PERMISOS.CONFIG_VENTA] },
        { label: 'Impresión', route: '/configuracion/impresion', permisos: [PERMISOS.CONFIG_SISTEMA] },
        { label: 'Estilos', route: '/configuracion/estilos', permisos: [PERMISOS.CONFIG_ESTILOS] },
        { label: 'Logs', route: '/configuracion/logs', permisos: [PERMISOS.CONFIG_LOGS] },
      ],
    },
  ];

  private readonly expandedState = signal<Record<string, boolean>>(
    Object.fromEntries(this.sectionDefs.map(s => [s.label, true]))
  );

  readonly sections = computed(() => {
    const propios = this.auth.permisos();
    const expanded = this.expandedState();
    return this.sectionDefs
      .map(s => ({ ...s, items: s.items.filter(i => i.permisos.some(p => propios.has(p))) }))
      .filter(s => s.items.length > 0)
      .map(s => ({ ...s, expanded: expanded[s.label] ?? true }));
  });

  toggle(label: string): void {
    this.expandedState.update(state => ({ ...state, [label]: !(state[label] ?? true) }));
  }
}
