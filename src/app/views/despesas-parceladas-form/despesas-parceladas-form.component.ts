import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DespesaParceladaResponse, Parcelas } from 'src/app/core/interfaces/despesa-parcelada-response.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-despesas-parceladas-form',
  templateUrl: './despesas-parceladas-form.component.html',
  styleUrls: ['./despesas-parceladas-form.component.css']
})
export class DespesasParceladasFormComponent implements OnInit {
  private _parcelas = new BehaviorSubject<Parcelas[]>([]);
  private despesaParceladaDetalhe: DespesaParceladaResponse;
  private tituloDespesasParceladas: TituloDespesaResponse;
  private idDespesaReferencia: number = 0;

  private modalDespesasParceladasForm: FormGroup;
  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  private subTotalDespesasEmAberto: String = "0,00";
  private checkboxesMarcadas: Boolean = false;

  @ViewChild('modalDespesasParceladas') modalDespesasParceladas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private service: DespesasParceladasService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.loadFormDespesaParcelada(null);

    this.service.recebeMensagem().subscribe(despesa => {
      this.loadFormDespesaParcelada(despesa);
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    })
  }

  loadFormDespesaParcelada(objDetalheDespesa) {
    this.idDespesaReferencia = -1;
    this.despesaParceladaDetalhe = null;
    this.checkboxesMarcadas = false;
    this.resetParcelasObservable();

    this.tituloDespesasParceladas = {
      despesas: []
    }

    this.modalDespesasParceladasForm = this.formBuilder.group({
      checkCarregarDespesasPendente: [true],
      checkMarcarTodasParcelas: [false],
      nomeDespesa: [''],
      cbMesVigencia: [this.service.getMesAtual()],
      cbAnoVigencia: [this.service.getAnoAtual()],
      vigenciaFinal: ['']
    });

    (<HTMLInputElement>document.getElementById("parcelaAtual")).value = "0/0";
    (<HTMLInputElement>document.getElementById("parcelas")).value = "";
    (<HTMLInputElement>document.getElementById("valorDespesa")).value = "0,00";
    (<HTMLInputElement>document.getElementById("valorParcela")).value = "0,00";

    this.onQuantidadeParcelasChange();
    this.onValorDespesaChange();

    (<HTMLInputElement>document.getElementById("valorTotalDespesaComDesconto")).value = "";

    this.service.obterSubTotalDespesasEmAberto().subscribe((res) => {
      this.subTotalDespesasEmAberto = formatRealNumber(res.vlCalculo);
    });

    this.carregarListaDespesasParceladas(true);

    if (null != objDetalheDespesa) {
      this.onChangeTituloDespesa(objDetalheDespesa.idDespesaParcelada);
    }

    setarFocoCampo("nomeDespesa");
  }

  onQuantidadeParcelasChange() {
    let campo = document.getElementById("parcelas");

    campo.onblur = () => {
      if (!this.validarVigenciaInicial()) {
        alert('Favor selecionar o periodo da vigencia inicial.');
        (<HTMLInputElement>document.getElementById("parcelas")).value = "";
        return;
      }

      var vigenciaIni = parseDate("01/" + this.modalDespesasParceladasForm.get('cbMesVigencia').value + "/" + this.modalDespesasParceladasForm.get('cbAnoVigencia').value);

      //Capturar Quantidade de meses
      var meses = parseInt((<HTMLInputElement>document.getElementById("parcelas")).value);

      //Adicionar meses 
      vigenciaIni.setMonth(vigenciaIni.getMonth() + (meses - 1));

      //Exibir nova data
      (<HTMLInputElement>document.getElementById("vigenciaFinal")).value = formatDate(vigenciaIni, 'MM/yyyy', 'en-US');
    }
  }

  carregarEditorParcelas() {
    (<HTMLInputElement>document.getElementById("novoValorParcela")).value = (<HTMLInputElement>document.getElementById("valorParcela")).value.trim();
    (<HTMLInputElement>document.getElementById("comboStatus")).value = "";
    (<HTMLInputElement>document.getElementById("observacoes")).value = "";
  }

  confirmEditarParcelas() {
    let parcelas = this.getParcelasChecked();

    if (parcelas.length == 0) {
      alert('Necessário selecionar a(s) parcela(s) para editar.');
      return;
    }

    let valorParcela = (<HTMLInputElement>document.getElementById("novoValorParcela")).value.trim();
    let statusParcela = (<HTMLInputElement>document.getElementById("comboStatus")).value;
    let observacoes = (<HTMLInputElement>document.getElementById("observacoesEdicao")).value;

    parcelas.forEach((parcela) => {
      if (valorParcela !== "") {
        parcela.vlParcela = valorParcela;
      }

      if (statusParcela !== "") {
        parcela.tpBaixado = statusParcela;
      }

      if (observacoes !== "") {
        parcela.dsObservacoes = observacoes;
      }

      this.changeParcelas(parcela);
    });
  }

  changeParcelas(parcela: Parcelas) {
    let parcelas = this._parcelas.getValue();
    let index = parcelas.findIndex((p) => p.idDespesa === parcela.idDespesa && p.idParcela === parcela.idParcela);

    parcela.changeValues = true;

    if (index >= 0) {
      parcelas[index] = parcela;
    } else {
      parcelas.push({ ...parcela });
    }

    this._parcelas.next(parcelas);
  }

  resetParcelasObservable() {
    this._parcelas.next([]);
  }

  setParcelasObservable(parcela: Parcelas[], changeDefaultValues: boolean) {
    let parcelas = this._parcelas.getValue();

    parcela.forEach(p => {
      p.changeValues = changeDefaultValues;
      p.isParcelaEmAtraso = this.convertBooleanToChar(this.isValidaParcelaEmAtraso(p));
      parcelas.push({ ...p });
      this._parcelas.next(parcela);
    });
  }

  isValidaParcelaEmAtraso(parcela: Parcelas): Boolean {
    if (parcela.tpBaixado == 'S') {
      return false;
    }

    let anoParcela = parserToInt(parcela.dsDataVencimento.substring(3, 7));
    let anoAtual = parserToInt(this.getAnoAtual());

    if (anoParcela <= anoAtual) {
      return parserToInt(parcela.dsDataVencimento) < parserToInt(this.getDataMesAtual());
    } else {
      return false;
    }
  }

  onValorDespesaChange() {
    let campo = document.getElementById("valorDespesa");

    campo.onblur = () => {
      var valorDespesa = parseFloat(formatRealNumber((document.getElementById("valorDespesa") as HTMLInputElement).value));
      var qtdeParcelas = parseInt((document.getElementById("parcelas") as HTMLInputElement).value);

      var calculo = (valorDespesa / qtdeParcelas);
      (<HTMLInputElement>document.getElementById("valorParcela")).value =
        calculo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }).replace('R$', '');
    }
  }

  validarVigenciaInicial() {
    if (this.modalDespesasParceladasForm.get('cbMesVigencia').value == "" || this.modalDespesasParceladasForm.get('cbAnoVigencia').value == "") {
      return false;
    } else {
      return true;
    }
  }

  onGerarFluxoParcelas() {
    if (!this.validarCamposObrigatorios(false)) {
      alert('Necessário preencher os campos para gerar o fluxo de parcelas.')
      return;
    }

    this.eventModalConfirmacao = "GerarFluxoParcelas";
    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Confirma a geração das parcelas para esta despesa?"
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  validarCamposObrigatorios(bValidaListaParcelas: boolean): boolean {
    let nomeDespesa = this.modalDespesasParceladasForm.get('nomeDespesa').value;
    let mesVig = this.modalDespesasParceladasForm.get('cbMesVigencia').value;
    let anoVig = this.modalDespesasParceladasForm.get('cbAnoVigencia').value;
    let vigenciaFinal = (<HTMLInputElement>document.getElementById("vigenciaFinal")).value;
    let parcelas = (<HTMLInputElement>document.getElementById("parcelas")).value;
    let valorDespesa = formatRealNumber((<HTMLInputElement>document.getElementById("valorDespesa")).value);
    let valorParcela = formatRealNumber((<HTMLInputElement>document.getElementById("valorParcela")).value);

    if ("" == nomeDespesa || "" == mesVig || "" == anoVig || "" == parcelas || "0,00" == valorDespesa || "0,00" == valorParcela) {
      return false;
    }

    if (bValidaListaParcelas) {
      if (null == this.despesaParceladaDetalhe) {
        return false;
      }

      let despesaRequest = this.despesaParceladaDetalhe.despesas;

      /*Realiza o parser do objeto para gravacao*/
      this.despesaParceladaDetalhe.despesas = {
        idDespesaParcelada: this.despesaParceladaDetalhe.idDespesaParcelada,
        dsTituloDespesaParcelada: nomeDespesa,
        dsMesVigIni: mesVig,
        dsAnoVigIni: anoVig,
        dsVigenciaFin: vigenciaFinal,
        nrTotalParcelas: parserToInt(parcelas),
        vlFatura: valorDespesa,
        vlParcela: valorParcela,
        idFuncionario: parserToInt(this.sessao.getIdLogin()),
        nrParcelasAdiantadas: (null == despesaRequest ? 0 : despesaRequest.nrParcelasAdiantadas),
        tpBaixado: (null == despesaRequest ? "N" : despesaRequest.tpBaixado)
      }
    }

    return true;
  }

  carregarDetalheDespesaParcelada() {
    let despesaSelecionada = this.idDespesaReferencia;

    if (despesaSelecionada <= 0) {
      alert('Necessário selecionar uma despesa para pesquisar.');
      return;
    }

    this.carregarDetalheDespesaParceladaService(despesaSelecionada);
  }

  carregarDetalheDespesaParceladaService(despesa: number) {
    this.service.getDetalhesDespesaParcelada(despesa).subscribe((res) => {
      this.despesaParceladaDetalhe = res;

      this.modalDespesasParceladasForm = this.formBuilder.group({
        nomeDespesa: res.despesas.dsTituloDespesaParcelada,
        cbMesVigencia: res.despesas.dsMesVigIni,
        cbAnoVigencia: res.despesas.dsAnoVigIni,
        parcelas: res.despesas.nrTotalParcelas,
        vigenciaFinal: res.despesas.dsVigenciaFin,
        valorDespesa: res.valorTotalDespesa,
        valorParcela: res.valorParcelaAtual
      });

      (<HTMLInputElement>document.getElementById("parcelaAtual")).value = res.parcelaAtual.toString();
      (<HTMLInputElement>document.getElementById("parcelas")).value = res.despesas.nrTotalParcelas.toString();
      (<HTMLInputElement>document.getElementById("valorDespesa")).value = res.valorTotalDespesa.toString();
      (<HTMLInputElement>document.getElementById("valorParcela")).value = res.valorParcelaAtual.toString();

      this.resetParcelasObservable();
      this.setParcelasObservable(res.parcelas, false);
    });
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarDespesaParcelada': {
        this.confirmGravarDespesa();
        break;
      }
      case 'ReativarDespesaParcelada': {
        this.confirmReativarDespesa();
        break;
      }
      case 'GerarFluxoParcelas': {
        this.confirmGerarFluxoParcelas();
        break;
      }
      case 'ExcluirDespesa': {
        this.confirmExcluirDespesa();
        break;
      }
      case 'ExcluirParcelasSelecionadas': {
        this.confirmExcluirParcela();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  confirmExcluirParcela() {
    let parcelas = this.getParcelasChecked();

    this.service.excluirParcela(parcelas).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  carregarModalQuitarDespesa() {
    (<HTMLInputElement>document.getElementById("valorTotalDespesaComDesconto")).value =
      formatRealNumber(this.despesaParceladaDetalhe.valorTotalDespesaPendente.toString());
  }

  onCheckParcelaAmortizadaChange(checked, parcela) {
    parcela.tpParcelaAmortizada = (checked ? 'S' : 'N');
    this.changeParcelas(parcela);
  }

  confirmQuitarDespesa() {
    if (this.idDespesaReferencia == -1) {
      alert('Necessário selecionar uma despesa para quitar.');
      return;
    }

    let valorDespesaComDesconto = (<HTMLInputElement>document.getElementById("valorTotalDespesaComDesconto")).value;
    if (valorDespesaComDesconto == "") {
      valorDespesaComDesconto = (<HTMLInputElement>document.getElementById("valorDespesa")).value;
    }

    this.service.quitarDespesa(this.idDespesaReferencia, formatRealNumber(valorDespesaComDesconto)).toPromise().then(() => {
      this.recarregarDetalheDespesa();
      alert('Baixa realizada com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  confirmGerarFluxoParcelas() {
    this.closeModal();

    let despesa = (this.despesaParceladaDetalhe ? this.despesaParceladaDetalhe.idDespesaParcelada : -1);
    let parcelas = parserToInt((<HTMLInputElement>document.getElementById("parcelas")).value);
    let valorParcela = formatRealNumber((<HTMLInputElement>document.getElementById("valorParcela")).value);
    let dataReferencia = (this.modalDespesasParceladasForm.get('cbMesVigencia').value + "-" + this.modalDespesasParceladasForm.get('cbAnoVigencia').value);

    this.service.gerarFluxoParcelas(despesa, valorParcela, parcelas, dataReferencia).subscribe((res) => {
      this.despesaParceladaDetalhe = res;
      this.setParcelasObservable(res.parcelas, true);
    },
      err => {
        console.log(err);
        alert('Ocorreu um erro ao gerar o fluxo de parcelas, tente novamente mais tarde.')
      });
  }

  excluirDespesaParcelada() {
    this.eventModalConfirmacao = "ExcluirDespesa";
    this.mensagemModalConfirmacao_header = "Deseja excluir esta despesa parcelada?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Este processo exclui todos os lançamentos mensais processados!";

    if (null == this.despesaParceladaDetalhe) {
      alert('Necessário selecionar uma despesa para excluir.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  excluirParcelasSelecionadas() {
    this.eventModalConfirmacao = "ExcluirParcelasSelecionadas";
    this.mensagemModalConfirmacao_header = "Deseja excluir a(s) parcela(s) selecionada(s)?";
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Atenção: a(s) parcela(s) importadas e processadas na despesa mensal serão excluidas*";

    if (null == this.despesaParceladaDetalhe) {
      alert('Necessário selecionar uma despesa para excluir.')
      return;
    }

    if (this.getParcelasChecked().length == 0) {
      alert('Necessario selecionar a(s) parcela(s) para serem excluidas.');
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheDespesa() {
    let despesa = this.despesaParceladaDetalhe.idDespesaParcelada;
    //let nomeDespesa = this.despesaParceladaDetalhe.despesas.dsTituloDespesaParcelada.toString();
    //(<HTMLInputElement>document.getElementById("comboTituloDespesa")).value = nomeDespesa;

    this.carregarListaDespesasParceladas(true);
    this.carregarDetalheDespesaParceladaService(despesa);
  }

  carregarListaDespesasParceladas(isTodasDespesas: boolean) {
    this.service.getNomeDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParceladas = res;
    });
  }

  onCheckCarregarNomeDespParceladas(checked) {
    this.carregarListaDespesasParceladas(checked);
  }

  onChangeTituloDespesa(value) {
    this.idDespesaReferencia = value;
    this.carregarDetalheDespesaParcelada();
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.onChangeAllCheckBoxesParcelas(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  reativarDespesaParcelada() {
    this.eventModalConfirmacao = "ReativarDespesaParcelada";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja reativar esta despesa ?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  gravarDespesaParcelada() {
    if (!this.validarCamposObrigatorios(true)) {
      if (null == this.despesaParceladaDetalhe) {
        alert('Necessário gerar as parcelas para depois salvar a despesa.')
      } else {
        alert('Necessário preencher todos os campos para salvar a despesa.')
      }

      return;
    }

    this.eventModalConfirmacao = "GravarDespesaParcelada";

    this.mensagemModalConfirmacao_header = "null";
    this.mensagemModalConfirmacao_body = "Deseja salvar as alterações ?";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }


  confirmReativarDespesa() {
    let despesa = this.despesaParceladaDetalhe.despesas;
    despesa.tpBaixado = 'N'

    this.service.gravarDespesa(despesa).toPromise().then(() => {
      alert('Despesa reativada com sucesso!');
      this.recarregarDetalheDespesa();
    });

    this.closeModal();
  }

  confirmGravarDespesa() {
    let despesa = this.despesaParceladaDetalhe.despesas;
    let parcelas = this.getParcelasChange();

    this.service.gravarDespesa(despesa).toPromise().then(() => {
      this.service.gravarParcelas(parcelas).toPromise().then(() => { },
        err => {
          alert('Ocorreu um erro ao gravar as parcelas, tente novamente mais tarde.');
          console.log(err);
        });

      alert('Gravação realizada com sucesso!');
      this.recarregarDetalheDespesa();
    });

    this.closeModal();
  }

  confirmExcluirDespesa() {
    this.service.excluirDespesa(this.idDespesaReferencia).toPromise().then(() => {
      this.loadFormDespesaParcelada(null);
      alert('Despesa excluida com sucesso!');
    },
      err => {
        alert('Ocorreu um erro ao excluir esta despesa, tente novamente mais tarde.');
        console.log(err);
      });

    this.closeModal();
  }

  onCheckParcelaChange(checked, parcela) {
    parcela.checked = checked;

    let parcelas = this._parcelas.getValue();
    let index = parcelas.findIndex((d) => d.idParcela === parcela.idParcela);

    if (index >= 0) {
      parcelas[index].checked = checked;
    } else {
      parcelas.push({ ...parcela });
    }

    this._parcelas.next(parcelas);
  }

  onChangeAllCheckBoxesParcelas(checked: boolean) {
    this.despesaParceladaDetalhe.parcelas.forEach(parcela => {
      this.onCheckParcelaChange(checked, parcela);
    });
  }

  getParcelasChecked() {
    return this._parcelas.getValue().filter((d) => d.checked === true);
  }

  getParcelasChange() {
    return this._parcelas.getValue().filter((d) => d.changeValues === true);
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

async function setarFocoCampo(inputName: string) {
  await aguardarTempo(500); // Aguarda 1/2 segundo
  const campoInput = document.getElementById(inputName) as HTMLInputElement;

  // Define o foco no campo
  campoInput.focus();
}

async function aguardarTempo(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}