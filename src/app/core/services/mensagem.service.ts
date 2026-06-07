import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Mensagem } from '../interfaces/mensagens.interface';
import { TipoMensagem } from '../enums/tipo-mensagem-enums';

@Injectable({
  providedIn: 'root'
})
export class MensagemService {

  constructor(
  ) { }

  private readonly subject = new Subject<Mensagem>();

  enviarMensagem(msg: string | null, tipo: TipoMensagem | null): void {
    const mensagem: Mensagem = {
      mensagem: msg,
      tipo: tipo
    };
    
    this.subject.next(mensagem);
  }

  recebeMensagem(): Observable<Mensagem> {
    return this.subject.asObservable();
  }
}
