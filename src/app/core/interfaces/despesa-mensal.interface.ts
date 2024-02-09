export interface DespesaMensal {
    idDespesa: number;
    idDetalheDespesa: number;
    dsTituloDespesa?: string;
    dsNomeDespesa?: string;
    dsExtratoDespesa? : string;
    vlLimite?: string;
    vlLimiteExibicao?: string;
    vlTotalDespesa?: string;
    idOrdemExibicao?: number;
    idFuncionario: number;
    idEmprestimo?: number;
    tpReprocessar?: string;
    tpEmprestimo?: string;
    tpPoupanca?: string;
    tpPoupancaNegativa?: string;
    tpAnotacao?: string;
    tpDebitoAutomatico?: string;
    tpMeta?: string;
    tpLinhaSeparacao?: string;
    tpDespesaReversa?: string;
    tpRelatorio?: string;
    tpDebitoCartao?: string;
    tpEmprestimoAPagar?: string;
    tpReferenciaSaldoMesAnterior?: string;
    tpVisualizacaoTemp?: string;
    tpDespesaCompartilhada?: string;
    isNovaDespesa?: boolean
}