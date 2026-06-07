import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StringResponse } from '../interfaces/string-response.interface.';
import { HttpErrorHandlerService } from '../utils/http-error-handler.service';
import { BooleanResponse } from '../interfaces/boolean-response.interface';

const KEY_TOKEN = 'tokenID';
const KEY_ID = 'idLogin';
const KEY_USER = 'userName';
const KEY_VALIDAR_SESSAO = 'validarSessao';

@Injectable({ providedIn: 'root' })
export class TokenService {

    constructor(
        private http: HttpClient,
        private errorHandler: HttpErrorHandlerService
    ) { }

    hasToken(): boolean {
        return !!this.getToken();
    }

    setToken(token: string, idLogin: number, usuario: string, isIgnorarSessao: boolean): void {
        window.localStorage.setItem(KEY_TOKEN, token);
        window.localStorage.setItem(KEY_ID, idLogin.toString());
        window.localStorage.setItem(KEY_USER, usuario);
        window.localStorage.setItem(KEY_VALIDAR_SESSAO, isIgnorarSessao.toString());
    }

    validarSessao(): Observable<BooleanResponse> {
        const params = {
            idFuncionario: this.getIdLogin().toString()
        };

        return this.http.get<BooleanResponse>(
            'springboot-esc-backend/api/sessao/validar',
            { params }
        ).pipe(
            map(response => response),
            catchError(this.errorHandler.handleError)
        );
    }

    getToken(): string | null {
        return window.localStorage.getItem(KEY_TOKEN);
    }

    getIdLogin(): string | null {
        return window.localStorage.getItem(KEY_ID);
    }

    getUserNameLogin(): string | null {
        return window.localStorage.getItem(KEY_USER);
    }

    getValidarSessao(): string | null {
        return window.localStorage.getItem(KEY_VALIDAR_SESSAO);
    }

    removeToken(): void {
        window.localStorage.removeItem(KEY_TOKEN);
        window.localStorage.removeItem(KEY_ID);
        window.localStorage.removeItem(KEY_USER);
        window.localStorage.removeItem(KEY_VALIDAR_SESSAO);
    }
}