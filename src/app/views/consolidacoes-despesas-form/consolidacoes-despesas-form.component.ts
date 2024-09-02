import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { ConsolidacaoDespesas } from 'src/app/core/interfaces/consolidacao-despesas.interface';
import { Consolidacao } from 'src/app/core/interfaces/consolidacao.interface';
import { TituloConsolidacaoResponse } from 'src/app/core/interfaces/titulo-consolidacao-response.interface';
import { ConsolidacaoService } from 'src/app/core/services/consolidacao.service';
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
    private service: ConsolidacaoService
  ) { }

  ngOnInit() {
    this.loadFormConsolidacoes(null);

    this.service.recebeMensagem().subscribe(consolidacao => {
      this.loadFormConsolidacoes(consolidacao);
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da consolidação, tente novamente mais tarde.')
    })
  }

  loadFormConsolidacoes(objConsolidacao) {
    this.idConsolidacaoRef = -1;
    this.consolidacao = null;
    this.checkboxesMarcadas = false;
    this.resetDetalhesObservable();

    this.tituloConsolidacoes = null;

    this.modalConsolidacoesForm = this.formBuilder.group({
      checkCarregarDespesasPendente: [true],
      checkMarcarTodasParcelas: [false],
      nomeConsolidacao: ['']
    });

    this.carregarListaConsolidacoes(false);

    if (null != objConsolidacao) {
      this.onChangeTituloConsolidacao(objConsolidacao.idConsolidacao);
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
      alert('Necessário selecionar uma consolidação para pesquisar.');
      return;
    }

    this.carregarDetalhesConsolidacaoService(consolidacaoSelecionada);
  }

  carregarDetalhesConsolidacaoService(consolidacao: number) {
    this.service.getDetalhesConsolidacao(consolidacao).subscribe((res) => {
      this.consolidacao = res;

      (<HTMLInputElement>document.getElementById("nomeConsolidacao")).value = res.dsTituloConsolidacao.toString();

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

  excluirConsolidacao() {
    this.eventModalConfirmacao = "ExcluirConsolidacao";
    this.mensagemModalConfirmacao_header = "Deseja excluir esta despesa parcelada?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Este processo exclui todos os lançamentos mensais processados!";

    if (null == this.consolidacao) {
      alert('Necessário selecionar uma consolidacao.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  desassociarDespesasSelecionadas() {
    this.eventModalConfirmacao = "DesassociarDespesas";
    this.mensagemModalConfirmacao_header = "Deseja desassociar a(s) despesa(s) selecionada(s)?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Atenção: a(s) despesas(s) serão desassociadas dos lançamentos mensais importadas.";

    if (null == this.consolidacao) {
      alert('Necessário selecionar uma consolidação.')
      return;
    }

    if (this.getDespesasChecked().length == 0) {
      alert('Necessario selecionar a(s) despesa(s) para serem desassociadas.');
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheConsolidacao() {
    this.idConsolidacaoRef = this.consolidacao.idConsolidacao;

    this.carregarListaConsolidacoes(false);
    this.carregarDetalhesConsolidacao();
  }

  carregarListaConsolidacoes(isTodasDespesas: boolean) {
    this.service.getTitulosConsolidacao(isTodasDespesas).subscribe((res) => {
      this.tituloConsolidacoes = res;
    });
  }

  onCheckCarregarNomeDespParceladas(checked) {
    this.carregarListaConsolidacoes(checked);
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
      alert('Necessário digitar o nome da consolidacao.')
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
      alert('Gravação realizada com sucesso!');
      this.recarregarDetalheConsolidacao();
    });

    this.closeModal();
  }

  confirmExcluirConsolidacao() {
    this.service.excluirConsolidacao(this.idConsolidacaoRef).toPromise().then(() => {
      this.loadFormConsolidacoes(null);
      alert('Consolidação excluida com sucesso!');
    },
      err => {
        alert('Ocorreu um erro ao excluir esta consolidacao, tente novamente mais tarde.');
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

function formatRealNumber(str) {
  var tmp = parserToInt(str) + '';
  tmp = tmp.replace(/([0-9]{2})$/g, ".$1");
  if (tmp.length > 6)
    tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, "$1.$2");

  return tmp.replace('.', ',');
}

function isValorNegativo(str) {
  let regex = new RegExp("-");
  return regex.test(str);
}

function parseDate(texto) {
  let dataDigitadaSplit = texto.split("/");

  let dia = dataDigitadaSplit[0];
  let mes = dataDigitadaSplit[1];
  let ano = dataDigitadaSplit[2];

  if (ano.length < 4 && parseInt(ano) < 50) {
    ano = "20" + ano;
  } else if (ano.length < 4 && parseInt(ano) >= 50) {
    ano = "19" + ano;
  }
  ano = parseInt(ano);
  mes = mes - 1;

  return new Date(ano, mes, dia);
}
