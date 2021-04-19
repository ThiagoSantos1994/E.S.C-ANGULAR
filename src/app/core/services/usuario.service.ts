import { Injectable } from "@angular/core";
import { Usuario } from "../interfaces/usuario";
import { TokenService } from "./token.service";

@Injectable({ providedIn: 'root'})
export class UsuarioService {

    constructor(private tokenService: TokenService) { 
        this.tokenService.hasToken() && this.decodeAndNotify();
    }
    
    setTokenAutenticador(usuario: Usuario) {
        this.tokenService.setToken(usuario);
    }

    logout() {
        this.tokenService.removeToken();
    }

    isLogged() {
        return this.tokenService.hasToken();
    }
   
    private decodeAndNotify() {
        const token = this.tokenService.getToken();
    }
}