export interface LancamentosMensais{
    idDespesa: number;
    idDetalheDespesa: number;
    idOrdemExibicao: number;
    idEmprestimo: number;
    dsTituloDespesa: string;
    dsNomeDespesa: string;
    vlLimite: string;
    vlTotalDespesa: number;
    vlTotalDespesaPendente: number;
    vlTotalDespesaPaga: number;
    percentualUtilizacao: string;
    tpEmprestimo: string;
    tpPoupanca: string;
    tpAnotacao: string;
    tpDebitoAutomatico: string;
    tpLinhaSeparacao: string;
    tpDespesaReversa: string;
    tpPoupancaNegativa: string;
    tpDebitoCartao: string;
    tpRelatorio: string;
    tpReferenciaSaldoMesAnterior: string;
    tpDespesaCompartilhada: string;
    checked?: boolean;
}