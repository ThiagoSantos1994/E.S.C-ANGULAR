import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

const URI_LOGIN = 'http://localhost:8002/api/login/autenticar';

@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  
  /*API AUTENTICAÇÃO LOGIN*/
  authenticate(userName: string, password: string) {
    var params = JSON.stringify({'usuario': userName, 'senha': password});
    
    return this.http.post(URI_LOGIN, params, {headers : new HttpHeaders({ 'Content-Type': 'application/json' })});
  }
}
