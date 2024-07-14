import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
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
  private qtdeLembretes: number;
  private dataAtual: string;
  private modalRef: BsModalRef;

  constructor(
    private sessaoService: SessaoService,
    private despesasParceladasService: DespesasParceladasService,
    private lembreteService: LembretesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sessaoService.validarSessao();
    this.usuarioLogado = this.sessaoService.getUserName();
    this.qtdeLembretes = null;
    this.dataAtual = this.getDataAtual();
  }

  carregarDespesasParceladas() {
      this.despesasParceladasService.enviaMensagem();
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
