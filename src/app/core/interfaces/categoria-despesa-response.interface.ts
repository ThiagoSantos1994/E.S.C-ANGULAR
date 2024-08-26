export interface CategoriaDespesasResponse{
    categorias: Categorias[];
    mesAnoReferencia: string;
}

export interface Categorias {
    nomeCategoria: string;
    vlDespesa: string;
}