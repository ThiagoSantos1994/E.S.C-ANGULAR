import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DespesasFixasMensais } from "../interfaces/despesas-fixas-mensais.interface";
import * as jtw_decode from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class DespesasFixas {

    private _despesasFixas = new BehaviorSubject<DespesasFixasMensais>(null);

    constructor() { }

    public setDespesas(despesa: DespesasFixasMensais) {
        this._despesasFixas.next(despesa);
    }

    public getDespesasAsObservable() {
        return this._despesasFixas.asObservable();
    }

    public getDespesa() {
        this._despesasFixas.getValue();
    }
}

