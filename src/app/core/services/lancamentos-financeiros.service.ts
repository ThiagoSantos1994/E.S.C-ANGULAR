import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { CategoriaDespesasResponse } from '../interfaces/categoria-despesa-response.interface';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from '../interfaces/lancamentos-mensais.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { MensagemService } from './mensagem.service';
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
    private mensagemService: MensagemService,
    private lancamentosFinanceirosDomain: LancamentosFinanceirosDomain,
    private errorHandler: HttpErrorHandlerService
  ) { }

  private subject = new Subject<any>();

  public enviaMensagem(tipoMensagem: String) {
    this.subject.next(tipoMensagem);
  }

  public recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getLancamentosFinanceiros(mes: string, ano: string): Observable<LancamentosFinanceiros> {
    const params = {
      dsMes: mes,
      dsAno: ano,
      idFuncionario: this.sessao.getIdLogin()
    };

    // let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<LancamentosFinanceiros>(
      'springboot-esc-backend/api/lancamentosFinanceiros/consultar',
      { params /*, headers */ }
    ).pipe(
      tap(res => {
        this.lancamentosFinanceirosDomain.setLancamentos(res);
      }),
      catchError(this.errorHandler.handleError)
    );
  }

  getLancamentosMensaisConsolidados(idDespesa: string, idConsolidacao: string): Observable<LancamentosMensais[]> {
    const params = new HttpParams()
      .set('idDespesa', idDespesa)
      .set('idConsolidacao', idConsolidacao)
      .set('idFuncionario', this.sessao.getIdLogin());

    return this.http.get<LancamentosMensais[]>(
      'springboot-esc-backend/api/lancamentosMensais/consolidados/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getConfiguracaoLancamentos(): Observable<ConfiguracaoLancamentos> {
    const params = {
      idFuncionario: this.sessao.getIdLogin()
    };

    return this.http.get<ConfiguracaoLancamentos>(
      'springboot-esc-backend/api/parametros/obterConfiguracaoLancamentos/usuario',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getSubTotalCategoriaDespesas(idDespesa: number): Observable<CategoriaDespesasResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin()
    };

    return this.http.get<CategoriaDespesasResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/categoriaDespesa/subTotal',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getSubTotalAnoCategoriaDespesas(anoRef: number): Observable<CategoriaDespesasResponse> {
    const params = {
      dsAno: anoRef.toString(),
      idFuncionario: this.sessao.getIdLogin()
    };

    return this.http.get<CategoriaDespesasResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/categoriaDespesa/subTotal/anual',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  atualizarOrdemLinhaReceita(
    idDespesa: number,
    iOrdemAtual: number,
    iNovaOrdem: number
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      iOrdemAtual: iOrdemAtual.toString(),
      iOrdemNova: iNovaOrdem.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesasFixas';

    return this.http.post(url, {}, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  atualizarOrdemLinhaDespesa(
    idDespesa: number,
    iOrdemAtual: number,
    iNovaOrdem: number
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      iOrdemAtual: iOrdemAtual.toString(),
      iOrdemNova: iNovaOrdem.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesas';

    return this.http.post(url, {}, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  gravarParametrizacao(parametros: ConfiguracaoLancamentos) {
    const url = `springboot-esc-backend/api/parametros/gravar`;
    return this.http.post(url, parametros).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  gravarReceita(receita: DespesasFixasMensais) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais/gravar`;
    return this.http.post(url, receita).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  excluirReceita(idDespesa: number, iOrdemReceita: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idOrdem: iOrdemReceita.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais';

    return this.http.delete(url, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  excluirDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idOrdem: idOrdem.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais';

    return this.http.delete(url, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  desassociarDespesasConsolidacao(idDespesa: number, idDetalheDespesa: number, idConsolidacao: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idConsolidacao: idConsolidacao.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/consolidacao/desassociar';

    return this.http.post(url, {}, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  processarImportacaoLancamentos(idDespesa: number, dsMes: number, dsAno: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      dsMes: dsMes.toString(),
      dsAno: dsAno.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/processamento';

    return this.http.post(url, {}, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  excluirTodosLancamentos(idDespesa: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros';

    return this.http.delete(url, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  processarPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/baixarPagamentoDespesa';

    return this.http.post(url, despesas).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  desfazerPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/desfazerPagamentoDespesa';

    return this.http.post(url, despesas).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  executarBackup(): Observable<StringResponse> {
    const url = `springboot-esc-backend/api/backup/processar`;
    return this.http.post<StringResponse>(url, {}).pipe(map((response) => { return response }),
      catchError(this.errorHandler.handleError));
  }

  gravarDespesaMensal(despesa: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, despesa).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  consolidarDespesasMensais(idConsolidacao: number, despesas: LancamentosMensais[]) {
    const params = new HttpParams().set('idConsolidacao', idConsolidacao.toString());

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/consolidacao/associar';

    return this.http.post(url, despesas, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  editarTituloDespesa(idDetalheDespesa: number, tituloDespesa: string, anoReferencia: string) {
    const params = {
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      novoTituloDespesa: tituloDespesa,
      anoReferencia: anoReferencia
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarTituloDespesa';

    return this.http.post(url, {}, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  obterExtratoDespesaQuitacaoMes(idDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterRelatorioDespesasParceladasQuitacao',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  limparDadosTemporarios() {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/login/limparDadosTemporarios';

    return this.http.delete(url, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }
}
