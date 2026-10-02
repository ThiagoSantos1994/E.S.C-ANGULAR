import { formatDate } from '@angular/common';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { TipoMensagem } from 'src/app/core/enums/tipo-mensagem-enums';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { ConsolidacaoService } from 'src/app/core/services/consolidacao.service';

import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
import { HomeService } from 'src/app/core/services/home.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { MensagemService } from 'src/app/core/services/mensagem.service';
import { SessaoService } from 'src/app/core/services/sessao.service';
import { TokenService } from 'src/app/core/services/token.service';
import { handleApiError } from 'src/app/core/utils/error-handler.util';
//import { DadosUsuario } from 'src/app/core/interfaces/dados-usuario.interface';


@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css']
})
export class HomeFormComponent implements OnInit {

  private usuarioLogado: string;
  private dataAtual: string;
  private modalRef: BsModalRef;
  private configuracoesLancamentos: ConfiguracaoLancamentos;

  public sessionRemaining: string = '';
  public sessionRemainingSeconds: number = 0;
  private sessionInterval: any;
  public sessionPercent: number = 100;
  public sessionColorClass: string = 'green';
  private tokenPayload: any = null;
  public circumference: number = 2 * Math.PI * 15.9155;
  public usedLength: number = 0;
  public menuLateralAberto = true;
  public isMobile = false;

  //Variaveis para controle da inatividade do usuario
  public userStatusText: string = 'Disponivel';
  public userStatusClass: string = 'available';
  private inactivityTimeout: any;
  private logoutTimeout: any;
  private idlePopupTimeout: any;
  private idlePopupInterval: any;
  public showIdleWarningPopup = false;
  public idlePopupSeconds = 10;
  private readonly idleWarningMs = 5 * 60 * 1000; // 5 minutos para alterar o status para ausente
  private readonly idleLogoutMs = 10 * 60 * 1000; // 10 minutos para encerrar a sessão por inatividade
  private readonly idlePopupThresholdMs = 10 * 1000; // exibir aviso 10 segundos antes do logout

  constructor(
    private sessaoService: SessaoService,
    private lancamentosService: LancamentosFinanceirosService,
    private homeService: HomeService,
    private despesasParceladasService: DespesasParceladasService,
    private consolidacaoService: ConsolidacaoService,
    private lembreteService: LembretesService,
    private router: Router,
    private mensagens: MensagemService
    , private tokenService: TokenService
  ) { }

  ngOnInit() {
    this.atualizarMenuParaViewport();
    this.sessaoService.validarSessao();
    this.startSessionTimer();
    this.carregarConfiguracaoLancamentos();
    this.resetInactivity();

    this.homeService.recebeMensagem().subscribe(() => {
      this.carregarConfiguracaoLancamentos();
    }, error => {
      handleApiError(error, this.mensagens, 'Ocorreu um erro ao carregar as informações da configuração da home, tente novamente mais tarde.', true);
    });
  }

  @HostListener('window:resize')
  onWindowResize() {
    const isMobile = window.innerWidth < 768;
    if (isMobile !== this.isMobile) {
      this.isMobile = isMobile;
      this.menuLateralAberto = !isMobile;
    }
  }

  alternarMenuLateral(event: Event) {
    event.preventDefault();
    this.menuLateralAberto = !this.menuLateralAberto;
  }

  fecharMenuLateral() {
    this.menuLateralAberto = false;
  }

  private atualizarMenuParaViewport() {
    this.isMobile = window.innerWidth < 768;
    this.menuLateralAberto = !this.isMobile;
  }

  carregarConfiguracaoLancamentos() {
    this.inicializarVariaveis();

    this.lancamentosService.getConfiguracaoLancamentos().subscribe((res: ConfiguracaoLancamentos) => {
      this.configuracoesLancamentos = res;
      this.usuarioLogado = this.sessaoService.getUserName();
    },
      error => {
        handleApiError(error, this.mensagens, 'Ocorreu um erro ao carregar as configurações de lançamentos.');
      });
  }

  startSessionTimer() {
    try {
      const payload = this.tokenService.getPayload();
      this.tokenPayload = payload;
      if (!payload || !payload.exp) {
        return;
      }

      const exp = Number(payload.exp);
      this.updateSessionRemaining(exp);

      this.sessionInterval = setInterval(() => {
        this.updateSessionRemaining(exp);
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar timer de sessão:', error);
    }
  }

  private updateSessionRemaining(exp: number) {
    const now = Math.floor(Date.now() / 1000);
    let diff = exp - now;
    if (diff <= 0) {
      this.sessionRemaining = '00:00';
      this.sessionRemainingSeconds = 0;
      this.mensagens.enviarMensagem("Sua sessão expirou. Você será redirecionado para a tela de login.", TipoMensagem.Alerta);
      
      if (this.sessionInterval) {
        clearInterval(this.sessionInterval);
        this.sessionInterval = null;
      }
      this.clearInactivityTimers();
      try {
        this.sessaoService.logout();
      } catch (e) {
        // ignore
      }
      this.router.navigate(['login']);
      return;
    }

    this.sessionRemainingSeconds = diff;
    this.sessionRemaining = this.formatTime(diff);

    // calculate percent based on iat/exp if possible
    if (this.tokenPayload && this.tokenPayload.iat) {
      const iat = Number(this.tokenPayload.iat);
      const total = exp - iat;
      if (total > 0) {
        this.sessionPercent = Math.max(0, Math.min(100, Math.round((diff / total) * 100)));
      } else {
        this.sessionPercent = 100;
      }
    } else {
      this.sessionPercent = 100;
    }

    // set color class: green (>30%), orange (10-30%), red (<=10%)
    if (this.sessionPercent <= 10) {
      this.sessionColorClass = 'red';
    } else if (this.sessionPercent <= 30) {
      this.sessionColorClass = 'orange';
    } else {
      this.sessionColorClass = 'green';
    }

    // compute used length (white stroke) as proportion of time used
    const usedPercent = 100 - this.sessionPercent;
    this.usedLength = Math.max(0, Math.min(this.circumference, (usedPercent / 100) * this.circumference));

    // if the user is currently absent and the remaining session is below 5 minutes, logout immediately
    if (this.userStatusClass === 'absent' && this.sessionRemainingSeconds <= 300) {
      this.handleInactivityLogout();
    }
  }

  private formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
    }
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(n: number): string {
    return n < 10 ? '0' + n : n.toString();
  }

  @HostListener('document:mousemove')
  onUserActivity() {
    this.resetInactivity();
  }

  private resetInactivity() {
    this.userStatusText = 'Disponivel';
    this.userStatusClass = 'available';
    this.showIdleWarningPopup = false;
    this.idlePopupSeconds = 10;
    this.clearInactivityTimers();
    this.inactivityTimeout = window.setTimeout(() => this.markAbsent(), this.idleWarningMs);

    if (this.sessionRemainingSeconds > 300) {
      const popupTimeout = this.idleLogoutMs - this.idlePopupThresholdMs;
      this.idlePopupTimeout = window.setTimeout(() => this.startIdlePopupCountdown(), popupTimeout);
      this.logoutTimeout = window.setTimeout(() => this.handleInactivityLogout(), this.idleLogoutMs);
    }
  }

  private markAbsent() {
    this.userStatusText = 'Ausente';
    this.userStatusClass = 'absent';
    if (this.sessionRemainingSeconds <= 300) {
      this.handleInactivityLogout();
      return;
    }
  }

  private startIdlePopupCountdown() {
    if (this.showIdleWarningPopup) {
      return;
    }
    this.showIdleWarningPopup = true;
    this.idlePopupSeconds = 10;
    this.idlePopupInterval = window.setInterval(() => {
      this.idlePopupSeconds = Math.max(0, this.idlePopupSeconds - 1);
      if (this.idlePopupSeconds <= 0) {
        this.clearIdlePopupTimers();
        this.handleInactivityLogout();
      }
    }, 1000);
  }

  private handleInactivityLogout() {
    this.clearInactivityTimers();
    this.mensagens.enviarMensagem("Sessão encerrada por inatividade.", TipoMensagem.Alerta);
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
    try {
      this.sessaoService.logout();
    } catch (e) {
      // ignore
    }
    this.router.navigate(['login']);
  }

  private clearInactivityTimers() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
      this.inactivityTimeout = null;
    }
    if (this.logoutTimeout) {
      clearTimeout(this.logoutTimeout);
      this.logoutTimeout = null;
    }
    this.clearIdlePopupTimers();
  }

  private clearIdlePopupTimers() {
    if (this.idlePopupTimeout) {
      clearTimeout(this.idlePopupTimeout);
      this.idlePopupTimeout = null;
    }
    if (this.idlePopupInterval) {
      clearInterval(this.idlePopupInterval);
      this.idlePopupInterval = null;
    }
    this.showIdleWarningPopup = false;
    this.idlePopupSeconds = 10;
  }

  ngOnDestroy() {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
    this.clearInactivityTimers();
  }

  inicializarVariaveis() {
    this.configuracoesLancamentos = {
      dataViradaMes: 0,
      mesReferencia: 0,
      anoReferencia: 0,
      idFuncionario: 0,
      bviradaAutomatica: false,
      qtdeLembretes: 0,
      qtdeAcessos: 0,
      anosReferenciaFiltro: null
    };

    this.dataAtual = this.getDataAtual();
  }

  carregarDespesasParceladas() {
    this.despesasParceladasService.enviaMensagem(null);
    this.sessaoService.validarSessao();
  }

  carregarConsolidacoes() {
    this.consolidacaoService.enviaMensagem(null);
    this.sessaoService.validarSessao();
  }

  carregarCadastroLembretes() {
    this.lembreteService.enviaMensagem("cadastro");
    this.sessaoService.validarSessao();
  }

  carregarMonitorLembretes() {
    this.lembreteService.enviaMensagem("monitor");
    this.sessaoService.validarSessao();
  }

  getDataAtual() {
    return formatDate(Date.now(), 'dd/MM/yyyy', 'en-US');
  }
}
