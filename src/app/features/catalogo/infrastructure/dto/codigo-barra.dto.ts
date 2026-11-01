export interface CodigoBarraDto {
  id: string;

  codigo: string;

  tipo?: string;

  principal?: boolean;

  creadoEn: string;
  creadoPor: string;
  
  actualizadoPor?: string;
}