import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Usuario } from "../interfaces/usuario.interface";
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root'})
export class UsuarioService {
    
    private usuarioSubject = new BehaviorSubject<Usuario>(null);

    constructor(private tokenService: TokenService) { 
        this.tokenService.hasToken() && this.decodeAndNotify();
    }
    
    setTokenAutenticador(usuario: Usuario) {
        this.tokenService.setToken(JSON.stringify(usuario));
        this.decodeAndNotify();
    }
    
    logout() {
        this.tokenService.removeToken();
    }

    isLogged() {
        return this.tokenService.hasToken();
    }
    
    getUsuarioToken() {
        return this.usuarioSubject.asObservable();
    }

    private decodeAndNotify() {
        const token = this.tokenService.getToken(); 
        this.usuarioSubject.next(JSON.parse(token));
    }
}