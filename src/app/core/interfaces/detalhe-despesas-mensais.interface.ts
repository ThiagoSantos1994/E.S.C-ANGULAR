export interface DetalheDespesasMensais {
    idDespesa: number;
    idDetalheDespesa: number;
    dsTituloDespesa: string;
    dsDescricao: string;
    idOrdem: number;
    idParcela: number;
    idDespesaParcelada: number;
    idFuncionario: number;
    idDespesaLinkRelatorio: number;
    vlTotal: string;
    vlTotalPago: string;
    dsObservacao: string;
    dsObservacao2: string;
    tpMeta: string;
    tpCategoriaDespesa: string;
    tpStatus: string;
    tpReprocessar: string;
    tpAnotacao: string;
    tpRelatorio: string;
    tpLinhaSeparacao: string;
    tpParcelaAdiada: string;
    tpParcelaAmortizada: string;
}