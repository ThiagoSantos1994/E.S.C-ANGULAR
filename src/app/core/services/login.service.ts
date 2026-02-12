import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Autenticacao } from '../interfaces/autenticacao.interface';
import { HttpErrorHandlerService } from '../utils/http-error-handler.service';
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
  autenticar(usuario: string, senha: string): Observable<Autenticacao> {
    return this.http.post<Autenticacao>('/springboot-esc-backend/api/login/autenticar/', { usuario, senha })
      .pipe(
        map(response => response),
        catchError(this.errorHandler.handleError)
      );
  }
}
