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

  private subject = new Subject<any>();

  public enviarMensagem(msg: string, tipo: TipoMensagem) {

    const mensagem: Mensagem = {
      mensagem: msg,
      tipo: tipo
    };
    
    this.subject.next(mensagem);
  }

  public recebeMensagem(): Observable<Mensagem> {
    return this.subject.asObservable();
  }
}
