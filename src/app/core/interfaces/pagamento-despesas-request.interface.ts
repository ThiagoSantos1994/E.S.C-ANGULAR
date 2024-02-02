export interface PagamentoDespesasRequest {
    idDespesa: number;
    idDetalheDespesa: number;
    idDespesaParcelada: number;
    idParcela: number;
    idOrdem: number;
    idFuncionario: number;
    vlTotal: string;
    vlTotalPago: string;
    tpStatus: string;
    dsObservacoes?: string;
    dsObservacoesComplementar?: string;
    isProcessamentoAdiantamentoParcelas: boolean;
}