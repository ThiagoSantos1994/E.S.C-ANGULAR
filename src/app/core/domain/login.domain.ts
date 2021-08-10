import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
//import { Usuario } from "../interfaces/usuario.interface";

@Injectable({
    providedIn: 'root'
})
export class LoginDomain {
    /*private _dadosLogin = new BehaviorSubject<Usuario>(null);
    
    constructor() {}

    public set(dados: Usuario) {
        this._dadosLogin.next(dados);
    }

    public get() {
        return this._dadosLogin.getValue();
    }

    public getObservable() {
        return this._dadosLogin.asObservable();
    }*/
}