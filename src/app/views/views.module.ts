import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LoginFormComponent } from "./login-form/login-form.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { VMessageModule } from "../shared/components/vmessage/vmessage.module";
import { NotFoundComponent } from "./not-found/not-found.component";
import { RouterModule } from "@angular/router";
import { HomeFormComponent } from './home-form/home-form.component';
import { LancamentosFinanceirosFormComponent } from './lancamentos-financeiros-form/lancamentos-financeiros-form.component';
import { NgxMaskModule } from "ngx-mask";
import { CurrencyMaskModule } from "ng2-currency-mask";
import { DetalheDespesasFormComponent } from "./detalhe-despesas-form/detalhe-despesas-form.component";

@NgModule({
    declarations: [
        LoginFormComponent,
        NotFoundComponent,
        HomeFormComponent,
        LancamentosFinanceirosFormComponent,
        DetalheDespesasFormComponent
    ],
    imports: [
        CommonModule, /*Todo modulo que for criado, é importante importar esse cara*/
        ReactiveFormsModule,
        VMessageModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        NgxMaskModule.forChild(),
        CurrencyMaskModule
    ]
})

export class ViewsModule { }