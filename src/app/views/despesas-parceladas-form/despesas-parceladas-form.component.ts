import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, formatDate } from 'ngx-bootstrap';
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
  private despesaParceladaDetalhe: DespesaParceladaResponse;
  private tituloDespesasParceladas: TituloDespesaResponse;
  private _parcelasCheckbox = new BehaviorSubject<Parcelas[]>([]);
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
    this.loadFormDespesaParcelada();

    this.service.recebeMensagem().subscribe(d => {
      this.loadFormDespesaParcelada();
      this.carregarListaDespesasParceladas(true);
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    })
  }

  loadFormDespesaParcelada() {
    this.idDespesaReferencia = -1;
    this.despesaParceladaDetalhe = null;
    this.checkboxesMarcadas = false;
    this.resetParcelasCheckbox();

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
      (<HTMLInputElement>document.getElementById("vigenciaFinal")).value = formatDate(vigenciaIni, 'MM/YYYY');
    }
  }

  onValorDespesaChange() {
    let campo = document.getElementById("valorDespesa");

    campo.onblur = () => {
      var valorDespesa = parseFloat(formatRealNumber((document.getElementById("valorDespesa") as HTMLInputElement).value));
      var qtdeParcelas = parseInt((document.getElementById("parcelas") as HTMLInputElement).value);

      var calculo = (valorDespesa / qtdeParcelas);
      (<HTMLInputElement>document.getElementById("valorParcela")).value = calculo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
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
    const nomeDespesa = this.modalDespesasParceladasForm.get('nomeDespesa').value;
    const mesVig = this.modalDespesasParceladasForm.get('cbMesVigencia').value;
    const anoVig = this.modalDespesasParceladasForm.get('cbAnoVigencia').value;
    const vigenciaFinal = (<HTMLInputElement>document.getElementById("vigenciaFinal")).value;
    const parcelas = (<HTMLInputElement>document.getElementById("parcelas")).value;
    const valorDespesa = formatRealNumber((<HTMLInputElement>document.getElementById("valorDespesa")).value);
    const valorParcela = formatRealNumber((<HTMLInputElement>document.getElementById("valorParcela")).value);

    if ("" == nomeDespesa || "" == mesVig || "" == anoVig || "" == parcelas || "0,00" == valorDespesa || "0,00" == valorParcela) {
      return false;
    }

    if (bValidaListaParcelas) {
      if (null == this.despesaParceladaDetalhe) {
        return false;
      }

      const despesaRequest = this.despesaParceladaDetalhe.despesas;

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
    const despesaSelecionada = this.idDespesaReferencia;

    if (despesaSelecionada <= 0) {
      alert('Necessário selecionar uma despesa para pesquisar.')
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
    });
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarDespesaParcelada': {
        this.confirmGravarDespesa();
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
    const parcelas = this.getParcelasChecked();

    parcelas.forEach((parcela) => {
      this.service.excluirParcela(parcela.idDespesaParcelada, parcela.idParcela).toPromise().then(() => {
        this.recarregarDetalheDespesa();
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
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

    const despesa = (this.despesaParceladaDetalhe ? this.despesaParceladaDetalhe.idDespesaParcelada : -1);
    const parcelas = parserToInt((<HTMLInputElement>document.getElementById("parcelas")).value);
    const valorParcela = formatRealNumber((<HTMLInputElement>document.getElementById("valorParcela")).value);
    const dataReferencia = (this.modalDespesasParceladasForm.get('cbMesVigencia').value + "-" + this.modalDespesasParceladasForm.get('cbAnoVigencia').value);

    this.service.gerarFluxoParcelas(despesa, valorParcela, parcelas, dataReferencia).subscribe((res) => {
      this.despesaParceladaDetalhe = res
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
    const despesa = this.despesaParceladaDetalhe.idDespesaParcelada;
    //const nomeDespesa = this.despesaParceladaDetalhe.despesas.dsTituloDespesaParcelada.toString();
    //(<HTMLInputElement>document.getElementById("comboTituloDespesa")).value = nomeDespesa;

    this.carregarListaDespesasParceladas(true);
    this.carregarDetalheDespesaParceladaService(despesa);
  }

  carregarListaDespesasParceladas(isTodasDespesas: boolean) {
    this.tituloDespesasParceladas = null;

    this.service.getNomeDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParceladas = res;
    });
  }

  onCheckCarregarNomeDespParceladas(checked) {
    this.carregarListaDespesasParceladas(checked);
  }

  onChangeTituloDespesa(value) {
    this.idDespesaReferencia = value;
  }

  onMarcarDesmarcarCheckBoxes() {
    const checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.onChangeCheckBoxesParcelas(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
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


  confirmGravarDespesa() {
    let despesaRequest = this.despesaParceladaDetalhe;

    this.service.gravarDespesa(despesaRequest.despesas).toPromise().then(() => {
      despesaRequest.parcelas.forEach((p) => {
        this.service.gravarParcelas(p).toPromise().then(() => { },
          err => {
            alert('Ocorreu um erro ao gravar a parcela ' + p.nrParcela);
            console.log(err);
          });
      })

      alert('Gravação realizada com sucesso!');
      this.recarregarDetalheDespesa();
    });

    this.closeModal();
  }

  confirmExcluirDespesa() {
    this.service.excluirDespesa(this.idDespesaReferencia).toPromise().then(() => {
      this.loadFormDespesaParcelada()
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

    const parcelas = this._parcelasCheckbox.getValue();
    const index = parcelas.findIndex((d) => d.idParcela === parcela.idParcela);

    if (index >= 0) {
      parcelas[index].checked = checked;
    } else {
      parcelas.push({ ...parcela });
    }

    this._parcelasCheckbox.next(parcelas);
  }

  onChangeCheckBoxesParcelas(checked: boolean) {
    this.resetParcelasCheckbox();
    const parcelasChecked = this._parcelasCheckbox.getValue();

    this.despesaParceladaDetalhe.parcelas.forEach(parcela => {
      parcela.checked = checked;
      parcelasChecked.push({ ...parcela });
    });

    this._parcelasCheckbox.next(parcelasChecked);
  }

  getParcelasChecked() {
    return this._parcelasCheckbox.getValue().filter((d) => d.checked === true);
  }

  resetParcelasCheckbox() {
    this._parcelasCheckbox.next([]);
  }

  /* -------------- Metodos Gerais -------------- */
  closeModal(): void {
    this.modalRef.hide();
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
