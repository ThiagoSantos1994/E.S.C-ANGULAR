import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { DadosLogin } from 'src/app/core/interfaces/dados-login.interface';
import { SessaoService } from 'src/app/core/services/sessao.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  
  loginForm: FormGroup;
  closeResult = '';
  modalReference: any;

  @ViewChild('content') modalTela: any;

  //Seta o focus do campo caso o login esteja invalido
  @ViewChild('userNameFocus') userNameInput: ElementRef;

  constructor( 
      private formBuilder: FormBuilder,
      private loginService: LoginService,
      private sessaoService: SessaoService,
      private router: Router,
      private modalService: NgbModal
    ) { }

  ngOnInit(): void {
      this.sessaoService.logout();
      this.loginForm = this.formBuilder.group({
          userName: ['', Validators.required],
          password: ['', Validators.required]
      })
  }
  
  login() {
      const userName = this.loginForm.get('userName').value;
      const password = this.loginForm.get('password').value;

      this.loginService.autenticar(userName, password).toPromise().then(res => {
          this.validar(res);
      }, 
      err => {
          console.log(err); 
          alert('Usuario ou senha inválidos!');
          this.reloadForm();
      }); 
  }

  validar(login: DadosLogin) {
      if(true == login.autorizado) {
          this.sessaoService.setTokenAutenticador(login.autenticacao, login.id_Login);  
          this.router.navigate(['home']);
      } else {
          //alert("Usuario ou senha inválidos!");
          
          this.open(this.modalTela);
          this.reloadForm();
      }
  }

  reloadForm() {
    this.loginForm.reset();
    this.userNameInput.nativeElement.focus();
  }

  open(content) {
    this.modalReference = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }
  
  close() {
    this.modalReference.close();
  }

}
