export interface ObservacoesDetalheDespesaRequest {
    idObservacao: number;
    idDespesa: number;
    idDetalheDespesa: number;
    idOrdem: number;
    idFuncionario: number;
    dsObservacoes?: string;
}