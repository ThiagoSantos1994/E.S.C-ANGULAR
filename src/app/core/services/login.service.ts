import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import { Usuario } from '../interfaces/usuario.interface';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });
const URI_LOGIN = 'http://localhost:8002/api';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
      private http: HttpClient
  ) { }
  
  /*API AUTENTICAÇÃO LOGIN*/
  autenticar(usuario: string, senha: string) {
    return this.http.post(URI_LOGIN + '/login/autenticar/', {usuario, senha})
    .pipe(
        map(response => response as Usuario)
    );
  }
  
  /*autenticar(usuario: string, senha: string) {
    return this.http.post<Usuario>(URI_LOGIN + '/login/autenticar/', {usuario, senha})
    .pipe(tap(res => {
        this.usuarioService.setTokenAutenticador(res);
        console.log(res.ds_NomeLogin);
    }));
  }*/
}
