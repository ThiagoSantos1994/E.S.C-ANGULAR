import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/core/interfaces/usuario.interface';
import { TokenService } from 'src/app/core/services/token.service';
import { HomeService } from 'src/app/core/services/home.service';
import { LoginDomain } from 'src/app/core/domain/login.domain';
import { Observable } from 'rxjs';
import { UsuarioService } from 'src/app/core/services/usuario.service';

@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.css']
})
export class HomeFormComponent implements OnInit {

  usuario$: Observable<Usuario>;
  
  constructor(
      private homeService: HomeService,
      private usuarioService: UsuarioService,
      private loginDomain: LoginDomain,
      private router: Router
  ) { 
      this.usuario$ = usuarioService.getUsuarioToken();
  }

  ngOnInit() {
    this.validaSessao();
    //this.getDadosUsuario();
  }

  validaSessao() {
      if (!this.usuarioService.isLogged()) {
          alert('Desculpe! ocorreu um erro ao carregar os dados da pagina, estamos redirecionando para a pagina de login!');
          this.usuarioService.logout();
          this.router.navigate(['login']);
      }
  }
  /*getDadosUsuario() {
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
  }*/
}
