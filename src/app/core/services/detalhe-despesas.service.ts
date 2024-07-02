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
import { PagamentoDespesasRequest } from '../interfaces/pagamento-despesas-request.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { ObservacoesDetalheDespesaRequest } from '../interfaces/observacoes-detalhe-despesa-request.interface';

@Injectable({
  providedIn: 'root'
})
export class DetalheDespesasService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService,
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

  processarPagamentoDetalheDespesa(request: PagamentoDespesasRequest) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/baixarPagamentoDespesa`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getChaveKey(tipoChave: string): Observable<ChaveKey> {
    return this.http.get<ChaveKey>(`springboot-esc-backend/api/lancamentosFinanceiros/obterNovaChaveKey/${tipoChave}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getObservacoesDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/consultar/${idDespesa}/${idDetalheDespesa}/${ordemExibicao}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  gravarObservacoesDetalheDespesa(request: ObservacoesDetalheDespesaRequest) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/observacoes/gravar`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getDetalheDespesasMensais(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number): Observable<DetalheLancamentosMensais> {
    return this.http.get<DetalheLancamentosMensais>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consultar/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${ordemExibicao}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getTituloDespesasParceladas(tpListarTodasDespesas: boolean): Observable<TituloDespesaResponse> {
    const carregar = (tpListarTodasDespesas ? "default" : "ativas");
    return this.http.get<TituloDespesaResponse>(`springboot-esc-backend/api/despesasParceladas/importacao/consultarDespesasParceladas/${this.sessao.getIdLogin()}/${carregar}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getTituloDespesasRelatorio(idDespesa: number): Observable<TituloDespesaResponse> {
    return this.http.get<TituloDespesaResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/obterTitulosDespesasRelatorio/${idDespesa}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  obterExtratoDetalheDespesaQuitacaoMes(idDespesa: number, idDetalheDespesa: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/detalheDespesas/despesasParceladas/obterRelatorioDespesasParceladasQuitacao/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  excluirDetalheDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/excluir/${idDespesa}/${idDetalheDespesa}/${idOrdem}/${this.sessao.getIdLogin()}`;
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

  gravarDetalheDespesa(detalheDespesa) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/incluir`;
    return this.http.post(url, detalheDespesa).pipe(
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
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/validaTituloDespesaDuplicado/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${tituloDespesa}`;
    return this.http.post<StringResponse>(url, {}).pipe(map((response) => { return response }),
      catchError(this.handleError));
  }

  organizarListaItensDetalheDespesa(idDespesa: number, idDetalheDespesa: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/ordenarListaDespesas/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/prazo`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  atualizarOrdemLinhaDetalheDespesa(idDespesa: number, idDetalheDespesa: number, iOrdemAtual: number, iNovaOrdem: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDetalheDespesas/${idDespesa}/${idDetalheDespesa}/${iOrdemAtual}/${iNovaOrdem}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  processarImportacaoDespesasParceladas(idDespesa: number, idDetalheDespesa: number, idDespesaParcelada: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParcelada/${idDespesa}/${idDetalheDespesa}/${idDespesaParcelada}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  reprocessarImportacaoDetalheDespesa(idDespesa: number, idDetalheDespesa: number, mesReferencia: string, anoReferencia: string, repDespNaoParceladas: boolean) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/importacao/detalheDespesasMensais/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${mesReferencia}/${anoReferencia}/${repDespNaoParceladas}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  incluirDespesaParceladaAmortizacao(idDespesa: number, idDetalheDespesa: number, parcelasAmortizada: Parcelas[]) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/importacao/despesaParceladaAmortizada/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, parcelasAmortizada).pipe(
      catchError(error => this.handleError(error))
    );
  }

  getExtratoDetalheDespesa(idDespesa: number, idDetalheDespesa: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterExtratoDespesasMes/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/detalheDespesas`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  adiantarFluxoParcelas(idDespesa: number, idDetalheDespesa: number, idDespesaParcelada: number, idParcela: number) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/adiantarFluxoParcelas/${idDespesa}/${idDetalheDespesa}/${idDespesaParcelada}/${idParcela}/${this.sessao.getIdLogin()}`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  desfazerAdiantamentoFluxoParcelas(idDespesa: number, idDetalheDespesa: number, idDespesaParcelada: number, idParcela: number) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/parcelas/desfazerAdiantamentoFluxoParcelas/${idDespesa}/${idDetalheDespesa}/${idDespesaParcelada}/${idParcela}/${this.sessao.getIdLogin()}`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  obterMesAnoPorID(idDespesa: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/obterMesAnoPorID/${idDespesa}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  gerarDespesaFuturaVisualizacao(mesRef: string, anoRef: string) {
    return this.http.post(`springboot-esc-backend/api/lancamentosFinanceiros/gerarDespesasFuturas/${mesRef}/${anoRef}/${this.sessao.getIdLogin()}`, {}).pipe(
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
