export interface CodigoBarra {
  id: string;

  codigo: string;

  tipo?: string;

  principal?: boolean;

  creadoEn: Date;
  creadoPor: string;
  actualizadoPor?: string;
}

export interface GenerarCodigoBarraResponse {
  codigo: string;
  tipo: string;
}

export interface LineaTicket {
  tipo: string;
  texto?: string;
  alineacion?: string;
  negrita?: boolean;
  tamano?: string;
  cantidad?: number;
  base64?: string;
}

export interface ImprimirEtiquetaCodigoBarraResponse {
  lineas: LineaTicket[];
}