import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsModalService } from 'ngx-bootstrap/modal';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private ngbModal: NgbModal,
    private bsModalService: BsModalService,
    private tokenService: TokenService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: any) => {
        if (this.shouldHandleUnauthorized(error, request)) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  private shouldHandleUnauthorized(error: any, request: HttpRequest<any>): boolean {
    if (!(error instanceof HttpErrorResponse)) {
      return false;
    }

    if (error.status !== 401) {
      return false;
    }

    const url = request.url || '';
    if (url.includes('/login/autenticar')) {
      return false;
    }

    if (!this.tokenService.hasToken()) {
      return false;
    }

    return true;
  }

  private handleUnauthorized(): void {
    this.closeAllModals();
    this.closeAllSpinners();

    timer(3000).subscribe(() => {
      this.tokenService.removeToken();
      this.router.navigate(['login']);
    });
  }

  private closeAllModals(): void {
    try {
      this.ngbModal.dismissAll();
    } catch (error) {
      console.warn('Falha ao dispensar modais ng-bootstrap:', error);
    }

    try {
      this.bsModalService.hide(1);
    } catch (error) {
      console.warn('Falha ao fechar modais ngx-bootstrap:', error);
    }
  }

  private closeAllSpinners(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fecharSpinnerGlobal'));
      (window as any).carregando = false;
    }
  }
}
