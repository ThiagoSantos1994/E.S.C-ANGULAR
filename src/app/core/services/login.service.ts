import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Autenticacao } from '../interfaces/autenticacao.interface';
import { throwError } from 'rxjs';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';
import { MensagemService } from './mensagem.service';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(
    private http: HttpClient,
    private mensagemService: MensagemService
  ) { }

  /*API AUTENTICAÇÃO LOGIN*/
  autenticar(usuario: string, senha: string) {
    return this.http.post('/springboot-esc-backend/api/login/autenticar/', { usuario, senha })
      .pipe(
        map(response => response as Autenticacao),
        catchError(this.handleError));

  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      if (error.error.codigo == 204 || error.error.codigo == 400) {
        alert(error.error.mensagem);
        //this.mensagemService.enviarMensagem(error.error.mensagem, TipoMensagem.Alerta);
      } else {
        alert("Ops!! Ocorreu um erro no servidor. Tente novamente mais tarde.");
        //this.mensagemService.enviarMensagem("Ops!! Ocorreu um erro no servidor. Tente novamente mais tarde.", TipoMensagem.Erro);
      }
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}` +
        `mensagem: ${error.error.mensagem}`);
    }

    return throwError(error);
  }
}
