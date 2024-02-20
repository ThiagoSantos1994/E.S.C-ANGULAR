import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DespesaMensal } from "../interfaces/despesa-mensal.interface";
import { DetalheDespesasMensais } from "../interfaces/detalhe-despesas-mensais.interface";

@Injectable({
    providedIn: 'root'
})
export class DetalheDespesasMensaisDomain {

    private _despesaMensal = new BehaviorSubject<DespesaMensal>(null);
    private _detalheDespesasMensais = new BehaviorSubject<DetalheDespesasMensais>(null);

    constructor() { }

    public setDespesaMensal(despesaMensal: DespesaMensal) {
        this._despesaMensal.next(despesaMensal)
    }

    public getDespesaMensal() {
        return this._despesaMensal.getValue();
    }
}

