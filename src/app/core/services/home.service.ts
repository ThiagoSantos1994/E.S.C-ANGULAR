import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
//import { DadosUsuario } from '../interfaces/dados-usuario.interface';
import { HttpErrorHandlerService } from '../utils/http-error-handler.service';
import { MensagemService } from './mensagem.service';
import { TokenService } from './token.service';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(
    private http: HttpClient,
    private token: TokenService,
    private mensagemService: MensagemService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  private readonly subject = new Subject<string>();

  enviaMensagem(tipoMensagem: string): void {
    this.subject.next(tipoMensagem);
  }

  recebeMensagem(): Observable<string> {
    return this.subject.asObservable();
  }

  /*getDadosUsuario(id: string): Observable<DadosUsuario> {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DadosUsuario>('springboot-esc-backend/api/login/obterDados/' + id, { headers: headers })
      .pipe(catchError(this.errorHandler.handleError));
  }*/
}
