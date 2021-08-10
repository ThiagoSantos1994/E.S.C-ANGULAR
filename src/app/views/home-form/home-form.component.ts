import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { SessaoService } from 'src/app/core/services/sessao.service';
import { HomeService } from 'src/app/core/services/home.service';
import { DadosUsuario } from 'src/app/core/interfaces/dados-usuario.interface';
import { DespesasMensais } from 'src/app/core/interfaces/despesas-mensais.interface';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';


@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css']
})
export class HomeFormComponent implements OnInit {

  usuario$: Observable<DadosUsuario>;
  despesas: DespesasMensais;
  despesasFixas: DespesasFixasMensais;

  constructor(
      private homeService: HomeService,
      private sessaoService: SessaoService,
      private router: Router
  ) {}

  ngOnInit() {
    this.validaSessao();
    this.getDadosUsuario();
    this.obterDespesasFixasMensais();
    this.obterDespesasMensais();
  }

  validaSessao() {
      if (!this.sessaoService.isLogged()) {
          alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
          this.sessaoService.logout();
          this.router.navigate(['login']);
      }
  }

  obterDespesasMensais() {
      this.homeService.getDespesasMensais().subscribe((res) => {
        this.despesas = res
      });
  }

  obterDespesasFixasMensais() {
      this.homeService.getDespesasFixasMensais().subscribe((res) => {
        this.despesasFixas = res
      });
  }

  getDadosUsuario() {
    const tokenId = this.sessaoService.getToken();
    this.usuario$ = this.homeService.getDadosUsuario(this.sessaoService.getIdLogin());
    
    /*this.homeService.getDadosUsuario(idLogin).subscribe((response: Usuario) => {
      this.usuario$ = response;
    },
    err => {
        console.log(err); 
        alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
        this.sessaoService.logout();
        this.router.navigate(['login']);
    });*/
  }
}
