export interface DespesasFixasMensais{
    idDespesa: number;
    dsDescricao: string;
    vlTotal?: string;
    dvlTotal?: number;
    tpStatus: string;
    dsMes: string;
    dsAno: string;
    idFuncionario: number;
    idOrdem: number;
    tpFixasObrigatorias: string;
    tpDespesaDebitoCartao: string;
}