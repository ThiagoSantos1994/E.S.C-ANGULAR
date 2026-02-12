import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConsolidacaoDespesas } from '../interfaces/consolidacao-despesas.interface';
import { Consolidacao } from '../interfaces/consolidacao.interface';
import { TituloConsolidacaoResponse } from '../interfaces/titulo-consolidacao-response.interface';
import { HttpErrorHandlerService } from '../utils/http-error-handler.service';
import { MensagemService } from './mensagem.service';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class ConsolidacaoService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private mensagemService: MensagemService,
    private sessao: SessaoService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  private readonly subject = new Subject<any>();

  enviaMensagem(despesa: any): void {
    this.subject.next(despesa);
  }

  recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getTitulosConsolidacao(isBaixado: boolean): Observable<TituloConsolidacaoResponse[]> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString(),
      tpBaixado: isBaixado.toString()
    };

    return this.http.get<TituloConsolidacaoResponse[]>(
      'springboot-esc-backend/api/consolidacao/obterTituloConsolidacoes',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getDetalhesConsolidacao(idConsolidacao: number): Observable<Consolidacao> {
    const params = {
      idConsolidacao: idConsolidacao.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<Consolidacao>(
      'springboot-esc-backend/api/consolidacao/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  gravarConsolidacao(request: Consolidacao): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/gravar`, request).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  excluirConsolidacao(request: Consolidacao): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/excluir`, request).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  associarDespesa(request: ConsolidacaoDespesas): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/associar`, request).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  desassociarDespesa(request: ConsolidacaoDespesas[]) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/desassociar`, request).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}
