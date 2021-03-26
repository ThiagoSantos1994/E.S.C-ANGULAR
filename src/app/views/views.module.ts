import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LoginFormComponent } from "./login-form/login-form.component";
import { ReactiveFormsModule } from "@angular/forms";
import { VMessageModule } from "../shared/components/vmessage/vmessage.module";
import { NotFoundComponent } from "./not-found/not-found.component";

@NgModule({
    declarations: [
        LoginFormComponent,
        NotFoundComponent
    ],
    imports: [
        CommonModule, /*Todo modulo que for criado, é importante importar esse cara*/
        ReactiveFormsModule,
        VMessageModule,
        HttpClientModule
    ]
})

export class ViewsModule{}