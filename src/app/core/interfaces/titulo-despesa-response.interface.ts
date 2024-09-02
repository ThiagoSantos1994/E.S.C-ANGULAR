export interface TituloDespesaResponse {
    despesas: TituloDespesa[];
}

export interface TituloDespesa {
    idDespesa: number;
    idConsolidacao: number;
    tituloDespesa: String;
}

export interface DespesaSelecionadaImportacao {
    idDespesa: number;
    idConsolidacao: number;
    tituloDespesa: String;
}