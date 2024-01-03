import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { LancamentosFinanceiros } from "../interfaces/lancamentos-financeiros.interface";

@Injectable({
    providedIn: 'root'
})
export class LancamentosFinanceirosDomain {

    private _lancamentosFinanceiros = new BehaviorSubject<LancamentosFinanceiros>(null);

    constructor() { }

    public setLancamentos(despesa: LancamentosFinanceiros) {
        this._lancamentosFinanceiros.next(despesa);
    }

    public getLancamentosAsObservable() {
        return this._lancamentosFinanceiros.asObservable();
    }

    public getLancamentos() {
        this._lancamentosFinanceiros.getValue();
    }
}

