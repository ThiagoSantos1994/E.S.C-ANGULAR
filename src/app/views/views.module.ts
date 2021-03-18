import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LoginFormComponent } from "./login-form/login-form.component";

@NgModule({
    declarations: [
        LoginFormComponent
    ],
    imports: [
        HttpClientModule,
        CommonModule /*Todo modulo que for criado, é importante importar esse cara*/
    ]
})

export class LoginModule{}