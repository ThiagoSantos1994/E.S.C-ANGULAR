import { formatDate } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Despesa, DespesaParceladaResponse, Parcelas } from '../interfaces/despesa-parcelada-response.interface';
import { StringResponse } from '../interfaces/string-response.interface.';
import { TituloDespesaResponse } from '../interfaces/titulo-despesa-response.interface';
import { SessaoService } from './sessao.service';
import { TokenService } from './token.service';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

@Injectable({
  providedIn: 'root'
})
export class DespesasParceladasService {

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

  getNomeDespesasParceladas(isDespesasEmAberto: boolean): Observable<TituloDespesaResponse> {
    let carregar = (isDespesasEmAberto ? "default" : "fechado");
    return this.http.get<TituloDespesaResponse>(`springboot-esc-backend/api/despesasParceladas/obterListaDespesas/${this.sessao.getIdLogin()}/${carregar}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getDetalhesDespesaParcelada(idDespesaParcelada: number): Observable<DespesaParceladaResponse> {
    return this.http.get<DespesaParceladaResponse>(`springboot-esc-backend/api/v2/despesasParceladas/consultar/${idDespesaParcelada}/${this.sessao.getIdLogin()}/false`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  gerarFluxoParcelas(idDespesaParcelada: number, valorParcela: String, qtdeParcelas: number, dataReferencia: string): Observable<DespesaParceladaResponse> {
    return this.http.get<DespesaParceladaResponse>(`springboot-esc-backend/api/v2/despesasParceladas/gerarFluxoParcelas/${idDespesaParcelada}/${valorParcela}/${qtdeParcelas}/${dataReferencia}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  gravarDespesa(request: Despesa) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/gravar`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  gravarParcelas(request: Parcelas[]) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/parcelas/gravar`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirDespesa(idDespesaParcelada: number) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/excluir/${idDespesaParcelada}/${this.sessao.getIdLogin()}`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  quitarDespesa(idDespesaParcelada: number, valorQuitacao: string) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/quitar/${idDespesaParcelada}/${this.sessao.getIdLogin()}/${valorQuitacao}`, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirParcela(request: Parcelas[]) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/parcelas/excluir/`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  obterSubTotalDespesasEmAberto(): Observable<StringResponse> {
    return this.http.get<StringResponse>(`springboot-esc-backend/api/despesasParceladas/obterCalculoValorTotalPendente/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getParcelasParaAmortizacao(idDespesaParcelada: number): Observable<Parcelas[]> {
    return this.http.get<Parcelas[]>(`springboot-esc-backend/api/despesasParceladas/obterParcelasParaAmortizacao/${idDespesaParcelada}/${this.sessao.getIdLogin()}`)
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
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
