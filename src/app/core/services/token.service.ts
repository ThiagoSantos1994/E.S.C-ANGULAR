import { Injectable } from '@angular/core';
import { Usuario } from '../interfaces/usuario';

const KEY = 'tokenID';

@Injectable({ providedIn: 'root'})
export class TokenService {

    hasToken() {
        return !!this.getToken();
    }

    setToken(token: Usuario) {
        window.localStorage.setItem(KEY, token.id_Login.toString());
    }

    getToken() {
        return window.localStorage.getItem(KEY);
    }
    
    removeToken() {
        window.localStorage.removeItem(KEY);
    }
}