import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from 'src/app/core/interfaces/usuario';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { LoginService } from 'src/app/core/services/login.service';

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  
  loginForm: FormGroup;
  
  //Seta o focus do campo caso o login esteja invalido
  @ViewChild('userNameFocus') userNameInput: ElementRef;

  constructor( 
      private formBuilder: FormBuilder,
      private loginService: LoginService,
      private router: Router
    ) { }

  ngOnInit(): void {
      this.loginForm = this.formBuilder.group({
          userName: ['', Validators.required],
          password: ['', Validators.required]
      })
  }
  
  login() {
      const userName = this.loginForm.get('userName').value;
      const password = this.loginForm.get('password').value;

      this.loginService.autenticar(userName, password).subscribe((response: Usuario) => {
        this.validarUsuario(response);
      }, 
      err => {
          console.log(err); 
          alert('Usuario ou senha inválidos!');
          this.resetForm();
      });   
  }

  validarUsuario(usuario: Usuario) {
      if(!usuario.tp_UsuarioBloqueado) {
          this.router.navigate(['home']);
      } else {
          alert("Usuario Bloqueado! Contate o administrador do sistema.");
          this.resetForm();
      }
  }

  resetForm() {
    this.loginForm.reset();
    this.userNameInput.nativeElement.focus();
  }
}
