import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario.interface';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });
const URI_LOGIN = 'http://localhost:8002/api';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }
  
  getDadosUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(URI_LOGIN + '/login/obterDados/' + id);
  }
}
