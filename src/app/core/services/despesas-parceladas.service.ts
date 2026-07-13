import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Despesa, DespesaParceladaResponse, Parcelas } from '../interfaces/despesa-parcelada-response.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DespesasParceladasService {

  constructor(
    private http: HttpClient,
    private token: TokenService
  ) { }

  private readonly subject = new Subject<any>();

  enviaMensagem(despesa: any): void {
    this.subject.next(despesa);
  }

  recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getHeaders(): HttpHeaders {
    const token = this.token.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getNomeDespesasParceladas(isDespesasEmAberto: boolean): Observable<TituloDespesaResponse> {
    const params = {
      status: isDespesasEmAberto ? 'default' : 'fechado'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterListaDespesas',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getDetalhesDespesaParcelada(idDespesaParcelada: number): Observable<DespesaParceladaResponse> {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      isPendentes: 'false'
    };

    return this.http.get<DespesaParceladaResponse>(
      'springboot-esc-backend/api/v2/despesasParceladas/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  gerarFluxoParcelas(
    idDespesaParcelada: number,
    valorParcela: string,
    qtdeParcelas: number,
    dataReferencia: string
  ): Observable<DespesaParceladaResponse> {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      valorParcela: valorParcela,
      qtdeParcelas: qtdeParcelas.toString(),
      dataReferencia: dataReferencia
    };

    return this.http.get<DespesaParceladaResponse>(
      'springboot-esc-backend/api/v2/despesasParceladas/gerarFluxoParcelas',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  gravarDespesa(request: Despesa) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/gravar`, request, { headers: this.getHeaders() });
  }

  gravarParcelas(request: Parcelas[]) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/parcelas/gravar`, request, { headers: this.getHeaders() });
  }

  excluirDespesa(idDespesaParcelada: number) {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString()
    };

    const url = 'springboot-esc-backend/api/despesasParceladas/excluir';

    return this.http.delete(url, { params, headers: this.getHeaders() });
  }

  quitarDespesa(idDespesaParcelada: number, valorQuitacao: string) {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      valorQuitacao: valorQuitacao
    };

    const url = 'springboot-esc-backend/api/despesasParceladas/quitar';

    return this.http.post(url, {}, { params, headers: this.getHeaders() });
  }

  excluirParcela(request: Parcelas[]) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/parcelas/excluir/`, request, { headers: this.getHeaders() });
  }

  obterSubTotalDespesasEmAberto(): Observable<StringResponse> {
    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterCalculoValorTotalPendente',
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getParcelasParaAmortizacao(idDespesaParcelada: number): Observable<Parcelas[]> {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString()
    };

    return this.http.get<Parcelas[]>(
      'springboot-esc-backend/api/despesasParceladas/obterParcelasParaAmortizacao',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}
