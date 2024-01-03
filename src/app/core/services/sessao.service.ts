import { Injectable } from "@angular/core";
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root' })
export class SessaoService {

    constructor(private tokenService: TokenService) {
        this.tokenService.hasToken() && this.decodeAndNotify();
    }

    setTokenAutenticador(token: string, idLogin: number, usuario: string) {
        this.tokenService.setToken(token, idLogin, usuario);
        this.decodeAndNotify();
    }

    logout() {
        this.tokenService.removeToken();
    }

    isLogged() {
        return this.tokenService.hasToken();
    }

    getToken() {
        return this.tokenService.getToken();
    }

    getIdLogin() {
        return this.tokenService.getIdLogin();
    }

    getUserName() {
        return this.tokenService.getUserNameLogin();
    }
    
    private decodeAndNotify() {
        const token = this.tokenService.getToken();
    }
}