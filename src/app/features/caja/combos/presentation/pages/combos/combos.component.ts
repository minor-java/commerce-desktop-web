import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ListarCombosUseCase } from '../../../application/use-cases/listar-combos.use-case';
import { EliminarComboUseCase } from '../../../application/use-cases/eliminar-combo.use-case';
import { ActualizarComboUseCase } from '../../../application/use-cases/actualizar-combo.use-case';
import { CrearComboUseCase } from '../../../application/use-cases/crear-combo.use-case';
import { CalcularCostoComboUseCase } from '../../../application/use-cases/calcular-costo-combo.use-case';
import { ObtenerComboUseCase } from '../../../application/use-cases/obtener-combo.use-case';
import { VerificarCodigoBarrasUseCase } from '../../../application/use-cases/verificar-codigo-barras.use-case';
import { GenerarCodigoBarrasUseCase } from '../../../application/use-cases/generar-codigo-barras.use-case';
import { ConsultarStockVendibleUseCase } from '../../../application/use-cases/consultar-stock-vendible.use-case';
import { Combo, CostoComboResult, ItemCombo } from '../../../domain/combo.model';
import { BuscarProductoStockUseCase } from '../../../../application/use-cases/buscar-producto-stock.use-case';
import { ProductoStock } from '../../../../domain/venta.model';
import { ToastService } from '../../../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../../../shared/components/pagination/pagination.component';
import { BuscarProductoDialogComponent } from '../../../../presentation/components/buscar-producto-dialog/buscar-producto-dialog.component';
import { DetalleComboDialogComponent } from '../../components/detalle-combo-dialog/detalle-combo-dialog.component';
import { CodigosBarrasComboDialogComponent } from '../../components/codigos-barras-combo-dialog/codigos-barras-combo-dialog.component';
import { CodigosBarrasPrintListComponent } from '../../components/codigos-barras-print-list/codigos-barras-print-list.component';
import { SelectorTarifaComponent } from '../../../../../../shared/components/selector-tarifa/selector-tarifa.component';
import { NegocioService } from '../../../../../../core/negocio/negocio.service';
import { ImpuestosVigentes } from '../../../../../../core/negocio/negocio.model';
import { FormControl } from '@angular/forms';

type Vista = 'tabla' | 'paso1';

const PATRON_CODIGO_AUTOGENERADO = /^20\d{11}$/;

@Component({
  selector: 'app-combos',
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, PaginationComponent, BuscarProductoDialogComponent, DetalleComboDialogComponent, CodigosBarrasComboDialogComponent, CodigosBarrasPrintListComponent, SelectorTarifaComponent],
})
export class CombosComponent implements OnInit {
  private readonly listarUseCase = inject(ListarCombosUseCase);
  private readonly eliminarUseCase = inject(EliminarComboUseCase);
  private readonly actualizarUseCase = inject(ActualizarComboUseCase);
  private readonly negocio = inject(NegocioService);

  /** Tarifas para el selector (solo se muestra si el negocio es responsable de IVA). */
  readonly impuestos = signal<ImpuestosVigentes | null>(null);
  /** Tarifa propia del combo nuevo / en edición (null = la del área de sus productos). */
  readonly tarifaCombo = new FormControl<number | null>(null);
  readonly editTarifa = new FormControl<number | null>(null);
  private readonly crearUseCase = inject(CrearComboUseCase);
  private readonly calcularCostoUseCase = inject(CalcularCostoComboUseCase);
  private readonly obtenerUseCase = inject(ObtenerComboUseCase);
  private readonly verificarCodigoUseCase = inject(VerificarCodigoBarrasUseCase);
  private readonly generarCodigoUseCase = inject(GenerarCodigoBarrasUseCase);
  private readonly consultarStockUseCase = inject(ConsultarStockVendibleUseCase);
  private readonly buscarProductoUseCase = inject(BuscarProductoStockUseCase);
  private readonly toast = inject(ToastService);

  private readonly scanInputRef = viewChild<ElementRef<HTMLInputElement>>('scanInput');
  private readonly cantidadInputRef = viewChild<ElementRef<HTMLInputElement>>('cantidadInput');
  private readonly agregarBtnRef = viewChild<ElementRef<HTMLButtonElement>>('agregarBtn');

  // ── Estado global ───────────────────────────────────────────────────────────
  readonly vista = signal<Vista>('tabla');

  // ── Tabla ────────────────────────────────────────────────────────────────────
  readonly combos = signal<Combo[]>([]);
  readonly totalRows = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly totalPages = signal(0);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly pageSizeOptions = [5, 10, 20, 50];

  readonly filtroNombre = signal('');
  readonly filtroActivo = signal<string>('');
  readonly filtroFechaDesde = signal('');
  readonly filtroFechaHasta = signal('');
  readonly filtroCodigoBarra = signal('');
  readonly errorFecha = signal<string | null>(null);

  // ── Detalle dialog ───────────────────────────────────────────────────────────
  readonly comboDetalle = signal<Combo | null>(null);
  readonly cargandoDetalle = signal(false);
  readonly costoDetalle = signal<CostoComboResult | null>(null);

  // ── Códigos de barras dialog ────────────────────────────────────────────────
  readonly comboCodigosBarras = signal<Combo | null>(null);

  // ── Selección de fila ────────────────────────────────────────────────────────
  readonly comboSeleccionado = signal<Combo | null>(null);

  // ── Editar ───────────────────────────────────────────────────────────────────
  readonly editarAbierto = signal(false);
  readonly editNombre = signal('');
  readonly editPrecioBase = signal('');
  readonly editPrecioBaseDisplay = signal('');
  readonly editActivo = signal(true);
  readonly editCantidadDisponible = signal(0);
  readonly editComboFull = signal<Combo | null>(null);
  readonly editCosto = signal<CostoComboResult | null>(null);
  readonly cargandoEditDetalle = signal(false);
  readonly editCodigosOriginales = signal<string[]>([]);
  readonly editCodigosBarras = signal<string[]>([]);
  readonly editCodigoBarraInput = signal('');
  readonly editVerificandoCodigo = signal(false);
  readonly editGenerandoCodigo = signal(false);
  readonly errorEditNombre = signal<string | null>(null);
  readonly errorEditPrecio = signal<string | null>(null);
  readonly errorEditCantidad = signal<string | null>(null);
  readonly guardandoEdit = signal(false);

  // ── Paso 1: lista de productos del combo ─────────────────────────────────────
  readonly itemsCombo = signal<ItemCombo[]>([]);
  readonly buscandoScan = signal(false);
  readonly dialogBuscarAbierto = signal(false);

  // Modal cantidad (agregar / editar)
  readonly modalAbierto = signal(false);
  readonly modalProducto = signal<ProductoStock | null>(null);
  readonly modalCantidad = signal(1);
  readonly modalModo = signal<'agregar' | 'editar'>('agregar');
  readonly modalItemIndex = signal(-1);

  // ── Paso 2 y Resumen: dialogs ────────────────────────────────────────────────
  readonly paso2Abierto = signal(false);
  readonly resumenAbierto = signal(false);
  readonly nombreCombo = signal('');
  readonly precioBase = signal('');
  readonly precioBaseDisplay = signal('');
  readonly cantidadCombo = signal(1);
  readonly codigosBarras = signal<string[]>([]);
  readonly codigoBarraInput = signal('');
  readonly verificandoCodigo = signal(false);
  readonly generandoCodigo = signal(false);
  readonly errorNombre = signal<string | null>(null);
  readonly errorPrecio = signal<string | null>(null);
  readonly errorCantidad = signal<string | null>(null);
  readonly cargandoCosto = signal(false);
  readonly costoResult = signal<CostoComboResult | null>(null);

  // ── Resumen ───────────────────────────────────────────────────────────────────
  readonly guardando = signal(false);

  readonly totalCombo = computed(() =>
    this.itemsCombo().reduce((sum, it) => sum + it.cantidad, 0)
  );

  readonly costoByProductoId = computed(() => {
    const result = this.costoResult();
    if (!result) return new Map<number, { unitario: number; total: number }>();
    return new Map(result.items.map(i => [i.productoId, { unitario: i.costoUnitario, total: i.costoItem }]));
  });

  readonly itemsConStockInsuficiente = computed(() =>
    this.itemsCombo().filter(item => item.cantidad * this.cantidadCombo() > item.stock)
  );

  readonly costoTotalCombos = computed(() =>
    (this.costoResult()?.costoTotal ?? 0) * this.cantidadCombo()
  );

  readonly tieneCodigoAutogenerado = computed(() =>
    this.codigosBarras().some(codigo => PATRON_CODIGO_AUTOGENERADO.test(codigo))
  );

  readonly editTieneCodigoAutogenerado = computed(() =>
    this.editCodigosBarras().some(codigo => PATRON_CODIGO_AUTOGENERADO.test(codigo))
  );

  ngOnInit(): void {
    void this.cargar();
  }

  // ────────────────────────────────────────────────────────────────────────────
  // TABLA
  // ────────────────────────────────────────────────────────────────────────────

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);
    try {
      const res = await this.listarUseCase.execute({
        page: this.page(),
        size: this.size(),
        ...(this.filtroNombre().trim() ? { nombre: this.filtroNombre().trim() } : {}),
        ...(this.filtroActivo() !== '' ? { activo: this.filtroActivo() === 'true' } : {}),
        ...(this.filtroCodigoBarra().trim() ? { codigoBarra: this.filtroCodigoBarra().trim() } : {}),
        ...this.buildFiltroFechas(),
      });
      this.combos.set(res.contenido);
      this.totalRows.set(res.totalRows);
      this.totalPages.set(res.totalPages);
    } catch {
      this.error.set('Error al cargar los combos. Verifique la conexión.');
    } finally {
      this.cargando.set(false);
    }
  }

  limpiarFiltros(): void {
    this.filtroNombre.set('');
    this.filtroActivo.set('');
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroCodigoBarra.set('');
    this.errorFecha.set(null);
    this.page.set(0);
    void this.cargar();
  }

  aplicarFiltros(): void {
    if (!this.validarFiltroFechas()) return;
    this.page.set(0);
    void this.cargar();
  }

  cambiarPagina(p: number): void {
    if (p === this.page()) return;
    this.page.set(p);
    void this.cargar();
  }

  cambiarTamano(s: number): void {
    this.size.set(s);
    this.page.set(0);
    void this.cargar();
  }

  actualizarFechaDesde(event: Event): void {
    this.filtroFechaDesde.set((event.target as HTMLInputElement).value);
    if (this.validarFiltroFechas()) { this.page.set(0); void this.cargar(); }
  }

  actualizarFechaHasta(event: Event): void {
    this.filtroFechaHasta.set((event.target as HTMLInputElement).value);
    if (this.validarFiltroFechas()) { this.page.set(0); void this.cargar(); }
  }

  actualizarFiltroActivo(event: Event): void {
    this.filtroActivo.set((event.target as HTMLSelectElement).value);
    this.page.set(0);
    void this.cargar();
  }

  private validarFiltroFechas(): boolean {
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();
    if ((desde && !hasta) || (!desde && hasta)) {
      this.errorFecha.set('Ingrese ambas fechas para filtrar');
      return false;
    }
    if (desde && hasta && desde > hasta) {
      this.errorFecha.set('La fecha inicial no puede ser mayor a la final');
      return false;
    }
    this.errorFecha.set(null);
    return true;
  }

  private buildFiltroFechas(): { fechaDesde?: string; fechaHasta?: string } {
    const desde = this.filtroFechaDesde();
    const hasta = this.filtroFechaHasta();
    if (!desde || !hasta) return {};
    return { fechaDesde: `${desde}T00:00:00`, fechaHasta: `${hasta}T23:59:59` };
  }

  formatearFecha(iso: string): string {
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  }

  // ── Detalle ──────────────────────────────────────────────────────────────────

  async abrirDetalle(combo: Combo): Promise<void> {
    this.cargandoDetalle.set(true);
    this.comboDetalle.set(combo);
    this.costoDetalle.set(null);
    try {
      const detalle = await this.obtenerUseCase.execute(combo.id);
      this.comboDetalle.set(detalle);
      if (detalle.detalles?.length > 0) {
        const costo = await this.calcularCostoUseCase.execute(
          detalle.detalles.map(d => ({ productoId: d.productoId, cantidad: d.cantidad }))
        );
        this.costoDetalle.set(costo);
      }
    } catch {
      this.toast.show('Error al cargar el detalle del combo', 'error');
      this.comboDetalle.set(null);
    } finally {
      this.cargandoDetalle.set(false);
    }
  }

  cerrarDetalle(): void {
    this.comboDetalle.set(null);
    this.costoDetalle.set(null);
  }

  // ── Códigos de barras ────────────────────────────────────────────────────────

  abrirCodigosBarras(combo: Combo): void {
    this.comboCodigosBarras.set(combo);
  }

  cerrarCodigosBarras(): void {
    this.comboCodigosBarras.set(null);
  }


  // ────────────────────────────────────────────────────────────────────────────
  // SELECCIÓN Y EDICIÓN
  // ────────────────────────────────────────────────────────────────────────────

  seleccionarCombo(combo: Combo): void {
    this.comboSeleccionado.update(actual =>
      actual?.id === combo.id ? null : combo
    );
  }

  async abrirEditar(): Promise<void> {
    const combo = this.comboSeleccionado();
    if (!combo) return;
    this.editNombre.set(combo.nombre);
    const precioEntero = Math.round(combo.precioBase);
    this.editPrecioBase.set(String(precioEntero));
    this.editPrecioBaseDisplay.set(precioEntero > 0 ? precioEntero.toLocaleString('es-CO') : '');
    this.editActivo.set(combo.activo);
    this.editTarifa.setValue(combo.tarifaImpuestoId ?? null);
    void this.cargarImpuestos();
    this.editCantidadDisponible.set(combo.cantidadDisponible ?? 0);
    this.editComboFull.set(null);
    this.editCosto.set(null);
    this.editCodigosOriginales.set([]);
    this.editCodigosBarras.set([]);
    this.editCodigoBarraInput.set('');
    this.editGenerandoCodigo.set(false);
    this.errorEditNombre.set(null);
    this.errorEditPrecio.set(null);
    this.errorEditCantidad.set(null);
    this.editarAbierto.set(true);

    this.cargandoEditDetalle.set(true);
    try {
      const full = await this.obtenerUseCase.execute(combo.id);
      this.editComboFull.set(full);
      const codigos = full.codigosBarras ?? [];
      this.editCodigosOriginales.set([...codigos]);
      this.editCodigosBarras.set([...codigos]);
      if (full.detalles?.length > 0) {
        const costo = await this.calcularCostoUseCase.execute(
          full.detalles.map(d => ({ productoId: d.productoId, cantidad: d.cantidad }))
        );
        this.editCosto.set(costo);
      }
    } catch {
      // no bloquea el dialog si falla
    } finally {
      this.cargandoEditDetalle.set(false);
    }
  }

  cerrarEditar(): void {
    this.editarAbierto.set(false);
  }

  onEditPrecioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.editPrecioBaseDisplay.set(formatted);
    input.value = formatted;
    this.editPrecioBase.set(raw);
  }

  async agregarCodigoEdit(): Promise<void> {
    const codigo = this.editCodigoBarraInput().trim();
    if (!codigo || this.editVerificandoCodigo()) return;

    if (this.editCodigosBarras().includes(codigo)) {
      this.toast.show(`El código "${codigo}" ya está en el listado`, 'error');
      return;
    }

    if (this.editCodigosOriginales().includes(codigo)) {
      this.editCodigosBarras.update(list => [...list, codigo]);
      this.editCodigoBarraInput.set('');
      return;
    }

    this.editVerificandoCodigo.set(true);
    try {
      const existe = await this.verificarCodigoUseCase.execute(codigo);
      if (existe) {
        this.toast.show(`El código "${codigo}" ya está en uso`, 'error');
        return;
      }
      this.editCodigosBarras.update(list => [...list, codigo]);
      this.editCodigoBarraInput.set('');
    } catch {
      this.toast.show('Error al verificar el código', 'error');
    } finally {
      this.editVerificandoCodigo.set(false);
    }
  }

  eliminarCodigoEdit(index: number): void {
    this.editCodigosBarras.update(list => list.filter((_, i) => i !== index));
  }

  async generarCodigoBarrasEdit(): Promise<void> {
    if (this.editTieneCodigoAutogenerado() || this.editGenerandoCodigo()) return;

    this.editGenerandoCodigo.set(true);
    try {
      const { codigo } = await this.generarCodigoUseCase.execute();
      this.editCodigosBarras.update(list => [...list, codigo]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar el código de barras. Intente nuevamente.';
      this.toast.show(msg, 'error');
    } finally {
      this.editGenerandoCodigo.set(false);
    }
  }

  onEditCantidadInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;
    input.value = String(value);
    this.editCantidadDisponible.set(value);
    this.errorEditCantidad.set(null);
  }

  async guardarEdicion(): Promise<void> {
    this.errorEditNombre.set(null);
    this.errorEditPrecio.set(null);
    this.errorEditCantidad.set(null);

    const nombre = this.editNombre().trim();
    if (!nombre) { this.errorEditNombre.set('El nombre es obligatorio'); return; }

    const precioRaw = this.editPrecioBase().trim().replace(',', '.');
    const precio = parseFloat(precioRaw);
    if (isNaN(precio) || precio <= 0) { this.errorEditPrecio.set('Ingrese un precio válido mayor a cero'); return; }

    if (this.editCantidadDisponible() < 0) { this.errorEditCantidad.set('La cantidad no puede ser negativa'); return; }

    if (this.guardandoEdit()) return;
    this.guardandoEdit.set(true);
    try {
      await this.actualizarUseCase.execute(this.comboSeleccionado()!.id, {
        nombre,
        precioBase: precio,
        activo: this.editActivo(),
        tarifaImpuestoId: this.editTarifa.value ?? 0,
        cantidadDisponible: this.editCantidadDisponible(),
        codigosBarras: this.editCodigosBarras(),
      });
      this.toast.show(`Combo "${nombre}" actualizado`, 'success');
      this.editarAbierto.set(false);
      this.comboSeleccionado.set(null);
      void this.cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el combo';
      this.toast.show(msg, 'error');
    } finally {
      this.guardandoEdit.set(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CREAR COMBO — PASO 1
  // ────────────────────────────────────────────────────────────────────────────

  private async cargarImpuestos(): Promise<void> {
    try {
      this.impuestos.set(await this.negocio.impuestosVigentes());
    } catch {
      this.impuestos.set(null);
    }
  }

  iniciarCrear(): void {
    this.itemsCombo.set([]);
    this.nombreCombo.set('');
    this.precioBase.set('');
    this.precioBaseDisplay.set('');
    this.cantidadCombo.set(1);
    this.tarifaCombo.setValue(null);
    void this.cargarImpuestos();
    this.costoResult.set(null);
    this.paso2Abierto.set(false);
    this.resumenAbierto.set(false);
    this.codigosBarras.set([]);
    this.codigoBarraInput.set('');
    this.generandoCodigo.set(false);
    this.errorNombre.set(null);
    this.errorPrecio.set(null);
    this.errorCantidad.set(null);
    this.vista.set('paso1');
    setTimeout(() => this.scanInputRef()?.nativeElement.focus(), 50);
  }

  cancelarCrear(): void {
    this.paso2Abierto.set(false);
    this.resumenAbierto.set(false);
    this.vista.set('tabla');
  }

  onScanKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); void this.escanear(); }
  }

  async escanear(): Promise<void> {
    const inputEl = this.scanInputRef()?.nativeElement;
    const codigo = (inputEl?.value ?? '').trim();
    if (!codigo || this.buscandoScan()) return;

    this.buscandoScan.set(true);
    try {
      const producto = await this.buscarProductoUseCase.execute(codigo);

      if (producto.stock <= 0) {
        this.toast.show(`"${producto.nombreCompleto}" no tiene stock disponible`, 'error');
        return;
      }

      const existingIndex = this.itemsCombo().findIndex(i => i.productoId === producto.productoId);

      if (existingIndex >= 0) {
        const item = this.itemsCombo()[existingIndex];
        if (item.cantidad >= item.stock) {
          this.toast.show(`Stock máximo alcanzado para "${producto.nombreCompleto}"`, 'error');
          return;
        }
        this.itemsCombo.update(list =>
          list.map((it, i) => i === existingIndex ? { ...it, cantidad: it.cantidad + 1 } : it)
        );
      } else {
        this.itemsCombo.update(list => [
          ...list,
          { productoId: producto.productoId!, nombreCompleto: producto.nombreCompleto, stock: producto.stock, cantidad: 1 },
        ]);
      }

      this.refreshCosto();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar el producto';
      this.toast.show(msg, 'error');
    } finally {
      this.buscandoScan.set(false);
      if (inputEl) inputEl.value = '';
      setTimeout(() => inputEl?.focus(), 50);
    }
  }

  abrirDialogBuscar(): void {
    this.dialogBuscarAbierto.set(true);
  }

  cerrarDialogBuscar(): void {
    this.dialogBuscarAbierto.set(false);
    setTimeout(() => this.scanInputRef()?.nativeElement.focus(), 50);
  }

  async onProductoSeleccionadoDesdeDialog(producto: ProductoStock): Promise<void> {
    const yaExiste = this.itemsCombo().some(i => i.productoId === producto.productoId);
    if (yaExiste) {
      this.toast.show(`"${producto.nombreCompleto}" ya está en el combo`, 'error');
      this.cerrarDialogBuscar();
      return;
    }
    this.cerrarDialogBuscar();
    try {
      const stockVendible = await this.consultarStockUseCase.execute(producto.productoId!);
      if (stockVendible <= 0) {
        this.toast.show(`"${producto.nombreCompleto}" no tiene stock disponible para combos`, 'error');
        return;
      }
      this.abrirModalAgregar({ ...producto, stock: stockVendible });
    } catch {
      this.abrirModalAgregar(producto);
    }
  }

  abrirModalAgregar(producto: ProductoStock): void {
    this.modalProducto.set(producto);
    this.modalCantidad.set(1);
    this.modalModo.set('agregar');
    this.modalItemIndex.set(-1);
    this.modalAbierto.set(true);
    setTimeout(() => this.cantidadInputRef()?.nativeElement.focus(), 50);
  }

  async abrirModalEditar(index: number): Promise<void> {
    const item = this.itemsCombo()[index];
    let stockVendible = item.stock;
    try {
      stockVendible = await this.consultarStockUseCase.execute(item.productoId);
      this.itemsCombo.update(list =>
        list.map((it, i) => i === index ? { ...it, stock: stockVendible } : it)
      );
    } catch { /* usa stock almacenado */ }

    this.modalProducto.set({
      productoId: item.productoId,
      nombreCompleto: item.nombreCompleto,
      precioVenta: 0,
      stock: stockVendible,
    });
    this.modalCantidad.set(item.cantidad);
    this.modalModo.set('editar');
    this.modalItemIndex.set(index);
    this.modalAbierto.set(true);
    setTimeout(() => this.cantidadInputRef()?.nativeElement.focus(), 50);
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.modalProducto.set(null);
    setTimeout(() => this.scanInputRef()?.nativeElement.focus(), 50);
  }

  confirmarModal(): void {
    const producto = this.modalProducto();
    if (!producto) return;
    const cantidad = this.modalCantidad();
    if (cantidad < 1 || cantidad > producto.stock) return;

    if (this.modalModo() === 'agregar') {
      this.itemsCombo.update(list => [
        ...list,
        { productoId: producto.productoId!, nombreCompleto: producto.nombreCompleto, stock: producto.stock, cantidad },
      ]);
    } else {
      const idx = this.modalItemIndex();
      this.itemsCombo.update(list =>
        list.map((it, i) => (i === idx ? { ...it, cantidad } : it))
      );
    }
    this.cerrarModal();
    this.refreshCosto();
  }

  onCantidadInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    const stock = this.modalProducto()?.stock ?? 1;
    if (isNaN(value) || value < 1) value = 1;
    if (value > stock) value = Math.floor(stock);
    input.value = String(value);
    this.modalCantidad.set(value);
  }

  onCantidadKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault();
      this.agregarBtnRef()?.nativeElement.focus();
    }
  }

  onAgregarKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.confirmarModal(); }
    else if (event.key === 'Tab' && !event.shiftKey) { event.preventDefault(); this.cantidadInputRef()?.nativeElement.focus(); }
  }

  eliminarItemCombo(index: number): void {
    this.itemsCombo.update(list => list.filter((_, i) => i !== index));
    this.refreshCosto();
  }

  private refreshCosto(): void {
    const items = this.itemsCombo();
    if (items.length === 0) { this.costoResult.set(null); return; }
    void this.calcularCostoUseCase
      .execute(items.map(i => ({ productoId: i.productoId, cantidad: i.cantidad })))
      .then(result => this.costoResult.set(result))
      .catch(() => { /* silencioso — el costo exacto se recalcula al ir a paso2 */ });
  }

  async irAPaso2(): Promise<void> {
    if (this.itemsCombo().length === 0) {
      this.toast.show('Agregue al menos un producto al combo', 'error');
      return;
    }
    if (!this.validarItemsCombo()) {
      this.toast.show(
        'El combo debe tener al menos 2 productos diferentes, o 1 producto con cantidad mínima de 2 unidades',
        'error'
      );
      return;
    }
    this.cargandoCosto.set(true);
    try {
      const result = await this.calcularCostoUseCase.execute(
        this.itemsCombo().map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
      );
      this.costoResult.set(result);
      this.paso2Abierto.set(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al calcular el costo';
      this.toast.show(msg, 'error');
    } finally {
      this.cargandoCosto.set(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CREAR COMBO — PASO 2 (dialog)
  // ────────────────────────────────────────────────────────────────────────────

  volverAPaso1(): void {
    this.paso2Abierto.set(false);
  }

  async agregarCodigoCombo(): Promise<void> {
    const codigo = this.codigoBarraInput().trim();
    if (!codigo || this.verificandoCodigo()) return;

    if (this.codigosBarras().includes(codigo)) {
      this.toast.show(`El código "${codigo}" ya está en la lista`, 'error');
      return;
    }

    this.verificandoCodigo.set(true);
    try {
      const existe = await this.verificarCodigoUseCase.execute(codigo);
      if (existe) {
        this.toast.show(`El código "${codigo}" ya está en uso por otro producto o combo`, 'error');
        return;
      }
      this.codigosBarras.update(list => [...list, codigo]);
      this.codigoBarraInput.set('');
    } catch {
      this.toast.show('Error al verificar el código. Intente nuevamente.', 'error');
    } finally {
      this.verificandoCodigo.set(false);
    }
  }

  eliminarCodigoCombo(index: number): void {
    this.codigosBarras.update(list => list.filter((_, i) => i !== index));
  }

  async generarCodigoBarrasCombo(): Promise<void> {
    if (this.tieneCodigoAutogenerado() || this.generandoCodigo()) return;

    this.generandoCodigo.set(true);
    try {
      const { codigo } = await this.generarCodigoUseCase.execute();
      this.codigosBarras.update(list => [...list, codigo]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al generar el código de barras. Intente nuevamente.';
      this.toast.show(msg, 'error');
    } finally {
      this.generandoCodigo.set(false);
    }
  }

  private validarItemsCombo(): boolean {
    const items = this.itemsCombo();
    return items.length >= 2 || (items.length === 1 && items[0].cantidad >= 2);
  }

  async irAResumen(): Promise<void> {
    this.errorNombre.set(null);
    this.errorPrecio.set(null);

    const nombre = this.nombreCombo().trim();
    if (!nombre) { this.errorNombre.set('El nombre es obligatorio'); return; }

    const precioRaw = this.precioBase().trim().replace(',', '.');
    const precio = parseFloat(precioRaw);
    if (isNaN(precio) || precio <= 0) { this.errorPrecio.set('Ingrese un precio base válido mayor a cero'); return; }

    if (this.cantidadCombo() < 1) { this.errorCantidad.set('La cantidad debe ser al menos 1'); return; }

    if (this.itemsConStockInsuficiente().length > 0) {
      this.toast.show('Hay productos sin stock suficiente para la cantidad de combos solicitada', 'error');
      return;
    }

    // Recalcular costo con las cantidades actuales
    this.cargandoCosto.set(true);
    try {
      const result = await this.calcularCostoUseCase.execute(
        this.itemsCombo().map(i => ({ productoId: i.productoId, cantidad: i.cantidad }))
      );
      this.costoResult.set(result);
    } catch {
      this.toast.show('Error al recalcular el costo', 'error');
      return;
    } finally {
      this.cargandoCosto.set(false);
    }

    this.paso2Abierto.set(false);
    this.resumenAbierto.set(true);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // CREAR COMBO — RESUMEN
  // ────────────────────────────────────────────────────────────────────────────

  volverAPaso2(): void {
    this.resumenAbierto.set(false);
    this.paso2Abierto.set(true);
  }

  async guardarCombo(): Promise<void> {
    if (this.guardando()) return;
    this.guardando.set(true);
    try {
      const precio = parseFloat(this.precioBase().trim().replace(',', '.'));
      const combo = await this.crearUseCase.execute({
        nombre: this.nombreCombo().trim(),
        descripcion: null,
        precioBase: precio,
        cantidadDisponible: this.cantidadCombo(),
        activo: true,
        codigosBarras: this.codigosBarras(),
        tarifaImpuestoId: this.tarifaCombo.value,
        detalles: this.itemsCombo().map(i => ({ productoId: i.productoId, cantidad: i.cantidad })),
      });
      this.toast.show(`Combo "${combo.nombre}" creado correctamente`, 'success');
      this.resumenAbierto.set(false);
      this.vista.set('tabla');
      this.page.set(0);
      void this.cargar();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el combo';
      this.toast.show(msg, 'error');
    } finally {
      this.guardando.set(false);
    }
  }

  onPrecioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value.replace(/\D/g, '');
    const formatted = raw === '' ? '' : Number(raw).toLocaleString('es-CO');
    this.precioBaseDisplay.set(formatted);
    input.value = formatted;
    this.precioBase.set(raw);
  }

  onCantidadComboInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 1) value = 1;
    input.value = String(value);
    this.cantidadCombo.set(value);
    this.errorCantidad.set(null);
  }
}
