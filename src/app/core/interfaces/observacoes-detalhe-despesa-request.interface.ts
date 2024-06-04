export interface ObservacoesDetalheDespesaRequest {
    idDespesa: number;
    idDetalheDespesa: number;
    idOrdem: number;
    idFuncionario: number;
    dsObservacoes?: string;
}