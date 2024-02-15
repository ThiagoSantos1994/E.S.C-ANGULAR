import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { ChaveKey } from '../interfaces/chave-key.interface';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { DetalheLancamentosMensais } from '../interfaces/lancamentos-mensais-detalhe.interface';
import { PagamentoDespesasRequest } from '../interfaces/pagamento-despesas-request.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
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
    private lancamentosFinanceirosDomain: LancamentosFinanceirosDomain
  ) { }

  getLancamentosFinanceiros(mes: String, ano: String): Observable<LancamentosFinanceiros> {
    //let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<LancamentosFinanceiros>(`springboot-esc-backend/api/lancamentosFinanceiros/consultar/${mes}/${ano}/${this.sessao.getIdLogin()}`/*, { headers: headers }*/)
      .pipe(tap(res => {
        this.lancamentosFinanceirosDomain.setLancamentos(res);
      }), catchError(this.handleError));
  }

  getDetalheDespesasMensais(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number): Observable<DetalheLancamentosMensais> {
    return this.http.get<DetalheLancamentosMensais>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/consultar/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/${ordemExibicao}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
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

  processarPagamentoDetalheDespesa(request: PagamentoDespesasRequest) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/baixarPagamentoDespesa`;
    return this.http.post(url, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDetalheDespesa(detalheDespesa) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/incluir`;
    return this.http.post(url, detalheDespesa).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluritemDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemDespesa: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/excluir/${idDespesa}/${idDetalheDespesa}/${ordemDespesa}/${this.sessao.getIdLogin()}`;
    return this.http.post(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  organizarListaItensDetalheDespesa(idDespesa: number, idDetalheDespesa: number) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/ordenarListaDespesas/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/'prazo'`;
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

  getExtratoDetalheDespesa(idDespesa: number, idDetalheDespesa: number): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/lancamentosFinanceiros/detalheDespesasMensais/obterExtratoDespesasMes/${idDespesa}/${idDetalheDespesa}/${this.sessao.getIdLogin()}/detalheDespesas`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getChaveKey(tipoChave: string): Observable<ChaveKey> {
    return this.http.get<ChaveKey>(`springboot-esc-backend/api/lancamentosFinanceiros/obterNovaChaveKey/${tipoChave}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getTituloDespesasParceladas(tpListarTodasDespesas: boolean): Observable<TituloDespesaResponse> {
    const carregar = (tpListarTodasDespesas ? "default" : "ativas");
    return this.http.get<TituloDespesaResponse>(`springboot-esc-backend/api/despesasParceladas/importacao/consultarDespesasParceladas/${this.sessao.getIdLogin()}/${carregar}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
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
