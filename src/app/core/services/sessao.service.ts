import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SessaoService {

    constructor(
        private tokenService: TokenService,
        private router: Router
    ) {
        if (this.tokenService.hasToken()) {
            this.decodeAndNotify();
        }
    }

    setTokenAutenticador(token: string, idLogin: number, usuario: string, isIgnorarSessao: boolean): void {
        this.tokenService.setToken(token, idLogin, usuario, isIgnorarSessao);
        this.decodeAndNotify();
    }

    logout(): void {
        this.tokenService.removeToken();
    }

    async validarSessao(): Promise<void> {
        if (this.tokenService.getValidarSessao() === 'true') {
            try {
                const res = await this.tokenService.validarSessao().pipe(take(1)).toPromise();
                if (res.isSessaoValida === false) {
                    alert('Tempo de sessão expirado, redirecionando para o login.');
                    this.router.navigate(['login']);
                    this.logout();
                }
            } catch (error) {
                console.error('Erro ao validar sessão:', error);
            }
        }
    }

    isLogged(): boolean {
        return this.tokenService.hasToken();
    }

    getToken(): string | null {
        return this.tokenService.getToken();
    }

    getIdLogin(): string | null {
        return this.tokenService.getIdLogin();
    }

    getUserName(): string | null {
        return this.tokenService.getUserNameLogin();
    }

    private decodeAndNotify(): void {
        const token = this.tokenService.getToken();
        // Decode token logic can be added here if needed
    }
}