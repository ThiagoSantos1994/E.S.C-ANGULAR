import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
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
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DetalheDespesasService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private detalheDespesaDomain: DetalheDespesasMensaisDomain
  ) { }

  private readonly subject = new Subject<DespesaMensal>();

  enviaMensagem(
    idDespesa: number,
    idDetalheDespesa: number,
    ordemExibicao: number,
    idFuncionario: number,
    mesRef: string,
    anoRef: string
  ): void {
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

  recebeMensagem(): Observable<DespesaMensal> {
    return this.subject.asObservable();
  }

  getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  processarPagamentoDetalheDespesa(request: PagamentoDespesasRequest[]): Observable<any> {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/baixarPagamentoDespesa`;
    return this.http.post(url, request, { headers: this.getHeaders() });
  }

  getChaveKey(tipoChave: string): Observable<ChaveKey> {
    const params = {
      tipoChave: tipoChave
    };

    return this.http.get<ChaveKey>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterNovaChaveKey',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getObservacoesDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idObservacao: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idObservacao: idObservacao.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
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
      idDetalheDespesa: idDetalheDespesa.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/historico/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  gravarObservacoesDetalheDespesa(request: ObservacoesDetalheDespesaRequest) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/gravar`;
    return this.http.post(url, request, { headers: this.getHeaders() });
  }

  getDetalheDespesasMensais(
    idDespesa: number,
    idDetalheDespesa: number,
    ordemExibicao: number,
    exibirConsolidacao: Boolean
  ): Observable<DetalheLancamentosMensais> {
    const params = {
      idDespesa: idDespesa ? idDespesa.toString() : '',
      idDetalheDespesa: idDetalheDespesa ? idDetalheDespesa.toString() : '',
      ordem: ordemExibicao ? ordemExibicao.toString() : '0',
      visualizarConsolidacao: exibirConsolidacao ? exibirConsolidacao.toString() : 'false'
    };

    return this.http.get<DetalheLancamentosMensais>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getTituloDespesasParceladas(tpListarTodasDespesas: boolean): Observable<TituloDespesaResponse> {
    const params = {
      tipo: tpListarTodasDespesas ? 'default' : 'ativas'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/despesasParceladas/importacao/consultarDespesasParceladas',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getTituloConsolidacoesParaAssociacao(
    idDespesa: number,
    idDetalheDespesa: number,
    tpListarTodasDespesas: boolean
  ): Observable<TituloDespesaResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      tipo: tpListarTodasDespesas ? 'default' : 'ativas'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/consolidacao/importacao/consultarConsolidacoes',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getTituloDespesaAlteracao(idDespesa: number, anoReferencia: number): Observable<TituloDespesaResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      anoReferencia: anoReferencia.toString()
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterDespesasMensaisParaAssociacao',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getTituloDespesasRelatorio(idDespesa: number): Observable<TituloDespesaResponse> {
    const params = {
      idDespesa: idDespesa.toString()
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterTitulosDespesasRelatorio',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
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
      idConsolidacao: idConsolidacao.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/detalheDespesas/consolidacao/obterRelatorioDespesasParceladas',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  obterExtratoDetalheDespesaQuitacaoMes(
    idDespesa: number,
    idDetalheDespesa: number
  ): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/detalheDespesas/despesasParceladas/obterRelatorioDespesasParceladasQuitacao',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  excluirDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idOrdem: idOrdem.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais';

    return this.http.delete(url, { params, headers: this.getHeaders() });
  }

  gravarDespesaMensal(request: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;
    return this.http.post(url, request, { headers: this.getHeaders() });
  }

  gravarDetalheDespesa(request: DetalheDespesasMensais[]) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/incluir`;
    return this.http.post(url, request, { headers: this.getHeaders() });
  }

  excluritemDetalheDespesa(request: DetalheDespesasMensais[]) {
    const url = `springboot-esc-backend/api/v2/lancamentosFinanceiros/detalheDespesasMensais/excluir`;
    return this.http.post(url, request, { headers: this.getHeaders() });
  }

  validarDuplicidadeTituloDespesa(idDespesa: number, idDetalheDespesa: number, tituloDespesa: string, anoReferencia: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      tituloDespesa: tituloDespesa,
      anoReferencia: anoReferencia.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/validaTituloDespesaDuplicado';

    return this.http.post<StringResponse>(url, {}, { params, headers: this.getHeaders() }).pipe(
      map(response => response)
    );
  }

  organizarListaItensDetalheDespesa(idDespesa: number, idDetalheDespesa: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      ordem: 'prazo'
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/ordenarListaDespesas';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
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
      iOrdemNova: iNovaOrdem.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDetalheDespesas';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
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
      idConsolidacao: idConsolidacao.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParcelada';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
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
      dsMes: mesReferencia,
      dsAno: anoReferencia,
      bReprocessarTodosValores: repDespNaoParceladas.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/detalheDespesasMensais';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  incluirDespesaParceladaAmortizacao(
    idDespesa: number,
    idDetalheDespesa: number,
    parcelasAmortizada: Parcelas[]
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParceladaAmortizada';

    return this.http.post(url, parcelasAmortizada, { params, headers: this.getHeaders() });
  }

  getExtratoDetalheDespesa(idDespesa: number, idDetalheDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      tipo: 'detalheDespesas'
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterExtratoDespesasMes',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  adiarFluxoParcelas(despesas: DetalheDespesasMensais[]) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/adiarFluxoParcelas`,
      despesas, { headers: this.getHeaders() });
  }

  desfazerAdiamentoFluxoParcelas(despesas: DetalheDespesasMensais[]) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/desfazerAdiamentoFluxoParcelas`,
      despesas, { headers: this.getHeaders() });
  }

  associarDespesasConsolidacao(idConsolidacao: number, despesas: DetalheDespesasMensais[]) {
    const params = {
      idConsolidacao: idConsolidacao.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consolidacao/associar';

    return this.http.post(url, despesas, { params, headers: this.getHeaders() });
  }

  alterarReferenciaDespesaMensal(idDespesa: number, idDetalheDespesa: number, idDetalheDespesaNova: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idDetalheDespesaNova: idDetalheDespesaNova.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/alterarReferenciaDespesa';

    return this.http.post(url, null, { params, headers: this.getHeaders() });
  }

  obterMesAnoPorID(idDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/obterMesAnoPorID',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  gerarDespesaFuturaVisualizacao(mesRef: string, anoRef: string) {
    const params = {
      dsMes: mesRef,
      dsAno: anoRef
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/gerarDespesasFuturas';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }
}
