import { DespesaMensal } from "./despesa-mensal.interface";
import { DetalheDespesasMensais } from "./detalhe-despesas-mensais.interface";

export interface DetalheLancamentosMensais{
    despesaMensal: DespesaMensal[];
    detalheDespesaMensal: DetalheDespesasMensais[];
}