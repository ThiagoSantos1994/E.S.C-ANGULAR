import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DespesasFixas } from '../domain/despesas-fixas.domain';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from '../interfaces/despesas-mensais.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private despesasFixasDomain: DespesasFixas) { }

  getDespesasMensais() {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasMensais>('springboot-esc-backend/api/obterListaDespesasMensais/2/61', { headers: headers })
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getDespesasFixasMensais(mes: String, ano: String, idUsuario: String): Observable<DespesasFixasMensais> {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasFixasMensais>(`springboot-esc-backend/api/obterListaDespesasFixasMensais/${mes}/${ano}/${idUsuario}`, { headers: headers })
      .pipe(tap(res => {
        this.despesasFixasDomain.setDespesas(res);
      }), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}`);
    }
    return throwError(error);
  }
}
