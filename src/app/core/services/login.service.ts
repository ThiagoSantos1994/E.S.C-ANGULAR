import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Autenticacao } from '../interfaces/autenticacao.interface';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(
    private http: HttpClient
  ) { }

  /*API AUTENTICAÇÃO LOGIN*/
  autenticar(usuario: string, senha: string) {
    return this.http.post('/springboot-esc-backend/api/login/autenticar/', { usuario, senha })
      .pipe(
        map(response => response as Autenticacao)
      );
  }
}
