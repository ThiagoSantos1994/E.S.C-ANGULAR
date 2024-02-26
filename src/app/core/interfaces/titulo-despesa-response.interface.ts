export interface TituloDespesaResponse {
    despesas: TituloDespesa[];
}

export interface TituloDespesa {
    idDespesaParcelada: number;
    tituloDespesa: String;
    dsTituloDespesaParcelada: String;
}
