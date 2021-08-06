import { Injectable } from '@angular/core';

const KEY_TOKEN = 'tokenID';
const KEY_ID = 'id_Login';

@Injectable({ providedIn: 'root'})
export class TokenService {

    hasToken() {
        return !!this.getToken();
    }

    setToken(token: string, idLogin: number) {
        window.localStorage.setItem(KEY_TOKEN, token);
        window.localStorage.setItem(KEY_ID, idLogin.toString());
    }
    
    getToken() {
        return window.localStorage.getItem(KEY_TOKEN);
    }
    
    getIdLogin() {
        return window.localStorage.getItem(KEY_ID);
    }

    removeToken() {
        window.localStorage.removeItem(KEY_TOKEN);
        window.localStorage.removeItem(KEY_ID);
    }
}