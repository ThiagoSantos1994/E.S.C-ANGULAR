import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Autenticacao } from '../interfaces/autenticacao.interface';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { MensagemService } from './mensagem.service';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(
    private http: HttpClient,
    private mensagemService: MensagemService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  /*API AUTENTICAÇÃO LOGIN*/
  autenticar(usuario: string, senha: string) {
    return this.http.post('/springboot-esc-backend/api/login/autenticar/', { usuario, senha })
      .pipe(
        map(response => response as Autenticacao),
        catchError(this.errorHandler.handleError));

  }
}
