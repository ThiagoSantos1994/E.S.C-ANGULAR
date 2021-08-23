export interface DetalheDespesasMensais {
    id_Despesa: number;
    id_Ordem: number;
    id_DetalheDespesa: number;
    id_DespesaParcelada: number;
    id_DespesaLinkRelatorio: number;
    id_Parcela: number;
    id_Funcionario: number;
    vl_Total: string;
    ds_Descricao: string;
    vl_TotalPago: string;
    tp_Status: string;
    ds_Observacao: string;
    ds_Observacao2: string;
    tp_Reprocessar: string;
    tp_Anotacao: string;
    tp_Meta: string;
    tp_ParcelaAdiada: string;
    tp_ParcelaAmortizada: string;
    tp_Relatorio: string;
    tp_LinhaSeparacao: string;
}