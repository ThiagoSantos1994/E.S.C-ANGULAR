import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./errors/not-found/not-found.component";
import { LoginFormComponent } from "./views/login-form/login-form.component";

const routes: Routes = [
    { path: 'esc/login', component: LoginFormComponent },
    //Rota Default quando colocar uma URL qualquer
    { path: '**', component: NotFoundComponent }
];


@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }