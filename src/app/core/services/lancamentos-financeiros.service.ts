import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LancamentosFinanceirosDomain } from '../domain/lancamentos-financeiros.domain';
import { CategoriaDespesasResponse } from '../interfaces/categoria-despesa-response.interface';
import { ConfiguracaoLancamentos } from '../interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from '../interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from '../interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from '../interfaces/lancamentos-mensais.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private lancamentosFinanceirosDomain: LancamentosFinanceirosDomain
  ) { }

  private readonly subject = new Subject<string>();

  enviaMensagem(tipoMensagem: string): void {
    this.subject.next(tipoMensagem);
  }

  recebeMensagem(): Observable<string> {
    return this.subject.asObservable();
  }

  getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getLancamentosFinanceiros(mes: string, ano: string): Observable<LancamentosFinanceiros> {
    const params = {
      dsMes: mes,
      dsAno: ano
    };

    return this.http.get<LancamentosFinanceiros>(
      'springboot-esc-backend/api/lancamentosFinanceiros/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      tap(res => {
        this.lancamentosFinanceirosDomain.setLancamentos(res);
      })
    );
  }

  getLancamentosMensaisConsolidados(idDespesa: string, idConsolidacao: string): Observable<LancamentosMensais[]> {
    const params = new HttpParams()
      .set('idDespesa', idDespesa)
      .set('idConsolidacao', idConsolidacao);

    return this.http.get<LancamentosMensais[]>(
      'springboot-esc-backend/api/lancamentosMensais/consolidados/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getConfiguracaoLancamentos(): Observable<ConfiguracaoLancamentos> {
    return this.http.get<ConfiguracaoLancamentos>(
      'springboot-esc-backend/api/parametros/obterConfiguracaoLancamentos/usuario',
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getSubTotalCategoriaDespesas(idDespesa: number): Observable<CategoriaDespesasResponse> {
    const params = {
      idDespesa: idDespesa.toString()
    };

    return this.http.get<CategoriaDespesasResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/categoriaDespesa/subTotal',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getSubTotalAnoCategoriaDespesas(anoRef: number): Observable<CategoriaDespesasResponse> {
    const params = {
      dsAno: anoRef.toString()
    };

    return this.http.get<CategoriaDespesasResponse>(
      'springboot-esc-backend/api/lancamentosFinanceiros/categoriaDespesa/subTotal/anual',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
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
      iOrdemNova: iNovaOrdem.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesasFixas';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  atualizarOrdemLinhaDespesa(
    idDespesa: number,
    iOrdemAtual: number,
    iNovaOrdem: number
  ) {
    const params = {
      idDespesa: idDespesa.toString(),
      iOrdemAtual: iOrdemAtual.toString(),
      iOrdemNova: iNovaOrdem.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarOrdemRegistroDespesas';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  gravarParametrizacao(parametros: ConfiguracaoLancamentos) {
    const url = `springboot-esc-backend/api/parametros/gravar`;
    return this.http.post(url, parametros, { headers: this.getHeaders() });
  }

  gravarReceita(receita: DespesasFixasMensais) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais/gravar`;
    return this.http.post(url, receita, { headers: this.getHeaders() });
  }

  excluirReceita(idDespesa: number, iOrdemReceita: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idOrdem: iOrdemReceita.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasFixasMensais';

    return this.http.delete(url, { params, headers: this.getHeaders() });
  }

  excluirDespesa(idDespesa: number, idDetalheDespesa: number, idOrdem: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idOrdem: idOrdem.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais';

    return this.http.delete(url, { params, headers: this.getHeaders() });
  }

  desassociarDespesasConsolidacao(idDespesa: number, idDetalheDespesa: number, idConsolidacao: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      idDetalheDespesa: idDetalheDespesa.toString(),
      idConsolidacao: idConsolidacao.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/consolidacao/desassociar';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  processarImportacaoLancamentos(idDespesa: number, dsMes: number, dsAno: number) {
    const params = {
      idDespesa: idDespesa.toString(),
      dsMes: dsMes.toString(),
      dsAno: dsAno.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/importacao/processamento';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  excluirTodosLancamentos(idDespesa: number) {
    const params = {
      idDespesa: idDespesa.toString()
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros';

    return this.http.delete(url, { params, headers: this.getHeaders() });
  }

  processarPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/baixarPagamentoDespesa';

    return this.http.post(url, despesas, { headers: this.getHeaders() });
  }

  desfazerPagamentoDespesa(despesas: LancamentosMensais[]) {
    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/desfazerPagamentoDespesa';

    return this.http.post(url, despesas, { headers: this.getHeaders() });
  }

  executarBackup(): Observable<StringResponse> {
    const url = `springboot-esc-backend/api/backup/processar`;

    return this.http.post<StringResponse>(url, {}, { headers: this.getHeaders() }).pipe(
      map((response) => { return response })
    );
  }

  gravarDespesaMensal(despesa: DespesaMensal) {
    const url = `springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/incluir`;

    return this.http.post(url, despesa, { headers: this.getHeaders() });
  }

  consolidarDespesasMensais(idConsolidacao: number, despesas: LancamentosMensais[]) {
    const params = new HttpParams().set('idConsolidacao', idConsolidacao.toString());

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/despesasMensais/consolidacao/associar';

    return this.http.post(url, despesas, { params, headers: this.getHeaders() });
  }

  editarTituloDespesa(idDetalheDespesa: number, tituloDespesa: string, anoReferencia: string) {
    const params = {
      idDetalheDespesa: idDetalheDespesa.toString(),
      novoTituloDespesa: tituloDespesa,
      anoReferencia: anoReferencia
    };

    const url = 'springboot-esc-backend/api/lancamentosFinanceiros/alterarTituloDespesa';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  obterExtratoDespesaQuitacaoMes(idDespesa: number): Observable<StringResponse> {
    const params = {
      idDespesa: idDespesa.toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterRelatorioDespesasParceladasQuitacao',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  limparDadosTemporarios() {
    const url = 'springboot-esc-backend/api/login/limparDadosTemporarios';

    return this.http.delete(url, { headers: this.getHeaders() });
  }
}
