import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { MensagemService } from './mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

/**
 * Serviço centralizado para tratamento de erros HTTP nos services
 * Mantém o padrão de mensagens da aplicação
 */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(private mensagemService: MensagemService) { }

  /**
   * Método principal para tratamento de erros HTTP
   * Mantém compatibilidade com o padrão existente da aplicação
   */
  handleError = (error: HttpErrorResponse) => {
    this.fecharSpinner();

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      console.error('Ocorreu um erro:', error.error.message);
      this.mensagemService.enviarMensagem(
        'Erro ao processar a requisição. Tente novamente.',
        TipoMensagem.Erro
      );
    } else {
      // Erro do lado do servidor
      this.handleServerError(error);
    }

    return throwError(error);
  }

  /**
   * Trata erros específicos do servidor
   */
  private handleServerError(error: HttpErrorResponse): void {
    // Verifica se há mensagem customizada do backend
    if (error.error && (error.error.codigo == 204 || error.error.codigo == 400)) {
      this.mensagemService.enviarMensagem(error.error.mensagem, TipoMensagem.Alerta);
    } else {
      // Mensagem genérica para outros erros
      this.mensagemService.enviarMensagem(
        'Ops!! Ocorreu um erro no servidor. Tente novamente mais tarde.',
        TipoMensagem.Erro
      );
    }

    // Log detalhado no console
    console.error(
      `Backend código de erro ${error.status}, ` +
      `request foi: ${error.error}` +
      (error.error && error.error.mensagem ? ` mensagem: ${error.error.mensagem}` : '')
    );
  }

  /**
   * Fecha spinners/loading screens
   */
  private fecharSpinner(): void {
    this.mensagemService.enviarMensagem(null, null);
  }
}
