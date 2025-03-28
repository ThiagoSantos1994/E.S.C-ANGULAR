import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { ConsolidacaoService } from 'src/app/core/services/consolidacao.service';

import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
import { HomeService } from 'src/app/core/services/home.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { SessaoService } from 'src/app/core/services/sessao.service';
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

  constructor(
    private sessaoService: SessaoService,
    private lancamentosService: LancamentosFinanceirosService,
    private homeService: HomeService,
    private despesasParceladasService: DespesasParceladasService,
    private consolidacaoService: ConsolidacaoService,
    private lembreteService: LembretesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sessaoService.validarSessao();
    this.carregarConfiguracaoLancamentos();

    this.homeService.recebeMensagem().subscribe(() => {
      this.carregarConfiguracaoLancamentos();
    }, () => {
      alert('Ocorreu um erro ao carregar as informações da configuracao da home, tente novamente mais tarde.')
    });
  }

  carregarConfiguracaoLancamentos() {
    this.inicializarVariaveis();

    this.lancamentosService.getConfiguracaoLancamentos().subscribe((res: ConfiguracaoLancamentos) => {
      this.configuracoesLancamentos = res;
      this.usuarioLogado = this.sessaoService.getUserName();
    },
      err => {
        console.log(err);
      });
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
