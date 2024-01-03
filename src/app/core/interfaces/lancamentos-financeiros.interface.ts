import { DespesasFixasMensais } from "./despesas-fixas-mensais.interface";
import { LancamentosMensais } from "./lancamentos-mensais.interface";

export interface LancamentosFinanceiros{
    idDespesa: number,
    dsMesReferencia: string;
    dsAnoReferencia: string;
    vlSaldoPositivo: string;
    vlTotalDespesas: string;
    vlTotalPendentePagamento: string;
    vlSaldoDisponivelMes: string;
    vlSaldoInicialMes: string;
    pcUtilizacaoDespesasMes: string;
    labelQuitacaoParcelasMes: string;
    despesasFixasMensais: DespesasFixasMensais[];
    lancamentosMensais: LancamentosMensais[];
}
