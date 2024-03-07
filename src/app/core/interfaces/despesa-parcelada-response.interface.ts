export interface DespesaParceladaResponse {
    idDespesaParcelada: number;
    qtdeParcelas: number;
    qtdeParcelasPagas: number;
    parcelaAtual: String;
    valorParcelaAtual: String;
    valorTotalDespesa: String;
    valorTotalDespesaPaga: String;
    valorTotalDespesaPendente: String;
    isDespesaComParcelaAmortizada: String;
    isDespesaComParcelaAdiantada: String;
    despesaVinculada: String;
    despesas: Despesa;
    parcelas: Parcelas[];
}

export interface Despesa {
    idDespesaParcelada: number;
    dsTituloDespesaParcelada: String;
    dsMesVigIni: String;
    dsAnoVigIni: String;
    dsVigenciaFin: String;
    nrTotalParcelas: number;
    vlFatura: String;
    vlParcela: String;
    idFuncionario: number;
    nrParcelasAdiantadas: number;
    tpBaixado: String;
}

export interface Parcelas {
    idDespesaParcelada: number;
    idParcela: number;
    nrParcela: String;
    vlParcela: String;
    vlDesconto: String;
    idDespesa: number;
    idDetalheDespesa: number;
    idFuncionario: number;
    dsDataVencimento: String;
    dsObservacoes: String;
    tpBaixado: String;
    tpQuitado: String;
    tpParcelaAdiada: String;
    tpParcelaAmortizada: String;
    checked?: Boolean;
}