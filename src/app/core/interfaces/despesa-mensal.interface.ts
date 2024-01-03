export interface DespesaMensal {
    idDespesa: number;
    idDetalheDespesa: number;
    dsTituloDespesa: string;
    dsNomeDespesa: string;
    vlLimite: string;
    idOrdemExibicao: number;
    idFuncionario: number;
    idEmprestimo: number;
    tpReprocessar: string;
    tpEmprestimo: string;
    tpPoupanca: string;
    tpAnotacao: string;
    tpDebitoAutomatico: string;
    tpMeta: string;
    tpLinhaSeparacao: string;
    tpDespesaReversa: string;
    tpRelatorio: string;
    tpDebitoCartao: string;
    tpEmprestimoAPagar: string;
    tpReferenciaSaldoMesAnterior: string;
    tpVisualizacaoTemp: string;
    tpDespesaCompartilhada: string;
}