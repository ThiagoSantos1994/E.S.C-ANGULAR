import { Injectable } from "@angular/core";
import { Router } from '@angular/router';
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root' })
export class SessaoService {

    constructor(
        private tokenService: TokenService,
        private sessaoService: SessaoService,
        private router: Router
    ) {
        this.tokenService.hasToken() && this.decodeAndNotify()
    }

    setTokenAutenticador(token: string, idLogin: number, usuario: string) {
        this.tokenService.setToken(token, idLogin, usuario);
        this.decodeAndNotify();
    }

    logout() {
        this.tokenService.removeToken();
    }

    validarSessao() {
        this.tokenService.validarSessao().toPromise().then((res) => {
            if (res.isSessaoValida.valueOf() == false) {
                alert('Tempo de sessão expirado, redirecionando para o login.');
                this.router.navigate(['login']);
                this.logout();
            }
        });
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