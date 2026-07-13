import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const KEY_TOKEN = 'accessToken';
const KEY_ID = 'idLogin';
const KEY_USER = 'userName';
const KEY_VALIDAR_SESSAO = 'validarSessao';

@Injectable({ providedIn: 'root' })
export class TokenService {

    constructor(
        private http: HttpClient
    ) { }

    hasToken(): boolean {
        return !!this.getToken();
    }

    setToken(accessToken: string, isIgnorarSessao: boolean): void {
        const rawToken = accessToken.replace(/^Bearer\s+/i, '');
        const payload = this.decodeJwtPayload(rawToken);
        const idLogin = payload && payload.sub ? payload.sub.toString() : '';
        const usuario = payload && payload.username ? payload.username : '';

        window.localStorage.setItem(KEY_TOKEN, rawToken);
        if (idLogin) {
            window.localStorage.setItem(KEY_ID, idLogin);
        }
        if (usuario) {
            window.localStorage.setItem(KEY_USER, usuario);
        }
        window.localStorage.setItem(KEY_VALIDAR_SESSAO, isIgnorarSessao.toString());
    }

    private decodeJwtPayload(token: string): any | null {
        if (!token) {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        try {
            const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = atob(payloadBase64);
            return JSON.parse(decodeURIComponent(
                decoded.split('').map(c => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join('')
            ));
        } catch (error) {
            console.error('Falha ao decodificar JWT:', error);
            return null;
        }
    }

    /*validarSessao(): Observable<BooleanResponse> {
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
    }*/

    getToken(): string | null {
        return window.localStorage.getItem(KEY_TOKEN);
    }

    getPayload(): any | null {
        const token = this.getToken();
        return token ? this.decodeJwtPayload(token) : null;
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