import { SubtotalDespesasMensais } from "./subtotal-despesas-mensais.interface";

export interface DespesasFixasMensais{
    id_Despesa: number,
    id_Ordem: number,
    ds_Descricao: string;
    vl_Total: string,
    tp_Status: string
    subTotalDespesasMensais: SubtotalDespesasMensais;
}