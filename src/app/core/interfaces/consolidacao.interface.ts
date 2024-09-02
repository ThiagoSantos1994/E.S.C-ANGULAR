import { ConsolidacaoDespesas } from "./consolidacao-despesas.interface";

export interface Consolidacao {
    idConsolidacao: number;
    dsTituloConsolidacao: String;
    tpBaixado: String;
    dataCadastro?: String;
    idFuncionario: number;
    despesasConsolidadas?: ConsolidacaoDespesas[];
}