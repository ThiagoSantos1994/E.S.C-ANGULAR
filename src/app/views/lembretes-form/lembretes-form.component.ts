import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { TipoMensagem } from 'src/app/core/enums/tipo-mensagem-enums';
import { DetalheLembrete } from 'src/app/core/interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from 'src/app/core/interfaces/titulo-lembretes.interface';
import { HomeService } from 'src/app/core/services/home.service';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { MensagemService } from 'src/app/core/services/mensagem.service';
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
  private idLembreteReferencia: number = -1;
  private checkboxesMarcadas: Boolean = false;

  private dataInicialReferencia: string;
  private dataReferencia1: string;
  private dataReferencia2: string;
  private dataReferencia3: string;
  private dataReferencia4: string;
  private dataReferencia5: string;

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
    private homeService: HomeService,
    private mensagens: MensagemService
  ) { }

  ngOnInit() {
    this.loadFormLembretes();
    this.carregarMonitorLembretes(true, false);

    this.service.recebeMensagem().subscribe(tipo => {
      if (tipo == "cadastro") {
        this.modalAgendarLembretesForm.reset;
        this.loadFormLembretes();
        this.carregarListaLembretes(false);
      } else {
        this.carregarMonitorLembretes(true, true);
      }
    }, () => {
      this.mensagens.enviarMensagem("Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.", TipoMensagem.Erro);
    });
  }

  loadFormLembretes() {
    this.idLembreteReferencia = -1;
    this.detalheLembrete = null;
    this.tituloLembretes$ = null;

    this.resetCampos();
    this.desabilitarCampos();
  }

  resetCampos() {
    (<HTMLInputElement>document.getElementById("nomeLembrete")).value = "";
    (<HTMLInputElement>document.getElementById("observacoesLembrete")).value = "";
    this.dataInicialReferencia = this.getDataAtual().toString();
    this.dataReferencia1 = "";
    this.dataReferencia2 = "";
    this.dataReferencia3 = "";
    this.dataReferencia4 = "";
    this.dataReferencia5 = "";

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
      checkNotificarDatasProgramadas: [false]
    });
  }

  desabilitarCampos() {
    (<HTMLInputElement>document.getElementById("buttonExcluir")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonAgendar")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonGravar")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = true;
    (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = true;
    (<HTMLInputElement>document.getElementById("nomeLembrete")).disabled = true;
    (<HTMLInputElement>document.getElementById("observacoesLembrete")).disabled = true;
  }

  habilitarCampos(isNovoLembrete) {
    (<HTMLInputElement>document.getElementById("buttonExcluir")).disabled = false;
    (<HTMLInputElement>document.getElementById("buttonAgendar")).disabled = false;
    (<HTMLInputElement>document.getElementById("buttonGravar")).disabled = false;
    (<HTMLInputElement>document.getElementById("nomeLembrete")).disabled = false;
    (<HTMLInputElement>document.getElementById("observacoesLembrete")).disabled = false;

    if (isNovoLembrete) {
      this.carregarListaLembretes(false);
      this.detalheLembrete = this.obterNovoLembreteObjeto(-1);
      this.resetCampos();
    } else {
      if (this.detalheLembrete.tpBaixado == "S") {
        (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = false;
        (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = true;
      } else {
        (<HTMLInputElement>document.getElementById("buttonReativar")).disabled = true;
        (<HTMLInputElement>document.getElementById("buttonBaixar")).disabled = false;
      }
    }
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

    (<HTMLInputElement>document.getElementById("checkContagemRegressiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkNotificarDatasProgramadas")).disabled = checked;
    //(<HTMLInputElement>document.getElementById("dataLembrete")).disabled = checked;
    //(<HTMLInputElement>document.getElementById("dataLembrete")).value = (checked ? null : this.getDataAtual());
  }

  onCheckContagemRegressiva(checked) {
    (<HTMLInputElement>document.getElementById("qtdeDiasContagem")).disabled = !checked;
    (<HTMLInputElement>document.getElementById("checkRenovaAUTO")).disabled = !checked;

    this.modalAgendarLembretesForm.get('checkRenovaAUTO').setValue(false);
    this.modalAgendarLembretesForm.get('qtdeDiasContagem').setValue(0);
    (<HTMLInputElement>document.getElementById("checkNotificarDiasSemana")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkNotificarDatasProgramadas")).disabled = checked;
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
      res.changeValues = false; //Valor Default
      this.detalheLembrete = res;

      (<HTMLInputElement>document.getElementById("nomeLembrete")).value = res.dsTituloLembrete;
      (<HTMLInputElement>document.getElementById("observacoesLembrete")).value = res.dsObservacoes;
      this.dataInicialReferencia = res.dataInicial;
      this.dataReferencia1 = res.data1;
      this.dataReferencia2 = res.data2;
      this.dataReferencia3 = res.data3;
      this.dataReferencia4 = res.data4;
      this.dataReferencia5 = res.data5;

      this.habilitarCampos(false);
    });
  }

  carregarListaLembretes(isTodosLembretes: boolean) {
    this.resetCampos();
    this.tituloLembretes$ = null;

    this.service.getTituloLembretes(isTodosLembretes).subscribe((res: any) => {
      this.tituloLembretes$ = res;
    });

    (<HTMLInputElement>document.getElementById("checkCarregarLembretesEmAberto")).checked = !isTodosLembretes;
  }

  carregarMonitorLembretes(abrirMonitor: boolean, eventClick: boolean) {
    this.service.getMonitorLembretes().subscribe((res: any) => {
      this.tituloLembretes$ = res;
      if (res.length > 0 || eventClick == true) {
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
      this.mensagens.enviarMensagem("Necessário selecionar um lembrete para realizar a baixa.", TipoMensagem.Generica);
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

  onAbrirModalLembretes(idLembrete) {
    this.closeModal(); //fecha o modal monitor
    this.modalAgendarLembretesForm.reset;

    this.onChangeTituloLembrete(idLembrete);
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
      this.mensagens.enviarMensagem("Necessário preencher o nome do lembrete antes de salvar", TipoMensagem.Generica);
      return;
    }

    this.eventModalConfirmacao = "GravarDetalhesLembrete";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja gravar as alterações ?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  baixarLembrete() {
    this.eventModalConfirmacao = "BaixarLembrete";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja realizar a baixa deste lembrete?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  reativarLembrete() {
    this.eventModalConfirmacao = "ReativarLembrete";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja reativar as notificações deste lembrete?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  excluirLembrete() {
    this.eventModalConfirmacao = "ExcluirLembrete";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja excluir este lembrete?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  validarCamposObrigatorios(): boolean {
    if (this.detalheLembrete.changeValues == false) {
      this.carregarModalAgendamentoLembretes();
    }

    let nomeLembrete = (<HTMLInputElement>document.getElementById("nomeLembrete")).value
    if ("" == nomeLembrete) {
      return false;
    }

    this.dataInicialReferencia = (<HTMLInputElement>document.getElementById("dataLembrete")).value;
    let observacoes = (<HTMLInputElement>document.getElementById("observacoesLembrete")).value;
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
    let checkNotificarDatas = this.modalAgendarLembretesForm.get('checkNotificarDatasProgramadas').value;
    this.dataReferencia1 = (<HTMLInputElement>document.getElementById("data1")).value;
    this.dataReferencia2 = (<HTMLInputElement>document.getElementById("data2")).value;
    this.dataReferencia3 = (<HTMLInputElement>document.getElementById("data3")).value;
    this.dataReferencia4 = (<HTMLInputElement>document.getElementById("data4")).value;
    this.dataReferencia5 = (<HTMLInputElement>document.getElementById("data5")).value;

    /*TODO Definir regras para as datas */

    /*Realiza o parser do objeto para gravacao*/
    this.detalheLembrete = {
      idLembrete: this.idLembreteReferencia,
      idFuncionario: parserToInt(this.sessao.getIdLogin()),
      tpBaixado: "N",
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
      dataInicial: parseDate(this.dataInicialReferencia).toString(),
      dsObservacoes: observacoes,
      tpLembreteDatado: this.convertBooleanToChar(checkNotificarDatas),
      data1: parseDate(this.dataReferencia1).toString(),
      data2: parseDate(this.dataReferencia2).toString(),
      data3: parseDate(this.dataReferencia3).toString(),
      data4: parseDate(this.dataReferencia4).toString(),
      data5: parseDate(this.dataReferencia5).toString()
    }

    return true;
  }

  carregarModalAgendamentoLembretes() {
    let lembrete = this.detalheLembrete;

    let tpContagemRegressiva = (lembrete.tpContagemRegressiva == "S" ? true : false);
    let tpNotificarDiasSemana = (lembrete.tpHabilitaNotificacaoDiaria == "S" ? true : false);
    let tpNotificarDatasProgramadas = (lembrete.tpLembreteDatado == "S" ? true : false);

    if (tpContagemRegressiva) {
      this.onCheckContagemRegressiva(tpContagemRegressiva);
    } else if (tpNotificarDiasSemana) {
      this.onCheckNotificarDiasSemana(tpNotificarDiasSemana);
    } else if (tpNotificarDatasProgramadas) {
      this.onCheckNotificarDatasProgramadas(tpNotificarDatasProgramadas);
      (<HTMLInputElement>document.getElementById("data1")).value = this.dataReferencia1;
      (<HTMLInputElement>document.getElementById("data2")).value = this.dataReferencia2;
      (<HTMLInputElement>document.getElementById("data3")).value = this.dataReferencia3;
      (<HTMLInputElement>document.getElementById("data4")).value = this.dataReferencia4;
      (<HTMLInputElement>document.getElementById("data5")).value = this.dataReferencia5;
    } else {
      this.onCheckContagemRegressiva(false);
      this.onCheckNotificarDiasSemana(false);
      this.onCheckNotificarDatasProgramadas(false);
    }

    this.modalAgendarLembretesForm.setValue({
      checkContagemRegressiva: tpContagemRegressiva,
      checkRenovaAUTO: (lembrete.tpRenovarAuto == "S" ? true : false),
      qtdeDiasContagem: lembrete.numeroDias,
      checkNotificarDiasSemana: tpNotificarDiasSemana,
      checkSeg: (lembrete.tpSegunda == "S" ? true : false),
      checkTer: (lembrete.tpTerca == "S" ? true : false),
      checkQua: (lembrete.tpQuarta == "S" ? true : false),
      checkQui: (lembrete.tpQuinta == "S" ? true : false),
      checkSex: (lembrete.tpSexta == "S" ? true : false),
      checkSab: (lembrete.tpSabado == "S" ? true : false),
      checkDom: (lembrete.tpDomingo == "S" ? true : false),
      checkNotificarDatasProgramadas: tpNotificarDatasProgramadas
    });

    (<HTMLInputElement>document.getElementById("dataLembrete")).value = (lembrete.dataInicial == null ? this.getDataAtual() : this.dataInicialReferencia);
  }

  aplicarAgendamentoLembrete() {
    let request = this.detalheLembrete;

    request.changeValues = true;
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
    this.dataInicialReferencia = (<HTMLInputElement>document.getElementById("dataLembrete")).value;
    request.tpLembreteDatado = this.convertBooleanToChar(this.modalAgendarLembretesForm.get('checkNotificarDatasProgramadas').value);
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
      tpBaixado: 'N',
      numeroDias: 0,
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
      dataInicial: this.getDataAtual(),
      dsObservacoes: '',
      data1: '',
      data2: '',
      data3: '',
      data4: '',
      data5: '',
      checked: false,
      changeValues: false
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
      case 'BaixarLembrete': {
        this.confirmBaixarReativarLembrete(true);
        break;
      }
      case 'ReativarLembrete': {
        this.confirmBaixarReativarLembrete(false);
        break;
      }
      case 'ExcluirLembrete': {
        this.confirmExcluirDetalhesLembrete();
        break;
      }
    }
  }

  confirmBaixarReativarLembrete(tpBaixar: boolean) {
    let request = this.detalheLembrete;
    request.tpBaixado = (tpBaixar ? 'S' : 'N');

    this.service.gravarDetalhesLembrete(request).toPromise().then(() => {
      this.mensagens.enviarMensagem("Lembrete atualizado com sucesso.", TipoMensagem.Sucesso);
      this.carregarDetalheLembrete();
      this.carregarListaLembretes(false);
    });

    this.closeModal;
  }

  confirmExcluirDetalhesLembrete() {
    let request = this.detalheLembrete;

    this.service.excluirDetalhesLembrete(request).toPromise().then(() => {
      this.mensagens.enviarMensagem("Lembrete excluido com sucesso.", TipoMensagem.Sucesso);
      this.carregarListaLembretes(false);
      this.resetCampos();
      this.atualizaStatusLembreteHome();
    },
      err => {
        this.mensagens.enviarMensagem("Ocorreu um erro ao excluir o lembrete, tente novamente mais tarde.", TipoMensagem.Erro);
        console.log(err);
      });

    this.closeModal();
  }

  confirmGravarDetalhesLembrete() {
    let request = this.detalheLembrete;

    this.service.gravarDetalhesLembrete(request).toPromise().then(() => {
      this.mensagens.enviarMensagem("Lembrete gravado com sucesso.", TipoMensagem.Sucesso);
      this.carregarDetalheLembrete();
      this.carregarListaLembretes(false);
      this.atualizaStatusLembreteHome();
    },
      err => {
        this.mensagens.enviarMensagem("Ocorreu um erro ao gravar o lembrete, tente novamente mais tarde.", TipoMensagem.Erro);
        console.log(err);
      });

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
      this.carregarMonitorLembretes(false, true);
      this.atualizaStatusLembreteHome();
    });
  }

  atualizaStatusLembreteHome() {
    this.homeService.enviaMensagem("");
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

  return tmp;
}

function parseDate(texto) {
  if (texto == "" || texto == null) {
    return "";
  }

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
