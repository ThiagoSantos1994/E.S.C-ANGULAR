import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { CategoriaDespesasResponse } from '../interfaces/categoria-despesa-response.interface';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from '../interfaces/lancamentos-mensais.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService,
    private mensagemService: MensagemService,
    private lancamentosFinanceirosDomain: LancamentosFinanceirosDomain
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
      catchError(this.handleError)
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
      catchError(this.handleError)
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
      catchError(this.handleError)
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
      catchError(this.handleError)
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
      catchError(error => this.handleError(error))
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
    const params = {
      idDespesa: idDespesa.toString(),
      idOrdem: iOrdemReceita.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais';

    return this.http.delete(url, { params }).pipe(
      catchError(error => this.handleError(error))
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
      catchError(error => this.handleError(error))
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
      catchError(error => this.handleError(error))
    );
  }

  excluirTodosLancamentos(idDespesa: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros';

    return this.http.delete(url, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  processarPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/baixarPagamentoDespesa';

    return this.http.post(url, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  desfazerPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/desfazerPagamentoDespesa';

    return this.http.post(url, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  executarBackup(): Observable<StringResponse> {
    const url = `springboot-esc-backend/api/backup/processar`;
    return this.http.post<StringResponse>(url, {}).pipe(map((response) => { return response }),
      catchError(this.handleError));
  }

  gravarDespesaMensal(despesa: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, despesa).pipe(
      catchError(error => this.handleError(error))
    );
  }

  consolidarDespesasMensais(idConsolidacao: number, despesas: DespesaMensal[]) {
    const params = new HttpParams().set('idConsolidacao', idConsolidacao.toString());

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/consolidacao/associar';

    return this.http.post(url, despesas, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  editarTituloDespesa(idDetalheDespesa: number, tituloDespesa: string) {
    const params = {
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      novoTituloDespesa: tituloDespesa
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarTituloDespesa';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
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
      catchError(this.handleError)
    );
  }

  limparDadosTemporarios() {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/login/limparDadosTemporarios';

    return this.http.delete(url, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    this.fecharSpinner();
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      if (error.error.codigo == 204 || error.error.codigo == 400) {
        this.mensagemService.enviarMensagem(error.error.mensagem, TipoMensagem.Alerta);
      } else {
        this.mensagemService.enviarMensagem("Ops!! Ocorreu um erro no servidor. Tente novamente mais tarde.", TipoMensagem.Erro);
      }
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}` +
        `mensagem: ${error.error.mensagem}`);
    }

    return throwError(error);
  }

  fecharSpinner() {
    this.mensagemService.enviarMensagem(null, null);
  }
}
