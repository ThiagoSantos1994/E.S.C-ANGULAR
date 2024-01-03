import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { DetalheLancamentosMensais } from '../interfaces/lancamentos-mensais-detalhe.interface';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService,
    private lancamentosFinanceirosDomain: LancamentosFinanceirosDomain
  ) { }

  getLancamentosFinanceiros(mes: String, ano: String): Observable<LancamentosFinanceiros> {
    //let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<LancamentosFinanceiros>(`springboot-esc-backend/api/lancamentosFinanceiros/consultar/${mes}/${ano}/${this.sessao.getIdLogin()}`/*, { headers: headers }*/)
      .pipe(tap(res => {
        this.lancamentosFinanceirosDomain.setLancamentos(res);
      }), catchError(this.handleError));
  }

  getDetalheDespesasMensais(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    //let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DetalheLancamentosMensais>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consultar/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${ordemExibicao}`/*, { headers: headers }*/)
       .pipe(map((response) => { return response }),
        catchError(this.handleError));
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
