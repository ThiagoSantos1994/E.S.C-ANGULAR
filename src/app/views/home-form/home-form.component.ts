import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { SessaoService } from 'src/app/core/services/sessao.service';
import { HomeService } from 'src/app/core/services/home.service';
import { DadosUsuario } from 'src/app/core/interfaces/dados-usuario.interface';
import { DespesasMensais } from 'src/app/core/interfaces/despesas-mensais.interface';


@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css']
})
export class HomeFormComponent implements OnInit {

  usuario$: Observable<DadosUsuario>;
  despesas$: Observable<DespesasMensais>;
  despesas: DespesasMensais;

  //teste: string[] = ['FATURA 1', 'FATURA 2', 'FATURA 3'];
  
  constructor(
      private homeService: HomeService,
      private sessaoService: SessaoService,
      private router: Router
  ) {}

  ngOnInit() {
    this.validaSessao();
    this.getDadosUsuario();
    this.getListaDespesas();
  }

  validaSessao() {
      if (!this.sessaoService.isLogged()) {
          alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
          this.sessaoService.logout();
          this.router.navigate(['login']);
      }
  }

  getListaDespesas() {
      this.homeService.getDespesasMensais()
      .subscribe((res) => {
        this.despesas = res
      });
  }

  getListaDespesas2() {
    this.despesas$ = this.homeService.getDespesasMensais2();
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
