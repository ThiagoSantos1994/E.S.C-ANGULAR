export interface ConfiguracaoLancamentos{
    dataViradaMes: number;
    mesReferencia?: number;
    idFuncionario: number;
    bviradaAutomatica: boolean;
    qtdeLembretes?: number;
    qtdeAcessos?:number;
    anosReferenciaFiltro?: string[];
}