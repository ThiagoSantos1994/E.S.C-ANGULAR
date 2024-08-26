import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StringResponse } from '../interfaces/string-response.interface.';

const KEY_TOKEN = 'tokenID';
const KEY_ID = 'idLogin';
const KEY_USER = 'userName';
const KEY_VALIDAR_SESSAO = 'validarSessao';

@Injectable({ providedIn: 'root' })
export class TokenService {

    constructor(
        private http: HttpClient
    ) { }

    hasToken() {
        return !!this.getToken();
    }

    setToken(token: string, idLogin: number, usuario: string, isIgnorarSessao: boolean) {
        window.localStorage.setItem(KEY_TOKEN, token);
        window.localStorage.setItem(KEY_ID, idLogin.toString());
        window.localStorage.setItem(KEY_USER, usuario.toString());
        window.localStorage.setItem(KEY_VALIDAR_SESSAO, isIgnorarSessao.toString());
    }

    validarSessao(): Observable<StringResponse> {
        return this.http.get<StringResponse>(`springboot-esc-backend/api/sessao/validar/${this.getIdLogin()}`)
            .pipe(map((response) => { return response }),
                catchError(this.handleError));
    }

    getToken() {
        return window.localStorage.getItem(KEY_TOKEN);
    }

    getIdLogin() {
        return window.localStorage.getItem(KEY_ID);
    }

    getUserNameLogin() {
        return window.localStorage.getItem(KEY_USER);
    }

    getValidarSessao() {
        return window.localStorage.getItem(KEY_VALIDAR_SESSAO);
    }

    removeToken() {
        window.localStorage.removeItem(KEY_TOKEN);
        window.localStorage.removeItem(KEY_ID);
        window.localStorage.getItem(KEY_USER);
        window.localStorage.getItem(KEY_VALIDAR_SESSAO);
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Ocorreu um erro:', error.error.message);
        } else {
            console.error(
                `Backend codigo de erro ${error.status}, ` +
                `request foi: ${error.error}`);
        }

        alert('Ops, Ocorreu um erro no servidor, tente novamente mais tarde.')
        return throwError(error);
    }
}