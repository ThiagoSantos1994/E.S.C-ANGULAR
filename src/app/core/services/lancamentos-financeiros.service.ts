import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { DetalheLancamentosMensais } from '../interfaces/lancamentos-mensais-detalhe.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';

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

  atualizarOrdemLinhaReceita(idDespesa: number, iOrdemAtual: number, iNovaOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesasFixas/${idDespesa}/${iOrdemAtual}/${iNovaOrdem}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarReceita(receita: DespesasFixasMensais) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais/gravar`;
    return this.http.post(url, receita).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirReceita(idDespesa: number, iOrdemReceita: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais/excluir/${idDespesa}/${iOrdemReceita}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }
  
  excluirDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/excluir/${idDespesa}/${idDetalheDespesa}/${idOrdem}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/excluir/${idDespesa}/${idDetalheDespesa}/${idOrdem}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
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
