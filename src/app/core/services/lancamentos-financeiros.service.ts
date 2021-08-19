import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DespesasFixasDomain } from '../domain/despesas-fixas.domain';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from '../interfaces/despesas-mensais.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService,
    private despesasFixasDomain: DespesasFixasDomain
  ) { }

  getDespesasMensais(idDespesa: number) {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasMensais>(`springboot-esc-backend/api/obterListaDespesasMensais/${this.sessao.getIdLogin()}/${idDespesa}`, { headers: headers })
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getDespesasFixasMensais(mes: String, ano: String): Observable<DespesasFixasMensais> {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasFixasMensais>(`springboot-esc-backend/api/obterListaDespesasFixasMensais/${mes}/${ano}/${this.sessao.getIdLogin()}`, { headers: headers })
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
