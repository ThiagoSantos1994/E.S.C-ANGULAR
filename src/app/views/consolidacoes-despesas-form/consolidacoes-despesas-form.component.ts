import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { TipoMensagem } from 'src/app/core/enums/tipo-mensagem-enums';
import { ConsolidacaoDespesas } from 'src/app/core/interfaces/consolidacao-despesas.interface';
import { Consolidacao } from 'src/app/core/interfaces/consolidacao.interface';
import { TituloConsolidacaoResponse } from 'src/app/core/interfaces/titulo-consolidacao-response.interface';
import { ConsolidacaoService } from 'src/app/core/services/consolidacao.service';
import { MensagemService } from 'src/app/core/services/mensagem.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-consolidacoes-despesas-form',
  templateUrl: './consolidacoes-despesas-form.component.html',
  styleUrls: ['./consolidacoes-despesas-form.component.css']
})
export class ConsolidacoesDespesasFormComponent implements OnInit {
  private _despesasConsolidadas = new BehaviorSubject<ConsolidacaoDespesas[]>([]);
  private consolidacao: Consolidacao;
  private tituloConsolidacoes: TituloConsolidacaoResponse[];
  private idConsolidacaoRef: number = 0;

  private modalConsolidacoesForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  private checkboxesMarcadas: Boolean = false;

  @ViewChild('modalConsolidacoes') modalConsolidacoes;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private service: ConsolidacaoService,
    private mensagem: MensagemService
  ) { }

  ngOnInit() {
    this.loadFormConsolidacoes(null);

    this.service.recebeMensagem().subscribe(consolidacao => {
      this.loadFormConsolidacoes(consolidacao);
    }, () => {
      this.mensagem.enviarMensagem("Ocorreu um erro ao carregar os dados da consolidação, tente novamente mais tarde.", TipoMensagem.Erro);
    })
  }

  loadFormConsolidacoes(objConsolidacao) {
    this.idConsolidacaoRef = -1;
    this.consolidacao = null;
    this.tituloConsolidacoes = null;
    this.checkboxesMarcadas = false;

    this.resetDetalhesObservable();
    this.desabilitarCampos();

    this.modalConsolidacoesForm = this.formBuilder.group({
      checkCarregarNomeConsolidacoes: [true],
      checkMarcarTodasParcelas: [false],
      nomeConsolidacao: ['']
    });

    this.carregarListaConsolidacoes(false);

    if (null != objConsolidacao) {
      this.onChangeTituloConsolidacao(objConsolidacao.idConsolidacao);
    }

    setarFocoCampo("nomeConsolidacao");
  }

  desabilitarCampos() {
    (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = true;
  }

  habilitarCampos(consolidacao: Consolidacao) {
    if (consolidacao.tpBaixado == "S") {
      (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = true;
      (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = false;
    } else {
      (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = false;
      (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = true;
    }
  }

  changeDetalhesConsolidacao(despesa: ConsolidacaoDespesas) {
    let detalhe = this._despesasConsolidadas.getValue();
    let index = detalhe.findIndex((p) => p.idConsolidacao === despesa.idConsolidacao && p.idDespesaParcelada === despesa.idDespesaParcelada);

    despesa.changeValues = true;

    if (index >= 0) {
      despesa[index] = detalhe;
    } else {
      detalhe.push({ ...despesa });
    }

    this._despesasConsolidadas.next(detalhe);
  }

  resetDetalhesObservable() {
    this._despesasConsolidadas.next([]);
  }

  setDetalhesObservable(despesa: ConsolidacaoDespesas[], changeDefaultValues: boolean) {
    let detalhes = this._despesasConsolidadas.getValue();

    despesa.forEach(p => {
      p.changeValues = changeDefaultValues;
      detalhes.push({ ...p });
      this._despesasConsolidadas.next(despesa);
    });
  }

  validarCamposObrigatorios(): boolean {
    let nomeConsolidacao = this.modalConsolidacoesForm.get('nomeConsolidacao').value;
    if ("" == nomeConsolidacao) {
      return false;
    }

    /*Realiza o parser do objeto para gravacao*/
    this.consolidacao = {
      idConsolidacao: this.idConsolidacaoRef,
      dsTituloConsolidacao: nomeConsolidacao,
      tpBaixado: (this.idConsolidacaoRef > 0 ? this.consolidacao.tpBaixado : 'N'),
      idFuncionario: parserToInt(this.sessao.getIdLogin()),
      despesasConsolidadas: (this.consolidacao ? this.consolidacao.despesasConsolidadas : null)
    }

    return true;
  }

  carregarDetalhesConsolidacao() {
    let consolidacaoSelecionada = this.idConsolidacaoRef;

    if (consolidacaoSelecionada <= 0) {
      this.mensagem.enviarMensagem("Necessário selecionar uma consolidação para pesquisar.", TipoMensagem.Alerta);
      setarFocoCampo("nomeConsolidacao");
      return;
    }

    this.carregarDetalhesConsolidacaoService(consolidacaoSelecionada);
  }

  carregarDetalhesConsolidacaoService(consolidacao: number) {
    this.service.getDetalhesConsolidacao(consolidacao).subscribe((res) => {
      this.consolidacao = res;

      (<HTMLInputElement>document.getElementById("nomeConsolidacao")).value = res.dsTituloConsolidacao.toString();
      this.habilitarCampos(res);
      this.resetDetalhesObservable();
      this.setDetalhesObservable(res.despesasConsolidadas, false);
    });
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarConsolidacao': {
        this.confirmGravarConsolidacao();
        break;
      }
      case 'ExcluirConsolidacao': {
        this.confirmExcluirConsolidacao();
        break;
      }
      case 'DesassociarDespesas': {
        this.confirmDesassociarDespesa();
        break;
      }
      case 'BaixarConsolidacao': {
        this.confirmBaixarConsolidacao();
        break;
      }
      case 'ReativarConsolidacao': {
        this.confirmReativarConsolidacao();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  confirmDesassociarDespesa() {
    let despesas = this.getDespesasChecked();

    this.service.desassociarDespesa(despesas).toPromise().then(() => {
      this.recarregarDetalheConsolidacao();
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  confirmBaixarConsolidacao() {
    let consolidacao = this.consolidacao;
    consolidacao.tpBaixado = "S";

    this.service.gravarConsolidacao(this.consolidacao).toPromise().then(() => {
      this.mensagem.enviarMensagem("Consolidacao atualizada com sucesso!", TipoMensagem.Sucesso);
      this.recarregarDetalheConsolidacao();
    });

    this.closeModal();
  }

  confirmReativarConsolidacao() {
    let consolidacao = this.consolidacao;
    consolidacao.tpBaixado = "N";

    this.service.gravarConsolidacao(this.consolidacao).toPromise().then(() => {
      this.mensagem.enviarMensagem("Consolidacao atualizada com sucesso!", TipoMensagem.Sucesso);
      this.recarregarDetalheConsolidacao();
    });

    this.closeModal();
  }

  excluirConsolidacao() {
    this.eventModalConfirmacao = "ExcluirConsolidacao";
    this.mensagemModalConfirmacao_header = "Deseja excluir esta despesa parcelada?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Este processo exclui a consolidação as despesas associadas são desassociadas e exibidas nas despesas mensais importadas.";

    if (null == this.consolidacao) {
      this.mensagem.enviarMensagem("Necessário selecionar uma consolidação.", TipoMensagem.Alerta);
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  baixarConsolidacao() {
    this.eventModalConfirmacao = "BaixarConsolidacao";
    this.mensagemModalConfirmacao_header = "Deseja baixar esta consolidacao?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Após confirmação, a despesa consolidada não será mais exibida para importação nos lançamentos mensais.";

    if (null == this.consolidacao) {
      this.mensagem.enviarMensagem("Necessário selecionar uma consolidação.", TipoMensagem.Alerta);
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  reativarConsolidacao() {
    this.eventModalConfirmacao = "ReativarConsolidacao";
    this.mensagemModalConfirmacao_header = "Deseja reativar esta consolidação?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Este processo exibe novamente a despesa consolidada para importação nos lançamentos mensais.";

    if (null == this.consolidacao) {
      this.mensagem.enviarMensagem("Necessário selecionar uma consolidação.", TipoMensagem.Alerta);
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  desassociarDespesasSelecionadas() {
    this.eventModalConfirmacao = "DesassociarDespesas";
    this.mensagemModalConfirmacao_header = "Deseja desassociar a(s) despesa(s) selecionada(s)?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Atenção: a(s) despesas(s) desassociadas serão exibidas novamente na despesa mensal.";

    if (null == this.consolidacao) {
      this.mensagem.enviarMensagem("Necessário selecionar uma consolidação.", TipoMensagem.Alerta);
      return;
    }

    if (this.getDespesasChecked().length == 0) {
      this.mensagem.enviarMensagem("Necessario selecionar a(s) despesa(s) para serem desassociadas.", TipoMensagem.Alerta);
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheConsolidacao() {
    this.idConsolidacaoRef = this.consolidacao.idConsolidacao;

    this.carregarListaConsolidacoes(false);
    this.carregarDetalhesConsolidacao();
  }

  carregarListaConsolidacoes(isConsolidacoesBaixadas: boolean) {
    this.service.getTitulosConsolidacao(isConsolidacoesBaixadas).subscribe((res) => {
      this.tituloConsolidacoes = res;
    });
  }

  onCheckCarregarNomeConsolidacoes(checked) {
    this.carregarListaConsolidacoes(!checked);
  }

  onChangeTituloConsolidacao(value) {
    this.idConsolidacaoRef = value;
    this.carregarDetalhesConsolidacao();
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.onChangeAllCheckBoxesDespesas(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  gravarConsolidacao() {
    if (!this.validarCamposObrigatorios()) {
      this.mensagem.enviarMensagem("Necessario digitar o nome da consolidação.", TipoMensagem.Alerta);
      return;
    }

    this.eventModalConfirmacao = "GravarConsolidacao";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja salvar as alterações ?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }


  confirmGravarConsolidacao() {
    this.service.gravarConsolidacao(this.consolidacao).toPromise().then(() => {
      this.mensagem.enviarMensagem("Gravação realizada com sucesso!", TipoMensagem.Sucesso);
      this.recarregarDetalheConsolidacao();
    });

    this.closeModal();
  }

  confirmExcluirConsolidacao() {
    this.service.excluirConsolidacao(this.consolidacao).toPromise().then(() => {
      this.loadFormConsolidacoes(null);
      this.mensagem.enviarMensagem("Consolidação excluida com sucesso!", TipoMensagem.Sucesso);
    },
      err => {
        this.mensagem.enviarMensagem("Ocorreu um erro ao excluir esta consolidacao, tente novamente mais tarde.", TipoMensagem.Erro);
        console.log(err);
      });

    this.closeModal();
  }

  onCheckDespesaChange(checked, despesa) {
    despesa.checked = checked;

    let despesas = this._despesasConsolidadas.getValue();
    let index = despesas.findIndex((d) => d.idDespesaParcelada === despesa.idDespesaParcelada);

    if (index >= 0) {
      despesa[index].checked = checked;
    } else {
      despesa.push({ ...despesa });
    }

    this._despesasConsolidadas.next(despesas);
  }

  onChangeAllCheckBoxesDespesas(checked: boolean) {
    this.consolidacao.despesasConsolidadas.forEach(despesa => {
      this.onCheckDespesaChange(checked, despesa);
    });
  }

  getDespesasChecked() {
    return this._despesasConsolidadas.getValue().filter((d) => d.checked === true);
  }

  getDespesasChange() {
    return this._despesasConsolidadas.getValue().filter((d) => d.changeValues === true);
  }

  /* -------------- Metodos Gerais -------------- */
  closeModal(): void {
    this.modalRef.hide();
  }

  convertBooleanToChar(value): string {
    return (value ? "S" : "N");
  }

  getDataMesAtual() {
    return formatDate(Date.now(), 'MM/yyyy', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}

function parserToInt(str) {
  return parseInt(str.replace(/[\D]+/g, ''));
}

async function setarFocoCampo(inputName: string) {
  await aguardarTempo(500); // Aguarda 1/2 segundo
  const campoInput = document.getElementById(inputName) as HTMLInputElement;

  // Define o foco no campo
  campoInput.focus();
}

async function aguardarTempo(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}