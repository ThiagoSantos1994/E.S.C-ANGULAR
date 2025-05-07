import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConsolidacaoDespesas } from '../interfaces/consolidacao-despesas.interface';
import { Consolidacao } from '../interfaces/consolidacao.interface';
import { TituloConsolidacaoResponse } from '../interfaces/titulo-consolidacao-response.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

@Injectable({
  providedIn: 'root'
})
export class ConsolidacaoService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private mensagemService: MensagemService,
    private sessao: SessaoService
  ) { }

  private subject = new Subject<any>();

  public enviaMensagem(despesa) {
    this.subject.next(despesa);
  }

  public recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getTitulosConsolidacao(isBaixado: boolean): Observable<TituloConsolidacaoResponse[]> {
    let carregar = (isBaixado ? true : false);
    return this.http.get<TituloConsolidacaoResponse[]>(`springboot-esc-backend/api/consolidacao/obterTituloConsolidacoes/${this.sessao.getIdLogin()}/${carregar}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getDetalhesConsolidacao(idConsolidacao: number): Observable<Consolidacao> {
    return this.http.get<Consolidacao>(`springboot-esc-backend/api/consolidacao/consultar/${idConsolidacao}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  gravarConsolidacao(request: Consolidacao) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/gravar`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirConsolidacao(request: Consolidacao) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/excluir`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  associarDespesa(request: ConsolidacaoDespesas) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/associar`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  desassociarDespesa(request: ConsolidacaoDespesas[]) {
    return this.http.post(`springboot-esc-backend/api/consolidacao/despesas/desassociar`, request).pipe(
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

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}
