import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
//import { DadosUsuario } from '../interfaces/dados-usuario.interface';
import { TokenService } from './token.service';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private mensagemService: MensagemService
  ) { }

  private subject = new Subject<String>();

  public enviaMensagem(tipoMensagem: String) {
    this.subject.next(tipoMensagem);
  }

  public recebeMensagem(): Observable<String> {
    return this.subject.asObservable();
  }

  /*getDadosUsuario(id: string): Observable<DadosUsuario> {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DadosUsuario>('springboot-esc-backend/api/login/obterDados/' + id, { headers: headers })
      .pipe(catchError(this.handleError));
  }*/

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
}
