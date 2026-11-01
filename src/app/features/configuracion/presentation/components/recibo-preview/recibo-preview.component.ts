import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { LineaTicket, PUNTOS_POR_CARACTER } from '../../../domain/impresion.model';

type Alineacion = 'left' | 'center' | 'right';

type LineaVista =
  | { tipo: 'texto'; texto: string; alineacion: Alineacion; negrita: boolean; grande: boolean; alto: boolean }
  | { tipo: 'avance'; lineas: number }
  | { tipo: 'logo' }
  | { tipo: 'qr'; anchoCh: number; path: string }
  | { tipo: 'barcode'; texto: string; path: string }
  | { tipo: 'corte' }
  | { tipo: 'cajon' };

const MODULOS_QR = 21;

/**
 * Simula el papel térmico a partir de las mismas líneas que se envían a la impresora:
 * cada carácter ocupa 1ch, el texto GRANDE es doble ancho (como ESC/POS) y el logo se
 * muestra en blanco y negro con el mismo umbral que usa el backend al imprimir.
 */
@Component({
  selector: 'app-recibo-preview',
  templateUrl: './recibo-preview.component.html',
  styleUrl: './recibo-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReciboPreviewComponent {
  readonly lineas = input.required<LineaTicket[]>();
  /** Ancho del papel en caracteres. */
  readonly ancho = input.required<number>();
  /** PNG en Base64 (sin prefijo). */
  readonly logoBase64 = input<string | null>(null);
  /** Ancho del logo en puntos de impresión. */
  readonly logoAncho = input<number>(384);
  readonly actualizando = input(false);

  /** Logo ya escalado y binarizado, como saldrá impreso. */
  readonly logoProcesado = signal<string | null>(null);

  readonly logoAnchoCh = computed(() =>
    Math.min(this.logoAncho(), this.ancho() * PUNTOS_POR_CARACTER) / PUNTOS_POR_CARACTER
  );

  readonly vista = computed<LineaVista[]>(() => this.lineas().map(l => this.convertir(l)));

  constructor() {
    effect(onCleanup => {
      const base64 = this.logoBase64();
      const anchoPuntos = Math.round(this.logoAnchoCh() * PUNTOS_POR_CARACTER);
      let cancelado = false;
      onCleanup(() => (cancelado = true));
      if (!base64) {
        this.logoProcesado.set(null);
        return;
      }
      binarizar(base64, anchoPuntos).then(url => {
        if (!cancelado) this.logoProcesado.set(url);
      });
    });
  }

  private convertir(l: LineaTicket): LineaVista {
    const ancho = this.ancho();
    switch ((l.tipo ?? '').toUpperCase()) {
      case 'TEXTO':
        return {
          tipo: 'texto',
          texto: l.texto ?? '',
          alineacion: (l.alineacion ?? 'LEFT').toLowerCase() as Alineacion,
          negrita: !!l.negrita,
          grande: (l.tamano ?? '').toUpperCase() === 'GRANDE',
          alto: (l.tamano ?? '').toUpperCase() === 'ALTO',
        };
      case 'SEPARADOR':
        return { tipo: 'texto', texto: '-'.repeat(ancho), alineacion: 'left', negrita: false, grande: false, alto: false };
      case 'SEPARADOR_DOBLE':
        return { tipo: 'texto', texto: '='.repeat(ancho), alineacion: 'left', negrita: false, grande: false, alto: false };
      case 'FEED':
        return { tipo: 'avance', lineas: l.cantidad ?? 1 };
      case 'LOGO':
        return { tipo: 'logo' };
      case 'QR': {
        // Tamaño de módulo en puntos × (21 módulos + margen) ≈ ancho real impreso.
        const modulo = l.cantidad ?? 6;
        return { tipo: 'qr', anchoCh: (modulo * (MODULOS_QR + 4)) / PUNTOS_POR_CARACTER, path: qrSimulado(l.texto ?? '') };
      }
      case 'BARCODE':
        return { tipo: 'barcode', texto: l.texto ?? '', path: barrasSimuladas(l.texto ?? '') };
      case 'CORTE':
        return { tipo: 'corte' };
      case 'CAJON':
        return { tipo: 'cajon' };
      default:
        return { tipo: 'avance', lineas: 0 };
    }
  }
}

/** Escala al ancho de impresión y aplica umbral (luminancia < 128 = negro), igual que BitonalThreshold. */
function binarizar(base64: string, anchoPuntos: number): Promise<string | null> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const ancho = Math.max(1, anchoPuntos);
      const alto = Math.max(1, Math.round((img.naturalHeight * ancho) / img.naturalWidth));
      const canvas = document.createElement('canvas');
      canvas.width = ancho;
      canvas.height = alto;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, ancho, alto);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, ancho, alto);
      const datos = ctx.getImageData(0, 0, ancho, alto);
      const p = datos.data;
      for (let i = 0; i < p.length; i += 4) {
        const lum = 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
        const v = lum < 128 ? 0 : 255;
        p[i] = p[i + 1] = p[i + 2] = v;
        p[i + 3] = 255;
      }
      ctx.putImageData(datos, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = `data:image/png;base64,${base64}`;
  });
}

/** Patrón tipo QR (no escaneable) con los tres marcadores de esquina; solo ilustra tamaño y posición. */
function qrSimulado(texto: string): string {
  let semilla = 0;
  for (const c of texto) semilla = (semilla * 31 + c.charCodeAt(0)) >>> 0;
  const aleatorio = () => {
    semilla = (semilla * 1103515245 + 12345) >>> 0;
    return (semilla >>> 16) & 1;
  };
  const enMarcador = (x: number, y: number) => {
    const en = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return en(0, 0) || en(MODULOS_QR - 7, 0) || en(0, MODULOS_QR - 7);
  };
  const marcador = (x: number, y: number) => {
    const lx = x % (MODULOS_QR - 7) === x ? x : x - (MODULOS_QR - 7);
    const ly = y % (MODULOS_QR - 7) === y ? y : y - (MODULOS_QR - 7);
    const borde = lx === 0 || lx === 6 || ly === 0 || ly === 6;
    const centro = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
    return borde || centro;
  };
  let d = '';
  for (let y = 0; y < MODULOS_QR; y++) {
    for (let x = 0; x < MODULOS_QR; x++) {
      const negro = enMarcador(x, y) ? marcador(x, y) : aleatorio() === 1;
      if (negro) d += `M${x + 2} ${y + 2}h1v1h-1z`;
    }
  }
  return d;
}

/** Barras ilustrativas (no escaneables), centradas en el ancho de 200 del viewBox como en el impreso. */
function barrasSimuladas(texto: string): string {
  const barras: { x: number; grosor: number }[] = [];
  let x = 0;
  const codigos = [...`*${texto}*`].map(c => c.charCodeAt(0));
  for (const codigo of codigos) {
    for (let b = 0; b < 4; b++) {
      const grosor = ((codigo >> b) & 1) + 1;
      barras.push({ x, grosor });
      x += grosor + (((codigo >> (b + 2)) & 1) + 1);
    }
  }
  const desplazamiento = Math.max(0, (200 - x) / 2);
  return barras.map(b => `M${b.x + desplazamiento} 0h${b.grosor}v30h-${b.grosor}z`).join('');
}
