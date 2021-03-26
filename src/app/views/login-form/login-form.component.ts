import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  
  loginForm: FormGroup;

  constructor( 
      private formBuilder: FormBuilder,
      private authService: AuthService
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

        this.authService.authenticate(userName, password).subscribe(() => alert('acesso autorizado!'),
        err => {
            console.log(err);
            
            alert('Usuario ou senha inválidos!');

            this.loginForm.reset();
        });
    }
 
  
}
