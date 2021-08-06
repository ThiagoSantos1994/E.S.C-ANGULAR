import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DadosLogin } from "../interfaces/dados-login.interface";
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root'})
export class SessaoService {
    
    private dadosSubject = new BehaviorSubject<DadosLogin>(null);

    constructor(private tokenService: TokenService) { 
        this.tokenService.hasToken() && this.decodeAndNotify();
    }
    
    setTokenAutenticador(token: string, idLogin: number) {
        this.tokenService.setToken(token, idLogin);
        this.decodeAndNotify();
    }
    
    logout() {
        this.tokenService.removeToken();
    }

    isLogged() {
        return this.tokenService.hasToken();
    }
    
    getToken() {
        //return this.dadosSubject.asObservable();
        return this.tokenService.getToken();
    }

    getIdLogin() {
        return this.tokenService.getIdLogin();
    }

    private decodeAndNotify() {
        const token = this.tokenService.getToken(); 
        //this.dadosSubject.next(JSON.parse(token));
    }
}