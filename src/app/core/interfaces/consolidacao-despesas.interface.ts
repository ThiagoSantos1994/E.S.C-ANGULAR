export interface ConsolidacaoDespesas {
    idConsolidacao: number;
    idDespesaParcelada: number;
    dsNomeDespesa: string;
    valorDespesa: string;
    nrParcelasAdiantadas: number;
    statusDespesa: string;
    idFuncionario: number;
    dataAssociacao: String;
    changeValues?: boolean;
    checked?: boolean;
}