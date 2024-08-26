import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from '../interfaces/lancamentos-mensais.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { CategoriaDespesasResponse } from '../interfaces/categoria-despesa-response.interface';

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

  public enviaMensagem(tipoMensagem: String) {
    this.subject.next(tipoMensagem);
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

  getSubTotalCategoriaDespesas(idDespesa: number): Observable<CategoriaDespesasResponse> {
    return this.http.get<CategoriaDespesasResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/categoriaDespesa/subTotal/${idDespesa}/${this.sessao.getIdLogin()}`)
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

  gravarParametrizacao(parametros: ConfiguracaoLancamentos) {
    const url = `springboot-esc-backend/api/parametros/gravar`;
    return this.http.post(url, parametros).pipe(
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

  processarPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = `springboot-esc-backend/api/v2/lancamentosFinanceiros/baixarPagamentoDespesa/${this.sessao.getIdLogin()}`;
    return this.http.post(url, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  desfazerPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/desfazerPagamentoDespesa/${this.sessao.getIdLogin()}`;
    return this.http.post(url, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDespesaMensal(despesa: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, despesa).pipe(
      catchError(error => this.handleError(error))
    );
  }

  editarTituloDespesa(idDetalheDespesa: number, tituloDespesa: string) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/alterarTituloDespesa/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${tituloDespesa}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  obterExtratoDespesaQuitacaoMes(idDespesa: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/despesasParceladas/obterRelatorioDespesasParceladasQuitacao/${idDespesa}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  limparDadosTemporarios() {
    const url = `springboot-esc-backend/api/login/limparDadosTemporarios/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      if (error.error.codigo == 204) {
        alert(error.error.mensagem);
      } else {
        alert('Ops, Ocorreu um erro no servidor, tente novamente mais tarde.');
      }
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}` +
        `mensagem: ${error.error.mensagem}`);
    }

    return throwError(error);
  }
}
