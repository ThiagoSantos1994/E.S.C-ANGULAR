import { TipoMensagem } from "../enums/tipo-mensagem-enums";

export interface Mensagem {
    mensagem: string;
    tipo: TipoMensagem;
}