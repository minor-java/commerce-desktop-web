export interface Rol {
  id: number;
  nombre: string;
  descripcion: string | null;
  permisos: string[];
  cantidadUsuarios: number;
  fechaCreacion: string;
  fechaActualizacion: string | null;
}

export interface GuardarRol {
  nombre: string;
  descripcion: string | null;
  permisos: string[];
}

export interface PermisoCatalogo {
  codigo: string;
  modulo: string;
  /** Componente/pantalla del módulo (Punto de venta, Apertura y cierre…). */
  seccion: string;
  /** Permiso del que depende: sin el padre, el hijo no tiene efecto. */
  padre: string | null;
  nombre: string;
  descripcion: string | null;
}

/**
 * Un componente dentro de un módulo.
 * - Con `raiz`: la raíz habilita el componente y `opciones` son sus permisos hijos.
 * - Sin `raiz` (p. ej. Respaldos): `opciones` son permisos independientes.
 */
export interface SeccionPermisos {
  nombre: string;
  raiz: PermisoCatalogo | null;
  opciones: PermisoCatalogo[];
  todos: PermisoCatalogo[];
}

export interface ModuloArbol {
  modulo: string;
  etiqueta: string;
  secciones: SeccionPermisos[];
  todos: PermisoCatalogo[];
}

/** Módulo > sección > raíz + opciones, conservando el orden del backend. */
export function agruparJerarquia(permisos: PermisoCatalogo[]): ModuloArbol[] {
  return agruparPorModulo(permisos).map(m => {
    const porSeccion = new Map<string, PermisoCatalogo[]>();
    for (const p of m.permisos) {
      const lista = porSeccion.get(p.seccion) ?? [];
      lista.push(p);
      porSeccion.set(p.seccion, lista);
    }
    const secciones = [...porSeccion.entries()].map(([nombre, todos]) => {
      const raices = todos.filter(p => !p.padre);
      // Una única raíz con hijos (o sola) es el permiso que habilita el componente.
      const raiz = raices.length === 1 ? raices[0] : null;
      return { nombre, raiz, opciones: todos.filter(p => p !== raiz), todos };
    });
    return { modulo: m.modulo, etiqueta: m.etiqueta, secciones, todos: m.permisos };
  });
}

export interface ModuloPermisos {
  modulo: string;
  etiqueta: string;
  permisos: PermisoCatalogo[];
}

const ETIQUETAS_MODULO: Record<string, string> = {
  DASHBOARD: 'Inicio',
  CAJA: 'Caja',
  COMBOS: 'Combos',
  INVENTARIO: 'Inventario',
  CONFIGURACION: 'Configuración',
};

/** Agrupa el catálogo por módulo conservando el orden en que llega del backend. */
export function agruparPorModulo(permisos: PermisoCatalogo[]): ModuloPermisos[] {
  const grupos = new Map<string, ModuloPermisos>();
  for (const p of permisos) {
    let grupo = grupos.get(p.modulo);
    if (!grupo) {
      grupo = { modulo: p.modulo, etiqueta: ETIQUETAS_MODULO[p.modulo] ?? p.modulo, permisos: [] };
      grupos.set(p.modulo, grupo);
    }
    grupo.permisos.push(p);
  }
  return [...grupos.values()];
}
