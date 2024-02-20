import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';

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

  private subject = new Subject<any>();

  public enviaMensagem() {
    this.subject.next();
  }

  public recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getLancamentosFinanceiros(mes: String, ano: String): Observable<LancamentosFinanceiros> {
    //let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<LancamentosFinanceiros>(`springboot-esc-backend/api/lancamentosFinanceiros/consultar/${mes}/${ano}/${this.sessao.getIdLogin()}`/*, { headers: headers }*/)
      .pipe(tap(res => {
        this.lancamentosFinanceirosDomain.setLancamentos(res);
      }), catchError(this.handleError));
  }

  getConfiguracaoLancamentos(): Observable<ConfiguracaoLancamentos> {
    return this.http.get<ConfiguracaoLancamentos>(`springboot-esc-backend/api/parametros/obterConfiguracaoLancamentos/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  atualizarOrdemLinhaReceita(idDespesa: number, iOrdemAtual: number, iNovaOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesasFixas/${idDespesa}/${iOrdemAtual}/${iNovaOrdem}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizarOrdemLinhaDespesa(idDespesa: number, iOrdemAtual: number, iNovaOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesas/${idDespesa}/${iOrdemAtual}/${iNovaOrdem}/${this.sessao.getIdLogin()}`;
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

  processarImportacaoLancamentos(idDespesa: number, dsMes: number, dsAno: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/importacao/processamento/${idDespesa}/${this.sessao.getIdLogin()}/${dsMes}/${dsAno}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirTodosLancamentos(idDespesa: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/excluir/${idDespesa}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  processarPagamentoDespesa(idDespesa: number, idDetalheDespesa: number, observacaoPagamento?: string) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/baixarPagamentoDespesa/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${observacaoPagamento}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDespesaMensal(despesa: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, despesa).pipe(
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

    alert('Ops, Ocorreu um erro no servidor, tente novamente mais tarde.')
    return throwError(error);
  }
}
