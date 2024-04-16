import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeFormComponent } from "./views/home-form/home-form.component";

import { LoginFormComponent } from "./views/login-form/login-form.component";
import { NotFoundComponent } from "./views/not-found/not-found.component";

const routes: Routes = [
    { path: 'login', component: LoginFormComponent },
    { path: 'dashboard', component: HomeFormComponent },
    //Rota Default quando colocar uma URL qualquer
    { path: '**', component: NotFoundComponent }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }