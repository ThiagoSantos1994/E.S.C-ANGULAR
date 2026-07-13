import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConsolidacaoDespesas } from '../interfaces/consolidacao-despesas.interface';
import { Consolidacao } from '../interfaces/consolidacao.interface';
import { TituloConsolidacaoResponse } from '../interfaces/titulo-consolidacao-response.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ConsolidacaoService {

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

  getTitulosConsolidacao(isBaixado: boolean): Observable<TituloConsolidacaoResponse[]> {
    const params = {
      tpBaixado: isBaixado.toString()
    };

    return this.http.get<TituloConsolidacaoResponse[]>(
      'springboot-esc-backend/api/consolidacao/obterTituloConsolidacoes',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getDetalhesConsolidacao(idConsolidacao: number): Observable<Consolidacao> {
    const params = {
      idConsolidacao: idConsolidacao.toString()
    };

    return this.http.get<Consolidacao>(
      'springboot-esc-backend/api/consolidacao/consultar',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  gravarConsolidacao(request: Consolidacao): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/gravar`, request, { headers: this.getHeaders() });
  }

  excluirConsolidacao(request: Consolidacao): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/excluir`, request, { headers: this.getHeaders() });
  }

  associarDespesa(request: ConsolidacaoDespesas): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/associar`, request, { headers: this.getHeaders() });
  }

  desassociarDespesa(request: ConsolidacaoDespesas[]) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/desassociar`, request, { headers: this.getHeaders() });
  }

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}
