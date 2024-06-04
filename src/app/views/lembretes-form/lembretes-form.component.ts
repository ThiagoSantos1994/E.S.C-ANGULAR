import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DetalheLembrete } from 'src/app/core/interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from 'src/app/core/interfaces/titulo-lembretes.interface';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lembretes-form',
  templateUrl: './lembretes-form.component.html',
  styleUrls: ['./lembretes-form.component.css']
})
export class LembretesFormComponent implements OnInit {
  private detalheLembrete: DetalheLembrete;
  private tituloLembretes$: Observable<TituloLembretes[]>;
  private _monitorLembretes = new BehaviorSubject<TituloLembretes[]>([]);
  private idLembreteReferencia: number = 0;
  private checkboxesMarcadas: Boolean = false;

  private modalLembretesForm: FormGroup;
  private modalAgendarLembretesForm: FormGroup;
  private checkLembretesForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  @ViewChild('modalLembretes') modalLembretes;
  @ViewChild('modalVisualizarLembretes') modalVisualizarLembretes;
  @ViewChild('modalBaixarLembretesMonitor') modalBaixarLembretesMonitor;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private service: LembretesService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.loadFormLembretes();
    this.carregarMonitorLembretes(true);

    this.service.recebeMensagem().subscribe(d => {
      if (d == "cadastro") {
        this.loadFormLembretes();
        this.carregarListaLembretes(false);
      } else {
        this.carregarMonitorLembretes(true);
      }
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    });
  }

  loadFormLembretes() {
    this.idLembreteReferencia = -1;
    this.detalheLembrete = null;
    this.tituloLembretes$ = null;
    
    this.modalLembretesForm = this.formBuilder.group({
      checkCarregarLembretesEmAberto: [true],
      nomeLembrete: [''],
      observacoesLembrete: ['']
    });

    this.modalAgendarLembretesForm = this.formBuilder.group({
      checkContagemRegressiva: [false],
      checkRenovaAUTO: [false],
      qtdeDiasContagem: [0],
      checkNotificarDiasSemana: [false],
      checkSeg: [false],
      checkTer: [false],
      checkQua: [false],
      checkQui: [false],
      checkSex: [false],
      checkSab: [false],
      checkDom: [false],
      checkNotificarDatas: [false]
    });

    this.onCheckContagemRegressiva(false);
    this.onCheckNotificarDiasSemana(false);
    this.onCheckNotificarDatasProgramadas(false);
    this.desabilitarCampos();
  }

  desabilitarCampos() {
    (<HTMLInputElement>document.getElementById("buttonExcluir")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonAgendar")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonGravar")).disabled = true;
    (<HTMLInputElement>document.getElementById("nomeLembrete")).disabled = true;
    (<HTMLInputElement>document.getElementById("observacoesLembrete")).disabled = true;
  }

  habilitarCampos() {
    (<HTMLInputElement>document.getElementById("buttonExcluir")).disabled = false;
    (<HTMLInputElement>document.getElementById("buttonAgendar")).disabled = false;
    (<HTMLInputElement>document.getElementById("buttonGravar")).disabled = false;
    (<HTMLInputElement>document.getElementById("nomeLembrete")).disabled = false;
    (<HTMLInputElement>document.getElementById("observacoesLembrete")).disabled = false;

    this.detalheLembrete = this.obterNovoLembreteObjeto(-1);
  }

  onCheckNotificarDatasProgramadas(checked) {
    (<HTMLInputElement>document.getElementById("data1")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("data2")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("data3")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("data4")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("data5")).disabled = !checked;

    (<HTMLInputElement>document.getElementById("data1")).value = "";
    (<HTMLInputElement>document.getElementById("data2")).value = "";
    (<HTMLInputElement>document.getElementById("data3")).value = "";
    (<HTMLInputElement>document.getElementById("data4")).value = "";
    (<HTMLInputElement>document.getElementById("data5")).value = "";

    (<HTMLInputElement>document.getElementById("checkContagemRegressiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkNotificarDiasSemana")).disabled = checked;
  }

  onCheckNotificarDiasSemana(checked) {
    (<HTMLInputElement>document.getElementById("checkSeg")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkTer")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkQua")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkQui")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkSex")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkSab")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkDom")).disabled = !checked;

    this.modalAgendarLembretesForm.get('checkSeg').setValue(false);
    this.modalAgendarLembretesForm.get('checkTer').setValue(false);
    this.modalAgendarLembretesForm.get('checkQua').setValue(false);
    this.modalAgendarLembretesForm.get('checkQui').setValue(false);
    this.modalAgendarLembretesForm.get('checkSex').setValue(false);
    this.modalAgendarLembretesForm.get('checkSab').setValue(false);
    this.modalAgendarLembretesForm.get('checkDom').setValue(false);

    (<HTMLInputElement>document.getElementById("dataLembrete")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkContagemRegressiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkNotificarDatas")).disabled = checked;
    (<HTMLInputElement>document.getElementById("dataLembrete")).value = (checked ? null : this.getDataAtual());
  }

  onCheckContagemRegressiva(checked) {
    (<HTMLInputElement>document.getElementById("qtdeDiasContagem")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkRenovaAUTO")).disabled = !checked;

    this.modalAgendarLembretesForm.get('checkRenovaAUTO').setValue(false);
    this.modalAgendarLembretesForm.get('qtdeDiasContagem').setValue(0);
    (<HTMLInputElement>document.getElementById("checkNotificarDiasSemana")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkNotificarDatas")).disabled = checked;
  }

  onCheckCarregarTituloLembretes(checked) {
    this.carregarListaLembretes(!checked);
  }

  onChangeTituloLembrete(value) {
    this.idLembreteReferencia = value;
    this.carregarDetalheLembrete();
  }

  carregarDetalheLembrete() {
    this.service.getDetalheLembrete(this.idLembreteReferencia).subscribe((res: any) => {
      this.detalheLembrete = res;

      this.modalLembretesForm = this.formBuilder.group({
        nomeLembrete: res.dsTituloLembrete,
        observacoesLembrete: res.dsObservacoes
      });

      this.habilitarCampos();
    });
  }

  carregarListaLembretes(isTodosLembretes: boolean) {
    this.service.getTituloLembretes(isTodosLembretes).subscribe((res: any) => {
      this.tituloLembretes$ = res;
    });
  }

  carregarMonitorLembretes(abrirMonitor: boolean) {
    this.service.getMonitorLembretes().subscribe((res: any) => {
      this.tituloLembretes$ = res;
      if (res.length > 0) {
        this.resetMonitorLembretesObservable();
        this.setMonitorLembretesObservable(res, false);

        if (abrirMonitor) {
          this.abrirMonitorLembretes();
        }
      }
    });
  }

  abrirMonitorLembretes() {
    this.checkboxesMarcadas = false;

    this.checkLembretesForm = this.formBuilder.group({
      checkMarcarTodosLembretes: [false]
    });

    this.modalRef = this.modalService.show(this.modalVisualizarLembretes);
  }

  abrirModalBaixaLembretesSelecionados() {
    let lembretesChecked = this.getMonitorLembretesChecked().length;
    if (lembretesChecked == 0) {
      alert('Necessario selecionar o lembrete para baixar.');
    } else {
      this.modalRef = this.modalService.show(this.modalBaixarLembretesMonitor);
    }
  }

  resetMonitorLembretesObservable() {
    this._monitorLembretes.next([]);
  }

  setMonitorLembretesObservable(lembrete: TituloLembretes[], checkedDefaultValues: boolean) {
    let lembretes = this._monitorLembretes.getValue();

    lembrete.forEach(p => {
      p.checked = checkedDefaultValues;
      lembretes.push({ ...p });
      this._monitorLembretes.next(lembretes);
    });
  }

  onCheckMonitorLembretesChange(checked, lembrete) {
    lembrete.checked = checked;

    let lembretes = this._monitorLembretes.getValue();
    let index = lembretes.findIndex((d) => d.idLembrete === lembrete.idLembrete);

    if (index >= 0) {
      lembretes[index].checked = checked;
    } else {
      lembretes.push({ ...lembrete });
    }

    this._monitorLembretes.next(lembretes);
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.onChangeAllCheckBoxesLembretes(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  onChangeAllCheckBoxesLembretes(checked: boolean) {
    let lembretes = this._monitorLembretes.value;
    this.resetMonitorLembretesObservable();
    this.setMonitorLembretesObservable(lembretes, checked);
  }

  getMonitorLembretesChecked() {
    return this._monitorLembretes.getValue().filter((d) => d.checked === true);
  }

  gravarDetalhesLembrete() {
    if (!this.validarCamposObrigatorios()) {
      if (null == this.detalheLembrete) {
        alert('Necessário preencher todo(s) o(s) campo(s) para gravar o lembrete.')
      }

      return;
    }

    this.eventModalConfirmacao = "GravarDetalhesLembrete";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja gravar as alterações ?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  validarCamposObrigatorios(): boolean {
    let nomeLembrete = this.modalLembretesForm.get('nomeLembrete').value;
    if ("" == nomeLembrete) {
      return false;
    }

    let dataLembrete = (<HTMLInputElement>document.getElementById("dataLembrete")).value;
    let observacoes = this.modalLembretesForm.get('observacoesLembrete').value;
    let checkContagemRegressiva = this.modalAgendarLembretesForm.get('checkContagemRegressiva').value;
    let checkRenovaAUTO = this.modalAgendarLembretesForm.get('checkRenovaAUTO').value;
    let qtdeDiasContagem = this.modalAgendarLembretesForm.get('qtdeDiasContagem').value;
    let checkNotificarDiasSemana = this.modalAgendarLembretesForm.get('checkNotificarDiasSemana').value;
    let checkSeg = this.modalAgendarLembretesForm.get('checkSeg').value;
    let checkTer = this.modalAgendarLembretesForm.get('checkTer').value;
    let checkQua = this.modalAgendarLembretesForm.get('checkQua').value;
    let checkQui = this.modalAgendarLembretesForm.get('checkQui').value;
    let checkSex = this.modalAgendarLembretesForm.get('checkSex').value;
    let checkSab = this.modalAgendarLembretesForm.get('checkSab').value;
    let checkDom = this.modalAgendarLembretesForm.get('checkDom').value;
    let checkNotificarDatas = this.modalAgendarLembretesForm.get('checkNotificarDatas').value;
    let data1 = (<HTMLInputElement>document.getElementById("data1")).value = "";
    let data2 = (<HTMLInputElement>document.getElementById("data2")).value = "";
    let data3 = (<HTMLInputElement>document.getElementById("data3")).value = "";
    let data4 = (<HTMLInputElement>document.getElementById("data4")).value = "";
    let data5 = (<HTMLInputElement>document.getElementById("data5")).value = "";

    /*TODO Definir regras para as datas */

    /*Realiza o parser do objeto para gravacao*/
    this.detalheLembrete = {
      idLembrete: this.idLembreteReferencia,
      idFuncionario: parserToInt(this.sessao.getIdLogin()),
      numeroDias: qtdeDiasContagem,
      dsTituloLembrete: nomeLembrete,
      tpHabilitaNotificacaoDiaria: this.convertBooleanToChar(checkNotificarDiasSemana),
      tpSegunda: this.convertBooleanToChar(checkSeg),
      tpTerca: this.convertBooleanToChar(checkTer),
      tpQuarta: this.convertBooleanToChar(checkQua),
      tpQuinta: this.convertBooleanToChar(checkQui),
      tpSexta: this.convertBooleanToChar(checkSex),
      tpSabado: this.convertBooleanToChar(checkSab),
      tpDomingo: this.convertBooleanToChar(checkDom),
      tpContagemRegressiva: this.convertBooleanToChar(checkContagemRegressiva),
      tpRenovarAuto: this.convertBooleanToChar(checkRenovaAUTO),
      dataInicial: dataLembrete,
      dsObservacoes: observacoes,
      tpLembreteDatado: this.convertBooleanToChar(checkNotificarDatas),
      data1: data1,
      data2: data2,
      data3: data3,
      data4: data4,
      data5: data5
    }

    return true;
  }

  aplicarAgendamentoLembrete() {
    let request = this.detalheLembrete;

    request.tpHabilitaNotificacaoDiaria = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkNotificarDiasSemana').value);
    request.tpSegunda = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkSeg').value);
    request.tpTerca = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkTer').value);
    request.tpQuarta = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkQua').value);
    request.tpQuinta = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkQui').value);
    request.tpSexta = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkSex').value);
    request.tpSabado = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkSab').value);
    request.tpDomingo = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkDom').value);
    request.tpContagemRegressiva = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkContagemRegressiva').value);
    request.numeroDias = parserToInt(this.modalAgendarLembretesForm.get('qtdeDiasContagem').value);
    request.tpRenovarAuto = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkRenovaAUTO').value);
    request.dataInicial = (<HTMLInputElement>document.getElementById("dataLembrete")).value;
    request.tpLembreteDatado = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkNotificarDatas').value);
    request.data1 = (<HTMLInputElement>document.getElementById("data1")).value;
    request.data2 = (<HTMLInputElement>document.getElementById("data2")).value;
    request.data3 = (<HTMLInputElement>document.getElementById("data3")).value;
    request.data4 = (<HTMLInputElement>document.getElementById("data4")).value;
    request.data5 = (<HTMLInputElement>document.getElementById("data5")).value;
  }

  obterNovoLembreteObjeto(idLembrete: number) {
    let novoLembrete: DetalheLembrete = {
      idLembrete: idLembrete,
      idFuncionario: null,
      numeroDias: null,
      dsTituloLembrete: null,
      tpHabilitaNotificacaoDiaria: 'N',
      tpSegunda: 'N',
      tpTerca: 'N',
      tpQuarta: 'N',
      tpQuinta: 'N',
      tpSexta: 'N',
      tpSabado: 'N',
      tpDomingo: 'N',
      tpContagemRegressiva: 'N',
      tpLembreteDatado: 'N',
      tpRenovarAuto: 'N',
      dataInicial: null,
      dsObservacoes: null,
      data1: null,
      data2: null,
      data3: null,
      data4: null,
      data5: null,
      checked: false,
      changeValues: true
    }

    return novoLembrete;
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarDetalhesLembrete': {
        this.confirmGravarDetalhesLembrete();
        break;
      }
    }
  }

  confirmGravarDetalhesLembrete() {
    /*let tituloLembrete = this.despesaParceladaDetalhe.despesas;

    this.service.gravarDespesa(despesa).toPromise().then(() => {
      this.service.gravarParcelas(parcelas).toPromise().then(() => { },
        err => {
          alert('Ocorreu um erro ao gravar as parcelas, tente novamente mais tarde.');
          console.log(err);
        });

      alert('Gravação realizada com sucesso!');
      this.recarregarDetalheDespesa();
    });
*/
    this.closeModal();
  }

  confirmBaixarNotificacao() {
    let lembretes = this.getMonitorLembretesChecked();
    let tipoBaixa = ""

    if ((<HTMLInputElement>document.getElementById("radioAdiarMes")).checked) {
      tipoBaixa = "mes"
    } else if ((<HTMLInputElement>document.getElementById("radioAdiarSemana")).checked) {
      tipoBaixa = "semana"
    } else if ((<HTMLInputElement>document.getElementById("radioAdiarAno")).checked) {
      tipoBaixa = "ano"
    } else {
      tipoBaixa = "baixar"
    }

    this.service.baixarLembreteMonitor(tipoBaixa, lembretes).toPromise().then(() => {
      this.closeModal();
      this.carregarMonitorLembretes(false);
    });
  }

  /* -------------- Metodos Gerais -------------- */
  convertBooleanToChar(value): string {
    return (value ? "S" : "N");
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  getDataAtual() {
    return formatDate(Date.now(), 'dd/MM/yyyy', 'en-US');
  }

  getMesAtual() {
    return formatDate(Date.now(), 'MM', 'en-US');
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
