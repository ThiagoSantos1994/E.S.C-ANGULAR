import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DespesasFixasMensais } from '../interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from '../interfaces/despesas-mensais.interface';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentosFinanceirosService {

  constructor(
    private http: HttpClient,
    private token: TokenService) { }
  
  getDespesasMensais() {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasMensais>('springboot-esc-backend/api/obterListaDespesasMensais/2/61', { headers: headers })
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  getDespesasFixasMensais() {
    let headers = new HttpHeaders().append('Authorization', this.token.getToken());

    return this.http.get<DespesasFixasMensais>('springboot-esc-backend/api/obterListaDespesasFixasMensais/08/2021/2', { headers: headers })
      .pipe(map((response) => { return response }),
        catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Ocorreu um erro:', error.error.message);
    } else {
      console.error(
        `Backend codigo de erro ${error.status}, ` +
        `request foi: ${error.error}`);
    }
    return throwError(error);
  }
}
