import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StringResponse } from '../interfaces/string-response.interface.';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

const KEY_TOKEN = 'tokenID';
const KEY_ID = 'idLogin';
const KEY_USER = 'userName';
const KEY_VALIDAR_SESSAO = 'validarSessao';

@Injectable({ providedIn: 'root' })
export class TokenService {

    constructor(
        private http: HttpClient,
        private mensagemService: MensagemService
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
        const params = {
            idFuncionario: this.getIdLogin().toString()
        };

        return this.http.get<StringResponse>(
            'springboot-esc-backend/api/sessao/validar',
            { params }
        ).pipe(
            map(response => response),
            catchError(this.handleError)
        );
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
        this.fecharSpinner();
        if (error.error instanceof ErrorEvent) {
            console.error('Ocorreu um erro:', error.error.message);
        } else {
            if (error.error.codigo == 204 || error.error.codigo == 400) {
                this.mensagemService.enviarMensagem(error.error.mensagem, TipoMensagem.Alerta);
            } else {
                this.mensagemService.enviarMensagem("Ops!! Ocorreu um erro no servidor. Tente novamente mais tarde.", TipoMensagem.Erro);
            }
            console.error(
                `Backend codigo de erro ${error.status}, ` +
                `request foi: ${error.error}` +
                `mensagem: ${error.error.mensagem}`);
        }

        return throwError(error);
    }

    fecharSpinner() {
        this.mensagemService.enviarMensagem(null, null);
    }
}