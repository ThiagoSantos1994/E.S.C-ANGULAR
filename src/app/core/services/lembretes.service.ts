import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DetalheLembrete } from '../interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from '../interfaces/titulo-lembretes.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LembretesService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService
  ) { }

  private subject = new Subject<String>();

  public enviaMensagem(tipoMensagem: String) {
    this.subject.next(tipoMensagem);
  }

  public recebeMensagem(): Observable<String> {
    return this.subject.asObservable();
  }

  getDetalheLembrete(idLembrete: number): Observable<DetalheLembrete> {
    return this.http.get<DetalheLembrete>(`springboot-esc-backend/api/lembretes/detalhe/${idLembrete}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getMonitorLembretes(): Observable<TituloLembretes> {
    return this.http.get<TituloLembretes>(`springboot-esc-backend/api/lembretes/monitor/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getTituloLembretes(isLembreteEmAberto: boolean): Observable<TituloLembretes> {
    let carregar = (isLembreteEmAberto ? "true" : "false");
    return this.http.get<TituloLembretes>(`springboot-esc-backend/api/lembretes/obterTituloLembretes/${this.sessao.getIdLogin()}/${isLembreteEmAberto}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  baixarLembreteMonitor(tipoBaixa: String, request: TituloLembretes[]) {
    return this.http.post(`springboot-esc-backend/api/lembretes/monitor/baixar/${tipoBaixa}`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarDetalhesLembrete(request: DetalheLembrete) {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/gravar`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirDetalhesLembrete(request: DetalheLembrete) {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/excluir`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      if (error.error.codigo == 204 || error.error.codigo == 400) {
        alert(error.error.mensagem);
      } else {
        alert('Ops, Ocorreu um erro no servidor, tente novamente mais tarde.');
      }
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}` +
        `mensagem: ${error.error.mensagem}`);
    }

    return throwError(error);
  }

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }

}
