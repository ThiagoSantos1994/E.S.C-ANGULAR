import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  //usuario$: Observable<DadosUsuario>;
  usuarioLogado: string;
  dataAtual: string;

  constructor(
    //private homeService: HomeService,
    private sessaoService: SessaoService,
    private despesasParceladasService: DespesasParceladasService,
    private lembreteService: LembretesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.validaSessao();
  }

  validaSessao() {
    if (!this.sessaoService.isLogged()) {
      alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
      this.sessaoService.logout();
      this.router.navigate(['login']);
    }

    this.usuarioLogado = this.sessaoService.getUserName();
    this.dataAtual = new Date().toString();
    //this.getDadosUsuario();
  }

  carregarDespesasParceladas() {
    this.despesasParceladasService.enviaMensagem();
  }

  carregarCadastroLembretes() {
    this.lembreteService.enviaMensagem();
  }
  
  /*getDadosUsuario() {
    const tokenId = this.sessaoService.getToken();
    this.usuario$ = this.homeService.getDadosUsuario(this.sessaoService.getIdLogin());

    this.homeService.getDadosUsuario(idLogin).subscribe((response: Usuario) => {
      this.usuario$ = response;
    },
    err => {
        console.log(err); 
        alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
        this.sessaoService.logout();
        this.router.navigate(['login']);
    });
  }*/

}
