import { formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DetalheLembrete } from '../interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from '../interfaces/titulo-lembretes.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LembretesService {

  constructor(
    private http: HttpClient,
    private token: TokenService
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

  getDetalheLembrete(idLembrete: number): Observable<DetalheLembrete> {
    const params = {
      idLembrete: idLembrete.toString()
    };

    return this.http.get<DetalheLembrete>(
      'springboot-esc-backend/api/lembretes/detalhe',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getMonitorLembretes(): Observable<TituloLembretes> {
    return this.http.get<TituloLembretes>(
      'springboot-esc-backend/api/lembretes/monitor',
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  getTituloLembretes(isLembreteEmAberto: boolean): Observable<TituloLembretes> {
    const params = {
      tpBaixado: isLembreteEmAberto.toString()
    };

    return this.http.get<TituloLembretes>(
      'springboot-esc-backend/api/lembretes/obterTituloLembretes',
      { params, headers: this.getHeaders() }
    ).pipe(
      map(response => response)
    );
  }

  baixarLembreteMonitor(tipoBaixa: string, request: TituloLembretes[]): Observable<any> {
    const params = {
      tipoBaixa: tipoBaixa
    };

    const url = 'springboot-esc-backend/api/lembretes/monitor/baixar';

    return this.http.post(url, request, { params, headers: this.getHeaders() });
  }

  gravarDetalhesLembrete(request: DetalheLembrete): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/gravar`, request, { headers: this.getHeaders() });
  }

  excluirDetalhesLembrete(request: DetalheLembrete): Observable<any> {
    return this.http.post(`springboot-esc-backend/api/lembretes/detalhe/excluir`, request, { headers: this.getHeaders() });
  }

  getMesAtual(): string {
    return formatDate(Date.now(), 'MM', 'en-US');
  }

  getAnoAtual(): string {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }

}
