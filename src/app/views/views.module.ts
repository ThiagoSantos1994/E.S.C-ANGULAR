import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CurrencyMaskModule } from "ng2-currency-mask";
import { NgxMaskModule } from "ngx-mask";
import { VMessageModule } from "../shared/components/vmessage/vmessage.module";
import { DespesasParceladasFormComponent } from "./despesas-parceladas-form/despesas-parceladas-form.component";
import { DetalheDespesasFormComponent } from "./detalhe-despesas-form/detalhe-despesas-form.component";
import { HomeFormComponent } from './home-form/home-form.component';
import { LancamentosFinanceirosFormComponent } from './lancamentos-financeiros-form/lancamentos-financeiros-form.component';
import { LoginFormComponent } from "./login-form/login-form.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { LembretesFormComponent } from "./lembretes-form/lembretes-form.component";
import { ConsolidacoesDespesasFormComponent } from "./consolidacoes-despesas-form/consolidacoes-despesas-form.component";
import { MensagensFormComponent } from "./mensagens-form/mensagens-form.component";
import { NgApexchartsModule } from "ng-apexcharts";

@NgModule({
    declarations: [
        LoginFormComponent,
        NotFoundComponent,
        HomeFormComponent,
        LancamentosFinanceirosFormComponent,
        DetalheDespesasFormComponent,
        DespesasParceladasFormComponent,
        ConsolidacoesDespesasFormComponent,
        LembretesFormComponent,
        MensagensFormComponent
    ],
    imports: [
        CommonModule, /*Todo modulo que for criado, é importante importar esse cara*/
        ReactiveFormsModule,
        VMessageModule,
        HttpClientModule,
        RouterModule,
        FormsModule,
        NgxMaskModule.forChild(),
        CurrencyMaskModule,
        NgApexchartsModule
    ]
})

export class ViewsModule { }