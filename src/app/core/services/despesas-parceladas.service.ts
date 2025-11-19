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
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString(),
      status: isDespesasEmAberto ? 'default' : 'fechado'
    };

    return this.http.get<TituloDespesaResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterListaDespesas',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getDetalhesDespesaParcelada(idDespesaParcelada: number): Observable<DespesaParceladaResponse> {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      isPendentes: 'false'
    };

    return this.http.get<DespesaParceladaResponse>(
      'springboot-esc-backend/api/v2/despesasParceladas/consultar',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
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
      dataReferencia: dataReferencia,
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<DespesaParceladaResponse>(
      'springboot-esc-backend/api/v2/despesasParceladas/gerarFluxoParcelas',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
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
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    const url = 'springboot-esc-backend/api/despesasParceladas/excluir';

    return this.http.delete(url, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  quitarDespesa(idDespesaParcelada: number, valorQuitacao: string) {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      idFuncionario: this.sessao.getIdLogin().toString(),
      valorQuitacao: valorQuitacao
    };

    const url = 'springboot-esc-backend/api/despesasParceladas/quitar';

    return this.http.post(url, {}, { params }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  excluirParcela(request: Parcelas[]) {
    return this.http.post(`springboot-esc-backend/api/despesasParceladas/parcelas/excluir/`, request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  obterSubTotalDespesasEmAberto(): Observable<StringResponse> {
    const params = {
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<StringResponse>(
      'springboot-esc-backend/api/despesasParceladas/obterCalculoValorTotalPendente',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
    );
  }

  getParcelasParaAmortizacao(idDespesaParcelada: number): Observable<Parcelas[]> {
    const params = {
      idDespesaParcelada: idDespesaParcelada.toString(),
      idFuncionario: this.sessao.getIdLogin().toString()
    };

    return this.http.get<Parcelas[]>(
      'springboot-esc-backend/api/despesasParceladas/obterParcelasParaAmortizacao',
      { params }
    ).pipe(
      map(response => response),
      catchError(this.handleError)
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
