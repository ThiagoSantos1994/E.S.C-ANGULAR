import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/core/interfaces/usuario';
import { TokenService } from 'src/app/core/services/token.service';
import { HomeService } from 'src/app/core/services/home.service';

@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css']
})
export class HomeFormComponent implements OnInit {

  private usuario: Usuario;

  constructor(
      private homeService: HomeService,
      private tokenService: TokenService,
      private router: Router
  ) { }

  ngOnInit() {
    this.getDadosUsuario();
  }

  getDadosUsuario() {
    const id_Login = this.tokenService.getToken();

    this.homeService.getDadosUsuario(id_Login).subscribe((response: Usuario) => {
      this.usuario = response;
    },
    err => {
        console.log(err); 
        alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
        this.tokenService.removeToken();
        this.router.navigate(['login']);
    });
  }
}
