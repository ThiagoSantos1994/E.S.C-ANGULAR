import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { DadosUsuario } from '../interfaces/dados-usuario.interface';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from '../interfaces/despesas-mensais.interface';

const httpHeader = new HttpHeaders({ 'Content-Type': 'application/json' });

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient) { }
  
  getDadosUsuario(id: string): Observable<DadosUsuario> {
    return this.http.get<DadosUsuario>('springboot-esc-backend/api/login/obterDados/' + id)
        .pipe(catchError(this.handleError));
  }
  
  getDespesasMensais() {
    return this.http.get<DespesasMensais>('springboot-esc-backend/api/obterListaDespesasMensais/2/61')
        .pipe(map((response) => {return response}), 
         catchError(this.handleError));
  }
  
  getDespesasFixasMensais() {
    return this.http.get<DespesasFixasMensais>('springboot-esc-backend/api/obterListaDespesasFixasMensais/8/2021/2')
        .pipe(map((response) => {return response}), 
        catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent){
        console.error('Ocorreu um erro:', error.error.message);
      } else {
        console.error(
            `Backend codigo de erro ${error.status}, ` +
            `request foi: ${error.error}`);
      }
      return throwError(error);
  }
}
