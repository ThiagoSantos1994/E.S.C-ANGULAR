import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { LoginFormComponent } from "./views/login-form/login-form.component";
import { NotFoundComponent } from "./views/not-found/not-found.component";

const routes: Routes = [
    { path: '', component: LoginFormComponent },
    //Rota Default quando colocar uma URL qualquer
    { path: '**', component: NotFoundComponent }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }