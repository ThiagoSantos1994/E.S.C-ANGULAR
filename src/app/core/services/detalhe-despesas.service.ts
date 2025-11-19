import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DetalheDespesasMensaisDomain } from '../domain/detalhe-despesas-mensais.domain';
import { ChaveKey } from '../interfaces/chave-key.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { Parcelas } from '../interfaces/despesa-parcelada-response.interface';
import { DetalheDespesasMensais } from '../interfaces/detalhe-despesas-mensais.interface';
import { DetalheLancamentosMensais } from '../interfaces/lancamentos-mensais-detalhe.interface';
import { ObservacoesDetalheDespesaRequest } from '../interfaces/observacoes-detalhe-despesa-request.interface';
import { PagamentoDespesasRequest } from '../interfaces/pagamento-despesas-request.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

@Injectable({
  providedIn: 'root'
})
export class DetalheDespesasService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService,
    private mensagemService: MensagemService,
    private detalheDespesaDomain: DetalheDespesasMensaisDomain
  ) { }

  private subject = new Subject<DespesaMensal>();

  public enviaMensagem(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number, idFuncionario: number, mesRef: string, anoRef: string) {
    const despesaMensal: DespesaMensal = {
      idDespesa: idDespesa,
      idDetalheDespesa: idDetalheDespesa,
      idOrdemExibicao: ordemExibicao,
      idFuncionario: idFuncionario,
      mesPesquisaForm: mesRef,
      anoPesquisaForm: anoRef
    };

    this.detalheDespesaDomain.setDespesaMensal(despesaMensal);
    this.subject.next(despesaMensal);
  }

  public recebeMensagem(): Observable<DespesaMensal> {
    return this.subject.asObservable();
  }

  processarPagamentoDetalheDespesa(request: PagamentoDespesasRequest[]) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/baixarPagamentoDespesa`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getChaveKey(tipoChave: string): Observable<ChaveKey> {
    const params = {
      tipoChave: tipoChave
    };

    return this.http.get<ChaveKey>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterNovaChaveKey',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getObservacoesDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idObservacao: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idObservacao: idObservacao.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getHistoricoDetalheDespesa(
    idDetalheDespesaLog: number,
    idDespesa: number,
    idDetalheDespesa: number
  ): Observable<StringResponse> {
    const params = {
      idDetalheDespesaLog: idDetalheDespesaLog.toString(),
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/historico/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  gravarObservacoesDetalheDespesa(request: ObservacoesDetalheDespesaRequest) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/gravar`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getDetalheDespesasMensais(
    idDespesa: number,
    idDetalheDespesa: number,
    ordemExibicao: number,
    exibirConsolidacao: Boolean
  ): Observable<DetalheLancamentosMensais> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      ordem: ordemExibicao.toString(),
      visualizarConsolidacao: exibirConsolidacao.toString()
    };

    return this.http.get<DetalheLancamentosMensais>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getTituloDespesasParceladas(tpListarTodasDespesas: boolean): Observable<TituloDespesaResponse> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString(),
      tipo: tpListarTodasDespesas ? 'default' : 'ativas'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/despesasParceladas/importacao/consultarDespesasParceladas',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getTituloConsolidacoesParaAssociacao(
    idDespesa: number,
    idDetalheDespesa: number,
    tpListarTodasDespesas: boolean
  ): Observable<TituloDespesaResponse> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString(),
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      tipo: tpListarTodasDespesas ? 'default' : 'ativas'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/consolidacao/importacao/consultarConsolidacoes',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getTituloDespesaAlteracao(idDespesa: number, anoReferencia: number): Observable<TituloDespesaResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      anoReferencia: anoReferencia.toString()
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterDespesasMensaisParaAssociacao',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getTituloDespesasRelatorio(idDespesa: number): Observable<TituloDespesaResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterTitulosDespesasRelatorio',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  obterExtratoDespesasParceladasConsolidadas(
    idDespesa: number,
    idDetalheDespesa: number,
    idConsolidacao: number
  ): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idConsolidacao: idConsolidacao.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/detalheDespesas/consolidacao/obterRelatorioDespesasParceladas',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  obterExtratoDetalheDespesaQuitacaoMes(
    idDespesa: number,
    idDetalheDespesa: number
  ): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/detalheDespesas/despesasParceladas/obterRelatorioDespesasParceladasQuitacao',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  excluirDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idOrdem: idOrdem.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais';

    return this.http.delete(url, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDespesaMensal(request: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDetalheDespesa(request: DetalheDespesasMensais[]) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/incluir`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluritemDetalheDespesa(request: DetalheDespesasMensais[]) {
    const url = `springboot-esc-backend/api/v2/lancamentosFinanceiros/detalheDespesasMensais/excluir`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  validarDuplicidadeTituloDespesa(idDespesa: number, idDetalheDespesa: number, tituloDespesa: string): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      tituloDespesa: tituloDespesa
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/validaTituloDespesaDuplicado';

    return this.http.post<StringResponse>(url, {}, { params }).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  organizarListaItensDetalheDespesa(idDespesa: number, idDetalheDespesa: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      ordem: 'prazo'
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/ordenarListaDespesas';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizarOrdemLinhaDetalheDespesa(
    idDespesa: number,
    idDetalheDespesa: number,
    iOrdemAtual: number,
    iNovaOrdem: number
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      iOrdemAtual: iOrdemAtual.toString(),
      iOrdemNova: iNovaOrdem.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDetalheDespesas';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  processarImportacaoDespesasParceladas(
    idDespesa: number,
    idDetalheDespesa: number,
    idDespesaParcelada: number,
    idConsolidacao: number
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idDespesaParcelada: idDespesaParcelada.toString(),
      idConsolidacao: idConsolidacao.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParcelada';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  reprocessarImportacaoDetalheDespesa(
    idDespesa: number,
    idDetalheDespesa: number,
    mesReferencia: string,
    anoReferencia: string,
    repDespNaoParceladas: boolean
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      dsMes: mesReferencia,
      dsAno: anoReferencia,
      bReprocessarTodosValores: repDespNaoParceladas.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/detalheDespesasMensais';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  incluirDespesaParceladaAmortizacao(
    idDespesa: number,
    idDetalheDespesa: number,
    parcelasAmortizada: Parcelas[]
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParceladaAmortizada';

    return this.http.post(url, parcelasAmortizada, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getExtratoDetalheDespesa(idDespesa: number, idDetalheDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      tipoConsulta: 'detalheDespesas'
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterExtratoDespesasMes',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  adiarFluxoParcelas(despesas: DetalheDespesasMensais[]) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/adiarFluxoParcelas`, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  desfazerAdiamentoFluxoParcelas(despesas: DetalheDespesasMensais[]) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/desfazerAdiamentoFluxoParcelas`, despesas).pipe(
      catchError(error => this.handleError(error))
    );
  }

  associarDespesasConsolidacao(idConsolidacao: number, despesas: DetalheDespesasMensais[]) {
    const params = {
      idConsolidacao: idConsolidacao.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consolidacao/associar';

    return this.http.post(url, despesas, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  alterarReferenciaDespesaMensal(idDespesa: number, idDetalheDespesa: number, idDetalheDespesaNova: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idDetalheDespesaNova: idDetalheDespesaNova.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/alterarReferenciaDespesa';

    return this.http.post(url, null, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  obterMesAnoPorID(idDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterMesAnoPorID',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  gerarDespesaFuturaVisualizacao(mesRef: string, anoRef: string) {
    const params = {
      dsMes: mesRef,
      dsAno: anoRef,
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/gerarDespesasFuturas';

    return this.http.post(url, {}, { params }).pipe(
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
