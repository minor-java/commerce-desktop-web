import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { AreaNegocioRepository } from "../../../application/ports/area-negocio.repository";
import { AreaNegocio } from "../../../domain/area-negocio.model";
import { environment } from "../../../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AreaNegocioApi implements AreaNegocioRepository {

  private readonly http = inject(HttpClient);
  private readonly catalogoBaseUrl = `${environment.apiUrl}/catalogo`;

  listarActivos(): Promise<AreaNegocio[]> {
    return firstValueFrom(
      this.http.get<AreaNegocio[]>(`${this.catalogoBaseUrl}/area-negocio/activos`)
    );
  }
}
