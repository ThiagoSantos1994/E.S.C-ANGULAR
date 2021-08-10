export interface DespesasMensais{
    id_Despesa: number,
    id_OrdemExibicao: number;
    id_DetalheDespesa: number;
    id_Emprestimo: number;
    ds_NomeDespesa: string;
    vl_Limite: string;
    vl_Total: string;
    vl_TotalPendente: string;
    vl_TotalPago: string;
    percentual: String;
    tp_Emprestimo: string;
    tp_Poupanca: string;
    tp_Anotacao: string;
    tp_DebitoAutomatico: string;
    tp_LinhaSeparacao: string;
    tp_DespesaReversa: string;
    tp_PoupancaNegativa: string;
    tp_Relatorio: string;
}