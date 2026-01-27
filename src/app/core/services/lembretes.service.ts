import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DetalheLembrete } from '../interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from '../interfaces/titulo-lembretes.interface';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { MensagemService } from './mensagem.service';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LembretesService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private mensagemService: MensagemService,
    private sessao: SessaoService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  private subject = new Subject<String>();

  public enviaMensagem(tipoMensagem: String) {
    this.subject.next(tipoMensagem);
  }

  public recebeMensagem(): Observable<String> {
    return this.subject.asObservable();
  }

  getDetalheLembrete(idLembrete: number): Observable<DetalheLembrete> {
    const params = {
      idLembrete: idLembrete.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<DetalheLembrete>(
      'springboot-esc-backend/api/lembretes/detalhe',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getMonitorLembretes(): Observable<TituloLembretes> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<TituloLembretes>(
      'springboot-esc-backend/api/lembretes/monitor',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  getTituloLembretes(isLembreteEmAberto: boolean): Observable<TituloLembretes> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString(),
      tpBaixado: isLembreteEmAberto.toString()
    };

    return this.http.get<TituloLembretes>(
      'springboot-esc-backend/api/lembretes/obterTituloLembretes',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.errorHandler.handleError)
    );
  }

  baixarLembreteMonitor(tipoBaixa: string, request: TituloLembretes[]) {
    const params = {
      tipoBaixa: tipoBaixa
    };

    const url = 'springboot-esc-backend/api/lembretes/monitor/baixar';

    return this.http.post(url, request, { params }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  gravarDetalhesLembrete(request: DetalheLembrete) {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/gravar`, request).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  excluirDetalhesLembrete(request: DetalheLembrete) {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/excluir`, request).pipe(
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
