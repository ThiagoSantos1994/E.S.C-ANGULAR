import { DespesasFixasMensais } from "./despesas-fixas-mensais.interface";
import { LancamentosMensais } from "./lancamentos-mensais.interface";
import { RelatorioDespesasReceitas } from "./relatorio-despesas-receitas.interface";

export interface LancamentosFinanceiros{
    idDespesa: number,
    dsMesReferencia: string;
    dsAnoReferencia: string;
    vlSaldoPositivo: string;
    vlTotalDespesas: string;
    vlTotalPendentePagamento: string;
    vlSaldoDisponivelMes: string;
    vlSaldoInicialMes: string;
    vlSaldoUtilizadoMes: string;
    pcUtilizacaoDespesasMes: string;
    labelQuitacaoParcelasMes: string;
    labelNovasParcelasMes: string;
    statusSaldoMes: string;
    relatorioDespesasReceitas: RelatorioDespesasReceitas[];
    despesasFixasMensais: DespesasFixasMensais[];
    lancamentosMensais: LancamentosMensais[];
}
