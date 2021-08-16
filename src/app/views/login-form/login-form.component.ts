import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/core/services/login.service';
import { DadosLogin } from 'src/app/core/interfaces/dados-login.interface';
import { SessaoService } from 'src/app/core/services/sessao.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInformativoComponent } from '../modal-informativo/modal-informativo.component';

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {

  loginForm: FormGroup;
  modalReference: any;

  @ViewChild('modalLoginInvalido') modalUsuarioInvalido: any;

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
      this.sessaoService.setTokenAutenticador(res.autenticacao, res.id_Login);
      this.router.navigate(['home']);
    },
      err => {
        if (err.status == 401) {
          this.open(this.modalUsuarioInvalido);
        }
        console.log(err);
        this.reloadForm();
      });
  }

  reloadForm() {
    this.loginForm.reset();
    this.userNameInput.nativeElement.focus();
  }

  open(content) {
    this.modalReference = this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  close() {
    this.modalReference.close();
  }

}
