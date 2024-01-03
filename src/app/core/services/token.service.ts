import { Injectable } from '@angular/core';

const KEY_TOKEN = 'tokenID';
const KEY_ID = 'idLogin';
const KEY_USER = 'userName';

@Injectable({ providedIn: 'root'})
export class TokenService {

    hasToken() {
        return !!this.getToken();
    }

    setToken(token: string, idLogin: number, usuario: string) {
        window.localStorage.setItem(KEY_TOKEN, token);
        window.localStorage.setItem(KEY_ID, idLogin.toString());
        window.localStorage.setItem(KEY_USER, usuario.toString());
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

    removeToken() {
        window.localStorage.removeItem(KEY_TOKEN);
        window.localStorage.removeItem(KEY_ID);
        window.localStorage.getItem(KEY_USER);
    }
}