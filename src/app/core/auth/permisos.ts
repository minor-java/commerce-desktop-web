/**
 * Códigos de permiso. Deben coincidir con la tabla PERMISO del backend
 * (migración V3__roles_permisos.sql), que los exige con @PreAuthorize.
 */
export const PERMISOS = {
  DASHBOARD_VER: 'DASHBOARD_VER',
  CAJA_OPERAR: 'CAJA_OPERAR',
  VENTA_REGISTRAR: 'VENTA_REGISTRAR',
  VENTA_HISTORIAL: 'VENTA_HISTORIAL',
  VENTA_DEVOLUCION: 'VENTA_DEVOLUCION',
  COMBO_GESTIONAR: 'COMBO_GESTIONAR',
  // Productos y Compras (V8__permisos_productos_compras.sql)
  PRODUCTO_VER: 'PRODUCTO_VER',
  PRODUCTO_CREAR: 'PRODUCTO_CREAR',
  PRODUCTO_EDITAR: 'PRODUCTO_EDITAR',
  PRODUCTO_EDITAR_PRECIO: 'PRODUCTO_EDITAR_PRECIO',
  COMPRA_VER: 'COMPRA_VER',
  COMPRA_CREAR: 'COMPRA_CREAR',
  STOCK_VER: 'STOCK_VER',
  STOCK_VER_RESUMEN: 'STOCK_VER_RESUMEN',
  PERDIDA_GESTIONAR: 'PERDIDA_GESTIONAR',
  MOVIMIENTO_VER: 'MOVIMIENTO_VER',
  MOVIMIENTO_REVERSAR: 'MOVIMIENTO_REVERSAR',
  CAJA_HISTORIAL: 'CAJA_HISTORIAL',
  CONFIG_USUARIOS: 'CONFIG_USUARIOS',
  CONFIG_ROLES: 'CONFIG_ROLES',
  CONFIG_SISTEMA: 'CONFIG_SISTEMA',
  CONFIG_ESTILOS: 'CONFIG_ESTILOS',
  CONFIG_LOGS: 'CONFIG_LOGS',
  CONFIG_AREAS_NEGOCIO: 'CONFIG_AREAS_NEGOCIO',
  // Impuestos y parámetros de venta (V14__impuestos_parametros_venta.sql)
  CONFIG_IMPUESTOS: 'CONFIG_IMPUESTOS',
  CONFIG_VENTA: 'CONFIG_VENTA',
  REPORTE_IMPUESTOS: 'REPORTE_IMPUESTOS',
  RESPALDO_CREAR: 'RESPALDO_CREAR',
  RESPALDO_RESTAURAR: 'RESPALDO_RESTAURAR',
  RESPALDO_CARGAR: 'RESPALDO_CARGAR',
  // Control de caja (V6__permisos_control_caja.sql)
  VENTA_PAGO_EFECTIVO: 'VENTA_PAGO_EFECTIVO',
  VENTA_PAGO_TRANSFERENCIA: 'VENTA_PAGO_TRANSFERENCIA',
  VENTA_EDITAR_PRECIO: 'VENTA_EDITAR_PRECIO',
  CAJA_VER_TOTALES: 'CAJA_VER_TOTALES',
  CAJA_VER_RESUMEN_CIERRE: 'CAJA_VER_RESUMEN_CIERRE',
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

/**
 * Orden en que se elige la pantalla inicial tras el login:
 * la primera ruta para la que el usuario tenga permiso.
 */
export const RUTAS_INICIALES: { permiso: Permiso; ruta: string }[] = [
  { permiso: PERMISOS.DASHBOARD_VER, ruta: '/home' },
  { permiso: PERMISOS.VENTA_REGISTRAR, ruta: '/caja/nueva-venta' },
  { permiso: PERMISOS.CAJA_OPERAR, ruta: '/caja/caja' },
  { permiso: PERMISOS.VENTA_HISTORIAL, ruta: '/caja/historial-ventas' },
  { permiso: PERMISOS.VENTA_DEVOLUCION, ruta: '/caja/devoluciones' },
  { permiso: PERMISOS.COMBO_GESTIONAR, ruta: '/caja/combos' },
  { permiso: PERMISOS.PRODUCTO_VER, ruta: '/catalogo/producto' },
  { permiso: PERMISOS.STOCK_VER, ruta: '/inventario/stock' },
  { permiso: PERMISOS.COMPRA_VER, ruta: '/inventario/compra' },
  { permiso: PERMISOS.PERDIDA_GESTIONAR, ruta: '/inventario/perdidas' },
  { permiso: PERMISOS.MOVIMIENTO_VER, ruta: '/movimientos/movimientos' },
  { permiso: PERMISOS.CAJA_HISTORIAL, ruta: '/inventario/historial-caja' },
  { permiso: PERMISOS.CONFIG_USUARIOS, ruta: '/configuracion/usuarios' },
  { permiso: PERMISOS.CONFIG_ROLES, ruta: '/configuracion/roles' },
  { permiso: PERMISOS.RESPALDO_CREAR, ruta: '/configuracion/respaldos' },
  { permiso: PERMISOS.RESPALDO_RESTAURAR, ruta: '/configuracion/respaldos' },
  { permiso: PERMISOS.RESPALDO_CARGAR, ruta: '/configuracion/respaldos' },
  { permiso: PERMISOS.CONFIG_SISTEMA, ruta: '/configuracion/impresion' },
  { permiso: PERMISOS.CONFIG_ESTILOS, ruta: '/configuracion/estilos' },
  { permiso: PERMISOS.CONFIG_LOGS, ruta: '/configuracion/logs' },
  { permiso: PERMISOS.CONFIG_AREAS_NEGOCIO, ruta: '/configuracion/areas-negocio' },
  { permiso: PERMISOS.CONFIG_IMPUESTOS, ruta: '/configuracion/impuestos' },
  { permiso: PERMISOS.CONFIG_VENTA, ruta: '/configuracion/parametros-venta' },
  { permiso: PERMISOS.REPORTE_IMPUESTOS, ruta: '/configuracion/reporte-impuestos' },
];
