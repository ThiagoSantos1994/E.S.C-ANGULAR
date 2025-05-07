import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TipoMensagem } from 'src/app/core/enums/tipo-mensagem-enums';
import { Mensagem } from 'src/app/core/interfaces/mensagens.interface';
import { MensagemService } from 'src/app/core/services/mensagem.service';

@Component({
  selector: 'app-mensagens-form',
  templateUrl: './mensagens-form.component.html',
  styleUrls: ['./mensagens-form.component.css']
})
export class MensagensFormComponent implements OnInit {

  private modalRef: NgbModalRef | null = null;
  private mensagemModal: String = "";

  @ViewChild('modalMensagemSucesso') modalMensagemSucesso;
  @ViewChild('modalMensagemAlerta') modalMensagemAlerta;
  @ViewChild('modalMensagemErro') modalMensagemErro;
  @ViewChild('modalMensagemGenerica') modalMensagemGenerica;
  @ViewChild('modalMensagemTransparente') modalMensagemTransparente;
  @ViewChild('modalSpinnerProcessando') modalSpinnerProcessando;

  constructor(
    private modalService: NgbModal,
    private service: MensagemService
  ) { }

  ngOnInit() {
    this.service.recebeMensagem().subscribe(mensagem => {

      this.mensagemModal = mensagem.mensagem;

      switch (mensagem.tipo) {
        case TipoMensagem.Sucesso: {
          this.showModalSucesso(mensagem);
          break;
        }
        case TipoMensagem.Alerta: {
          this.showModalAlerta(mensagem);
          break;
        }
        case TipoMensagem.Erro: {
          this.showModalErro(mensagem);
          break;
        }
        case TipoMensagem.Generica: {
          this.showModalGenerica(mensagem);
          break;
        }
        case TipoMensagem.Transparente: {
          this.showModalTransparente(mensagem);
          break;
        }
        case TipoMensagem.Spinner: {
          this.showModalSpinner();
          break;
        }
        default: {
          this.closeModal();
        }
      }
    }, () => {
      alert('Ocorreu um erro no modal de mensagens.')
    })
  }

  showModalSucesso(mensagem: Mensagem) {
    this.modalRef = this.modalService.open(this.modalMensagemSucesso, {
      centered: false, // Centraliza o modal
      //backdrop: 'static', // Impede que o modal seja fechado clicando no backdrop
      //keyboard: false // Impede que o modal seja fechado clicando na tecla Esc
    });

    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  showModalAlerta(mensagem: Mensagem) {
    this.modalRef = this.modalService.open(this.modalMensagemAlerta, {
      centered: false,
    });

    setTimeout(() => {
      this.closeModal();
    }, 2500);
  }

  showModalErro(mensagem: Mensagem) {
    this.modalRef = this.modalService.open(this.modalMensagemErro, {
      centered: false,
    });

    setTimeout(() => {
      this.closeModal();
    }, 2500);
  }

  showModalGenerica(mensagem: Mensagem) {
    this.modalRef = this.modalService.open(this.modalMensagemGenerica, {
      centered: false,
    });

    setTimeout(() => {
      this.closeModal();
    }, 2500);
  }

  showModalTransparente(mensagem: Mensagem) {
    this.modalRef = this.modalService.open(this.modalMensagemTransparente, {
      centered: false,
    });

    setTimeout(() => {
      this.closeModal();
    }, 2500);
  }

  showModalSpinner() {
    this.modalRef = this.modalService.open(this.modalSpinnerProcessando, {
      centered: false
    });

    /*setTimeout(() => {
      this.closeModal();
    }, 2500);*/
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close(); // Fecha o modal
      this.modalRef = null; // Limpa a referência
    }
  }

  confirmAction(): void {
    this.closeModal();
  }
}