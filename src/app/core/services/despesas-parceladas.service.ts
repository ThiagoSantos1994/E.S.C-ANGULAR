import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DespesaParceladaResponse } from '../interfaces/despesa-parcelada-response.interface';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class DespesasParceladasService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private sessao: SessaoService
  ) { }

  private subject = new Subject<any>();

  public enviaMensagem() {
    this.subject.next(null);
  }

  public recebeMensagem(): Observable<any> {
    return this.subject.asObservable();
  }

  getNomeDespesasParceladas(isDespesasEmAberto: boolean): Observable<TituloDespesaResponse> {
    const carregar = (isDespesasEmAberto ? "default" : "fechado");
    return this.http.get<TituloDespesaResponse>(`springboot-esc-backend/api/despesasParceladas/obterListaDespesas/${this.sessao.getIdLogin()}/${carregar}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }


  getDetalhesDespesaParcelada(idDespesaParcelada: number): Observable<DespesaParceladaResponse> {
    return this.http.get<DespesaParceladaResponse>(`springboot-esc-backend/api/v2/despesasParceladas/consultar/${idDespesaParcelada}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
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
