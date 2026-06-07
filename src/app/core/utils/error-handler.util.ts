import { MensagemService } from '../services/mensagem.service';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

/**
 * Exception Handler Global para tratamento de erros de API
 * Mantém o padrão de mensagens e alertas da aplicação
 */
export class GlobalExceptionHandler {
  
  /**
   * Trata erros de API mantendo o padrão de mensagens da aplicação
   * @param error - Erro retornado pela API
   * @param mensagemService - Serviço de mensagens
   * @param mensagemCustomizada - Mensagem personalizada (opcional)
   * @param usarAlert - Se true, usa alert() ao invés de mensagemService (opcional)
   */
  static handleApiError(
    error: any, 
    mensagemService: MensagemService, 
    mensagemCustomizada?: string,
    usarAlert: boolean = false
  ): void {
    console.error('Erro capturado:', error);

    // Fecha qualquer spinner/loading ativo
    this.fecharSpinner(mensagemService);

    // Determina a mensagem apropriada
    const mensagem = this.obterMensagemErro(error, mensagemCustomizada);

    // Exibe a mensagem seguindo o padrão da aplicação
    if (usarAlert) {
      alert(mensagem);
    } else {
      mensagemService.enviarMensagem(mensagem, TipoMensagem.Erro);
    }
  }

  /**
   * Fecha spinners/loading screens
   */
  private static fecharSpinner(mensagemService: MensagemService): void {
    mensagemService.enviarMensagem(null, null);
    
    // Fecha via evento global se disponível
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fecharSpinnerGlobal'));
      (window as any).carregando = false;
    }
  }

  /**
   * Determina a mensagem de erro apropriada
   */
  private static obterMensagemErro(error: any, mensagemCustomizada?: string): string {
    // Se houver mensagem customizada, usa ela
    if (mensagemCustomizada) {
      return mensagemCustomizada;
    }

    // Erro de servidor (5xx)
    if (error && error.status >= 500) {
      return 'Erro de comunicação com o servidor. Tente novamente mais tarde.';
    }

    // Erro de autenticação (401)
    if (error && error.status === 401) {
      return 'Sessão expirada ou credenciais inválidas.';
    }

    // Erro de autorização (403)
    if (error && error.status === 403) {
      return 'Você não tem permissão para realizar esta ação.';
    }

    // Erro não encontrado (404)
    if (error && error.status === 404) {
      return 'Recurso não encontrado.';
    }

    // Erro de validação (400)
    if (error && error.status === 400) {
      if (error.error && error.error.message) {
        return error.error.message;
      }
      return 'Dados inválidos. Verifique as informações.';
    }

    // Erro de timeout
    if (error && error.name === 'TimeoutError') {
      return 'A requisição demorou muito tempo. Tente novamente.';
    }

    // Erro de rede
    if (error && error.status === 0) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    // Mensagem genérica
    return 'Ocorreu um erro ao processar a requisição. Tente novamente mais tarde.';
  }
}

/**
 * Função auxiliar para facilitar o uso (mantém compatibilidade com código existente)
 */
export function handleApiError(
  error: any, 
  mensagemService: MensagemService, 
  mensagemCustomizada?: string,
  usarAlert: boolean = false
): void {
  GlobalExceptionHandler.handleApiError(error, mensagemService, mensagemCustomizada, usarAlert);
}
