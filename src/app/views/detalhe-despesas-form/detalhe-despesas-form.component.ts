import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { CategoriaDespesaEnum, StatusPagamentoEnum } from 'src/app/core/enums/detalhe-despesas-enums';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { Parcelas } from 'src/app/core/interfaces/despesa-parcelada-response.interface';
import { DetalheDespesasMensais } from 'src/app/core/interfaces/detalhe-despesas-mensais.interface';
import { DetalheLancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais-detalhe.interface';
import { PagamentoDespesasRequest } from 'src/app/core/interfaces/pagamento-despesas-request.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
import { DetalheDespesasService } from 'src/app/core/services/detalhe-despesas.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-detalhe-despesas-form',
  templateUrl: './detalhe-despesas-form.component.html',
  styleUrls: ['./detalhe-despesas-form.component.css']
})
export class DetalheDespesasFormComponent implements OnInit {
  private _detalheDespesasChange = new BehaviorSubject<DetalheDespesasMensais[]>([]);
  private _parcelasAmortizacaoChange = new BehaviorSubject<Parcelas[]>([]);
  private tituloDespesasParceladas: TituloDespesaResponse;
  private detalheLancamentosMensais: DetalheLancamentosMensais;
  private parcelasAmortizacao: Parcelas[];

  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalCategoriaDetalheDespesaForm: FormGroup;
  private modalDetalheDespesasMensaisForm: FormGroup;
  private modalImportacaoDespesaParceladaForm: FormGroup;
  private checkDespesasForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaRef: number;
  private detalheRef: number;
  private mesRef: string;
  private anoRef: string;
  private mesAnoVisualizacaoTemp: string;
  private nomeDespesa: string
  private tituloDespesaParceladaAmortizacao: string;
  private checkboxesMarcadas: Boolean = false;

  private eventModalConfirmacao: string = "";
  private mensagemModalConfirmacao_header: string = "";
  private mensagemModalConfirmacao_body: string = "";
  private mensagemModalConfirmacao_footer: string = "";

  private eventModalEditarValores: string = "";
  private objectModalEditarValores: any;

  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais;
  @ViewChild('modalConfirmacaoExcluirDespesa') modalConfirmacaoExcluirDespesa;
  @ViewChild('modalConfirmacaoQuitarDespesas') modalConfirmacaoQuitarDespesas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;
  @ViewChild('modalCategoriaDetalheDespesa') modalCategoriaDetalheDespesa;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private detalheService: DetalheDespesasService,
    private despesasParceladasService: DespesasParceladasService,
    private lancamentosService: LancamentosFinanceirosService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.tituloDespesasParceladas = {
      despesas: []
    }

    this.modalConfirmacaoQuitarDespesasForm = this.formBuilder.group({
      observacaoPagamento: ['']
    });

    this.modalDetalheDespesasMensaisForm = this.formBuilder.group({
      nomeDespesa: [''],
      checkLimiteMesAnterior: [''],
      checkReprocessarDespesasNaoParceladas: ['']
    });

    this.modalCategoriaDetalheDespesaForm = this.formBuilder.group({
      checkDespesaRascunho: [''],
      checkDespesaRelatorio: [''],
      checkDespesaDebitoAutomatico: [''],
      checkDespesaDebitoCartao: [''],
      checkDespesaPoupancaPositiva: [''],
      checkDespesaPoupancaNegativa: [''],
      checkDespesaEmprestimoAPagar: [''],
      checkDespesaEmprestimoAReceber: ['']
    });

    this.modalImportacaoDespesaParceladaForm = this.formBuilder.group({
      checkCarregarTodasDespesasParceladas: ['']
    })

    this.checkDespesasForm = this.formBuilder.group({
      checkMarcarTodasDespesas: [false]
    });

    this.detalheService.recebeMensagem().subscribe(d => {
      this.resetCheckBoxMarcarTodos();
      this.modalDetalheDespesasMensaisForm.reset();
      this.modalConfirmacaoQuitarDespesasForm.reset();
      this.modalCategoriaDetalheDespesaForm.reset();
      this.modalImportacaoDespesaParceladaForm.reset();
      this.despesaRef = d.idDespesa;
      this.detalheRef = d.idDetalheDespesa;
      this.mesRef = d.mesPesquisaForm;
      this.anoRef = d.anoPesquisaForm;

      if (null == d.idDetalheDespesa) {
        this.adicionarNovaDespesa();
      } else {
        this.carregarDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdemExibicao);
      }
    }, () => {
      alert('Ocorreu um erro ao carregar os detalhes da despesa, tente novamente mais tarde.')
    })

    this.onEditarValores();
    this.lancamentosService.limparDadosTemporarios().toPromise().then(() => { });
  }

  onQuitarDespesa() {
    let despesas = this.getDetalheDespesasCheckedPagamento();

    if (despesas.length === 0) {
      alert("Necessário marcar alguma despesa para pagar.");
    } else {
      this.modalRef = this.modalService.show(this.modalConfirmacaoQuitarDespesas);

      this.modalConfirmacaoQuitarDespesasForm.setValue({
        observacaoPagamento: 'Pagamento realizado em ' + this.getDataAtual()
      });
    }
  }

  confirmQuitarDespesas() {
    let observacaoPagamento: string = this.modalConfirmacaoQuitarDespesasForm.get('observacaoPagamento').value;
    let detalheDespesas = this.getDetalheDespesasCheckedPagamento();

    detalheDespesas.forEach((d) => {
      let request: PagamentoDespesasRequest = {
        idDespesa: d.idDespesa,
        idDetalheDespesa: d.idDetalheDespesa,
        idDespesaParcelada: d.idDespesaParcelada,
        idParcela: d.idParcela,
        idOrdem: d.idOrdem,
        idFuncionario: d.idFuncionario,
        vlTotal: d.vlTotal,
        vlTotalPago: d.vlTotal,
        tpStatus: d.tpStatus,
        dsObservacoes: (d.dsObservacao == "" ? observacaoPagamento : d.dsObservacao),
        dsObservacoesComplementar: d.dsObservacao2,
        isProcessamentoAdiantamentoParcelas: false
      };

      this.detalheService.processarPagamentoDetalheDespesa(request).toPromise().then(() => {
        d.tpStatus = 'Pago'
        d.vlTotalPago = d.vlTotal;
        d.dsObservacao = (d.dsObservacao.trim() == "" ? observacaoPagamento : d.dsObservacao);

        this.changeDetalheDespesasMensais(d);
      },
        err => {
          console.log(err);
        });
    });
    this.recarregarDetalheDespesa();
    this.closeModal();
  }

  adicionarNovaDespesa() {
    this.resetDetalheDespesasChange();
    this.detalheLancamentosMensais = null;

    this.detalheService.getChaveKey("DETALHEDESPESA").subscribe((res) => {
      let novaDespesa = this.obterNovaDespesaObjeto(res.novaChave);
      // adiciona a nova chave na variavel global para validacao do titulo da despesa
      this.detalheRef = res.novaChave;

      this.carregarFormDetalheDespesasMensais(novaDespesa);

      this.detalheLancamentosMensais = {
        despesaMensal: novaDespesa,
        detalheDespesaMensal: []
      }

      this.detalheLancamentosMensais.detalheDespesaMensal.push(
        this.novaLinhaDetalheDespesa(novaDespesa)
      );

      this.setDetalheDespesaMensalObservable(this.detalheLancamentosMensais.detalheDespesaMensal);
    });
  }

  obterNovaDespesaObjeto(idDetalheDespesa: number) {
    let novaDespesa: DespesaMensal = {
      idDespesa: this.despesaRef,
      idDetalheDespesa: idDetalheDespesa,
      dsTituloDespesa: "",
      dsNomeDespesa: "",
      dsExtratoDespesa: "Para salvar esta despesa, é necessário digitar a Descrição da Despesa e Limite Despesa.",
      vlLimite: "0,00",
      vlLimiteExibicao: "0,00",
      vlTotalDespesa: "0,00",
      idOrdemExibicao: null,
      idFuncionario: Number(this.sessao.getIdLogin()),
      idEmprestimo: null,
      tpReprocessar: 'N',
      tpEmprestimo: 'N',
      tpPoupanca: 'N',
      tpPoupancaNegativa: 'N',
      tpAnotacao: 'N',
      tpDebitoAutomatico: 'N',
      tpMeta: 'N',
      tpLinhaSeparacao: 'N',
      tpDespesaReversa: 'N',
      tpRelatorio: 'N',
      tpDebitoCartao: 'N',
      tpEmprestimoAPagar: 'N',
      tpReferenciaSaldoMesAnterior: 'N',
      tpVisualizacaoTemp: 'N',
      tpDespesaCompartilhada: 'N',
      isNovaDespesa: true
    }

    return novaDespesa;
  }

  visualizarDespesaMesAnterior() {
    this.validarAcaoVisualizacao((this.despesaRef - 1), this.detalheRef);
  }

  visualizarDespesaMesPosterior() {
    this.validarAcaoVisualizacao((this.despesaRef + 1), this.detalheRef);
  }

  validarAcaoVisualizacao(idDespesa: number, idDetalheDespesa: number) {
    this.detalheService.obterMesAnoPorID(idDespesa).subscribe((res) => {
      if ("ERRO" == res.mesAno) {
        this.detalheService.obterMesAnoPorID(idDespesa - 1).subscribe((res) => {
          //Só permite visualizacao antecipada das despesas dentro do mesmo ano referencia.
          var mesReferencia = res.mesAno.substring(2, 0).replace('/', '');
          mesReferencia = parserToInt(mesReferencia) + 1 > 12 ? '12' : mesReferencia;

          this.detalheService.gerarDespesaFuturaVisualizacao(mesReferencia, this.getAnoAtual()).toPromise().then(() => {
            this.carregarDetalheDespesa(idDespesa, idDetalheDespesa, null);
          });

          this.detalheService.obterMesAnoPorID(idDespesa).subscribe((res) => {
            this.mesAnoVisualizacaoTemp = res.mesAno;
          });
          return;
        });
      }

      this.mesAnoVisualizacaoTemp = res.mesAno;
      this.carregarDetalheDespesa(idDespesa, idDetalheDespesa, null);
    });
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarDetalheDespesas': {
        this.confirmGravarDetalheDespesas();
        break;
      }
      case 'DesfazerPagamentoDespesa': {
        this.confirmDesfazerPagamentoDespesa();
        break;
      }
      case 'ExcluirItemDetalheDespesa': {
        this.confirmExcluirItemDetalheDespesa();
        break;
      }
      case 'OrdenarRegistrosDetalheDespesas': {
        this.confirmOrganizarRegistrosDetalheDespesa();
        break;
      }
      case 'ImportacaoDespesaParcelada': {
        this.confirmImportarDespesaParcelada();
        break;
      }
      case 'ImportarLancamentosFinanceiros': {
        this.confirmAtualizarDetalheDespesas();
        break;
      }
      case 'AdiantarFluxoParcelas': {
        this.confirmAdiantarFluxoParcelas();
        break;
      }
      case 'DesfazerAdiantamentoFluxoParcelas': {
        this.confirmDesfazerAdiantamentoFluxoParcelas();
        break;
      }
      case 'AlterarTituloDespesa': {
        this.confirmAlterarTituloDespesa();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.resetDetalheDespesasChange();

    this.detalheService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      this.detalheLancamentosMensais = res;
      this.despesaRef = res.despesaMensal.idDespesa;
      this.detalheRef = res.despesaMensal.idDetalheDespesa;
      this.nomeDespesa = res.despesaMensal.dsTituloDespesa;

      if (ordemExibicao == null) {
        this.detalheService.getExtratoDetalheDespesa(idDespesa, idDetalheDespesa).subscribe((res) => {
          if (res.qtDespesas == null) {
            this.detalheLancamentosMensais.despesaMensal.dsExtratoDespesa = "Visualização temporaria de lançamentos - Mês Referência: ".concat(this.mesAnoVisualizacaoTemp);
          }
        });
      }

      this.setDetalheDespesaMensalObservable(res.detalheDespesaMensal);
      this.carregarFormDetalheDespesasMensais(res.despesaMensal);
    });
  }

  carregarFormDetalheDespesasMensais(despesa: DespesaMensal) {
    (<HTMLInputElement>document.getElementById("valorLimiteDespesa")).value = despesa.vlLimiteExibicao;

    this.modalDetalheDespesasMensaisForm.setValue({
      nomeDespesa: (despesa.dsNomeDespesa),
      checkLimiteMesAnterior: (despesa.tpReferenciaSaldoMesAnterior == "S" ? true : false),
      checkReprocessarDespesasNaoParceladas: (despesa.tpReprocessar == "S" ? true : false)
    });
  }

  setDetalheDespesaMensalObservable(despesa: DetalheDespesasMensais[]) {
    let detalheDespesa = this._detalheDespesasChange.getValue();

    despesa.forEach(d => {
      detalheDespesa.push({ ...d });
      this._detalheDespesasChange.next(detalheDespesa);
    });
  }

  setParcelasAmortizacaoObservable(parcela: Parcelas[]) {
    let parcelaAmortizacao = this._parcelasAmortizacaoChange.getValue();

    parcela.forEach(d => {
      parcelaAmortizacao.push({ ...d });
      this._parcelasAmortizacaoChange.next(parcelaAmortizacao);
    });
  }

  excluirItemDetalheDespesa() {
    this.eventModalConfirmacao = "ExcluirItemDetalheDespesa";
    this.mensagemModalConfirmacao_header = "Deseja excluir o(s) iten(s) selecionada(s) ?"
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    if (this.getDetalheDespesasChecked().length == 0) {
      alert('Necessário selecionar alguma despesa para excluir.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheDespesa() {
    this.resetCheckBoxMarcarTodos();

    let despesa = this.detalheDomain.getDespesaMensal();
    this.carregarDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao);
    this.lancamentosService.enviaMensagem();
  }

  resetCheckBoxMarcarTodos() {
    this.checkDespesasForm = this.formBuilder.group({
      checkMarcarTodasDespesas: [false]
    });
  }

  confirmGravarDespesaParceladaAmortizacao() {
    let parcelasAmortz = this.getParcelasAmortizacaoChecked();

    this.detalheService.incluirDespesaParceladaAmortizacao(this.despesaRef, this.detalheRef, parcelasAmortz).toPromise().then(() => {
      this.resetParcelasAmortizacaoChange();
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  aplicarCategoriaDespesa() {
    let request = this.detalheLancamentosMensais.despesaMensal;

    request.tpAnotacao = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaRascunho').value == true ? "S" : "N");
    request.tpRelatorio = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaRelatorio').value == true ? "S" : "N");
    request.tpDebitoAutomatico = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaDebitoAutomatico').value == true ? "S" : "N");
    request.tpDebitoCartao = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaDebitoCartao').value == true ? "S" : "N");
    request.tpPoupanca = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaPoupancaPositiva').value == true ? "S" : "N");
    request.tpPoupancaNegativa = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaPoupancaNegativa').value == true ? "S" : "N");
    request.tpEmprestimo = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaEmprestimoAReceber').value == true ? "S" : "N");
    request.tpEmprestimoAPagar = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaEmprestimoAPagar').value == true ? "S" : "N");
  }

  carregarCategoriaDetalheDespesa() {
    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.modalCategoriaDetalheDespesaForm.setValue({
      checkDespesaRascunho: (detalheDespesa.tpAnotacao == "S" ? true : false),
      checkDespesaRelatorio: (detalheDespesa.tpRelatorio == "S" ? true : false),
      checkDespesaDebitoAutomatico: (detalheDespesa.tpDebitoAutomatico == "S" ? true : false),
      checkDespesaDebitoCartao: (detalheDespesa.tpDebitoCartao == "S" ? true : false),
      checkDespesaPoupancaPositiva: (detalheDespesa.tpPoupanca == "S" ? true : false),
      checkDespesaPoupancaNegativa: (detalheDespesa.tpPoupancaNegativa == "S" ? true : false),
      checkDespesaEmprestimoAPagar: (detalheDespesa.tpEmprestimo == "S" ? true : false),
      checkDespesaEmprestimoAReceber: (detalheDespesa.tpEmprestimoAPagar == "S" ? true : false)
    });
  }

  carregarListaDespesasParceladasImportacao(isTodasDespesas: boolean) {
    this.detalheService.getTituloDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParceladas = res;
    });
  }

  onImportarDespesaParcelada() {
    if ((document.getElementById("comboTituloDespesaParcelada") as HTMLInputElement).value == "") {
      alert('Necessário selecionar alguma despesa para importação.');
      return;
    }

    this.eventModalConfirmacao = "ImportacaoDespesaParcelada";
    this.mensagemModalConfirmacao_header = "Deseja importar esta despesa parcelada ?"
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  onCheckCarregarTodasDespParceladas(checked) {
    this.carregarListaDespesasParceladasImportacao(checked);
  }

  onCheckDetalheDespesaChange(checked, detalhe) {
    detalhe.checked = checked;
    this.changeDetalheDespesasMensais(detalhe);
  }

  onCheckParcelaAmortizacaoChange(checked, detalhe) {
    detalhe.checked = checked;
    this.changeParcelasAmortizacao(detalhe);
  }

  onCheckDespesaReprocessarChange(checked, detalhe) {
    detalhe.tpReprocessar = (checked ? 'S' : 'N');
    this.changeDetalheDespesasMensais(detalhe);
  }

  onCheckDespesaAnotacao(checked, detalhe) {
    detalhe.tpAnotacao = (checked ? 'S' : 'N');
    this.changeDetalheDespesasMensais(detalhe);
  }

  onCheckDespesaRelatorioChange(checked, detalhe) {
    detalhe.tpRelatorio = (checked ? 'S' : 'N');
    this.changeDetalheDespesasMensais(detalhe);
  }

  onCheckDespesaLinhaSeparacaoChange(checked, detalhe) {
    detalhe.tpLinhaSeparacao = (checked ? 'S' : 'N');
    this.changeDetalheDespesasMensais(detalhe);
  }

  onChangeCategoriaDetalhe(categoria, detalhe) {
    detalhe.tpCategoriaDespesa = CategoriaDespesaEnum[categoria].replace('_', '\\');
    this.changeDetalheDespesasMensais(detalhe);
  }

  onChangeStatusPagamentoDetalhe(status, detalhe) {
    detalhe.tpStatus = StatusPagamentoEnum[status];
    this.changeDetalheDespesasMensais(detalhe);
  }

  onCheckLimiteMesAnteriorChange(checked) {
    this.detalheLancamentosMensais.despesaMensal.tpReferenciaSaldoMesAnterior = (checked ? 'S' : 'N');
  }

  onCheckReprocessarDespesasNaoParceladas(checked) {
    this.detalheLancamentosMensais.despesaMensal.tpReprocessar = (checked ? 'S' : 'N');
  }

  changeDetalheDespesasMensais(detalhe: DetalheDespesasMensais) {
    let detalheDespesa = this._detalheDespesasChange.getValue();
    let index = detalheDespesa.findIndex((d) => d.idDetalheDespesa === detalhe.idDetalheDespesa && d.idOrdem === detalhe.idOrdem);

    detalhe.changeValues = true;

    if (index >= 0) {
      detalheDespesa[index] = detalhe;
    } else {
      detalheDespesa.push({ ...detalhe });
    }

    this._detalheDespesasChange.next(detalheDespesa);
  }

  changeParcelasAmortizacao(parcela: Parcelas) {
    let parcelaAmortizacao = this._parcelasAmortizacaoChange.getValue();
    let index = parcelaAmortizacao.findIndex((p) => p.idDespesaParcelada === parcela.idDespesaParcelada && p.idParcela === parcela.idParcela);

    if (index >= 0) {
      parcelaAmortizacao[index] = parcela;
    } else {
      parcelaAmortizacao.push({ ...parcela });
    }

    this._parcelasAmortizacaoChange.next(parcelaAmortizacao);
  }

  onChangeDescricaoDespesa(inputText, objeto) {
    objeto.dsDescricao = inputText;
    objeto.dsTituloDespesa = inputText;

    this.changeDetalheDespesasMensais(objeto);
  }

  onChangeObservacoesDespesa(inputText, objeto) {
    objeto.dsObservacao = inputText;
    this.changeDetalheDespesasMensais(objeto);
  }

  onChangeObservacoesComplDespesa(inputText, objeto) {
    objeto.dsObservacao2 = inputText;
    this.changeDetalheDespesasMensais(objeto);
  }

  gravarDetalheDespesas() {
    let despesa = this.detalheLancamentosMensais.despesaMensal;
    despesa.dsNomeDespesa = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    if (despesa.dsNomeDespesa == "") {
      alert('Digite o titulo da despesa.');
      return;
    }

    if (despesa.tpReferenciaSaldoMesAnterior == "N") {
      let valorLimiteDespesa = formatRealNumber((document.getElementById("valorLimiteDespesa") as HTMLInputElement).value);

      if (valorLimiteDespesa == "NaN" || valorLimiteDespesa == "0") {
        alert('Necessário digitar o valor Limite Despesa.');
        return;
      }

      despesa.vlLimite = valorLimiteDespesa;
    }

    this.detalheService.validarDuplicidadeTituloDespesa(this.despesaRef, this.detalheRef, despesa.dsNomeDespesa).subscribe(res => {
      if (res.mensagem !== 'OK') {
        alert(res.mensagem);
        return;
      } else {
        this.eventModalConfirmacao = "GravarDetalheDespesas";
        this.mensagemModalConfirmacao_header = "Deseja salvar as alterações ?"
        this.mensagemModalConfirmacao_body = "null";
        this.mensagemModalConfirmacao_footer = "null";

        this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
      }
    },
      err => {
        alert('Ocorreu um erro ao validar o titulo da despesa, tente novamente mais tarde.');
        console.log(err);
      }
    );
  }

  gravarDespesa(despesa: DespesaMensal) {
    this.detalheService.gravarDespesaMensal(despesa).toPromise().then(() => {
      this.detalheDomain.setDespesaMensal(despesa);
      this.recarregarDetalheDespesa();
      alert('Dados gravados com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  obterDetalhesLabelQuitacaoMes() {
    this.detalheService.obterExtratoDetalheDespesaQuitacaoMes(this.despesaRef, this.detalheRef).toPromise().then((res) => {
      alert('CONSULTA DE DESPESAS Á QUITAR: \r\n \r\nValor R$   -   DESCRIÇÃO \r\n \r\n' + res.relatorioDespesas);
    },
      err => {
        alert('Ocorreu um erro ao obter os dados do extrato de quitação, tente novamente mais tarde.');
      });
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.changeCheckBoxesDetalhe(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  changeCheckBoxesDetalhe(checked: boolean) {
    this.resetDetalheDespesasChange();
    let despesas = this._detalheDespesasChange.getValue();

    this.detalheLancamentosMensais.detalheDespesaMensal.forEach(despesa => {
      despesa.checked = checked;
      despesas.push({ ...despesa });
    });

    this._detalheDespesasChange.next(despesas);
  }

  confirmGravarDetalheDespesas() {
    this.getDetalheDespesasChange().forEach((d) => {
      d.dsDescricao = d.dsTituloDespesa;
      d.vlTotal = d.vlTotal.replace('.', '');
      d.vlTotalPago = d.vlTotalPago.replace('.', '');

      this.detalheService.gravarDetalheDespesa(d).toPromise().then(() => { },
        err => {
          console.log(err);
        }
      );
    })

    this.gravarDespesa(this.detalheLancamentosMensais.despesaMensal);
    this.closeModal();
  }

  validarDuplicidadeTituloDespesa(nomeDespesa: string): Boolean {
    this.detalheService.validarDuplicidadeTituloDespesa(this.despesaRef, this.detalheRef, nomeDespesa).subscribe(res => {
      if (res.mensagem !== 'OK') {
        alert(res.mensagem);
        return false;
      }
    },
      err => {
        console.log(err);
      }
    );

    return true;
  }

  desfazerPagamentoDespesa() {
    this.eventModalConfirmacao = "DesfazerPagamentoDespesa";
    this.mensagemModalConfirmacao_header = "Deseja alterar o status do pagamento da(s) despesa(s) selecionada(s) para PENDENTE ?"
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    if (this.getDetalheDespesasChecked().length == 0) {
      alert('Necessário marcar alguma despesa para alterar o status do pagamento.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmExcluirItemDetalheDespesa() {
    let despesas = this.getDetalheDespesasChecked();

    this.detalheService.excluritemDetalheDespesa(despesas).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  confirmOrganizarRegistrosDetalheDespesa() {
    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.organizarListaItensDetalheDespesa(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa).toPromise().then(() => {
      this.recarregarDetalheDespesa();
      alert('Lista de despesas ordenada com sucesso.');
    },
      err => {
        console.log(err);
      });
  }

  confirmImportarDespesaParcelada() {
    let idDespesaParcelada = +(document.getElementById("comboTituloDespesaParcelada") as HTMLInputElement).value;
    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.processarImportacaoDespesasParceladas(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa, idDespesaParcelada).toPromise().then(() => {
      this.carregarListaDespesasParceladasImportacao(false);
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  confirmDesfazerPagamentoDespesa() {
    let despesas = this.getDetalheDespesasChecked();

    despesas.forEach((d) => {
      d.tpStatus = 'Pendente';
      d.dsObservacao = '';

      this.detalheService.gravarDetalheDespesa(d).toPromise().then(() => {
        this.changeDetalheDespesasMensais(d);
        this.recarregarDetalheDespesa();
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
  }

  atualizarOrdemLinhaDetalheDespesa(acao, objeto) {
    let ordemAtual = objeto.idOrdem;

    let novaOrdem = (acao == "UP" ? (objeto.idOrdem - 1) : (objeto.idOrdem + 1));
    if (novaOrdem <= 0) {
      novaOrdem = 1;
    }

    this.detalheService.atualizarOrdemLinhaDetalheDespesa(objeto.idDespesa, objeto.idDetalheDespesa, ordemAtual, novaOrdem).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  onOrdenarRegistrosDetalheDespesas() {
    this.eventModalConfirmacao = "OrdenarRegistrosDetalheDespesas";
    this.mensagemModalConfirmacao_header = "Deseja organizar os ID's da lista de despesas ?"
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  getDetalheDespesasChecked() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true);
  }

  getDetalheDespesasParceladasChecked() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && d.idDespesaParcelada !== 0 && d.tpLinhaSeparacao == 'N');
  }

  getDetalheDespesasCheckedPagamento() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && d.tpAnotacao == 'N' && d.tpLinhaSeparacao == 'N');
  }

  getDetalheDespesasChange() {
    let resultado = this._detalheDespesasChange.getValue().filter((d) => d.changeValues === true);
    return resultado;
  }

  getParcelasAmortizacaoChecked() {
    return this._parcelasAmortizacaoChange.getValue().filter((d) => d.checked === true && d.idDespesaParcelada !== 0);
  }

  resetDetalheDespesasChange() {
    this._detalheDespesasChange.next([]);
  }

  resetParcelasAmortizacaoChange() {
    this._parcelasAmortizacaoChange.next([]);
    this.parcelasAmortizacao = [];
  }

  novaLinhaDetalheDespesa(detalheDespesa: DetalheDespesasMensais): DetalheDespesasMensais {
    let novoItem: DetalheDespesasMensais = {
      idDespesa: detalheDespesa.idDespesa,
      idDetalheDespesa: detalheDespesa.idDetalheDespesa,
      idFuncionario: Number(this.sessao.getIdLogin()),
      dsDescricao: '',
      dsObservacao: '',
      dsObservacao2: '',
      idOrdem: null, // Somenta para nova linha
      idParcela: 0,
      idDespesaParcelada: 0,
      idDespesaLinkRelatorio: 0,
      vlTotal: '0,00',
      vlTotalPago: '0,00',
      tpMeta: 'N',
      tpStatus: 'Pendente',
      tpReprocessar: 'N',
      tpAnotacao: 'N',
      tpRelatorio: 'N',
      tpLinhaSeparacao: 'N',
      tpParcelaAdiada: 'N',
      tpParcelaAmortizada: 'N',
      changeValues: true
    };

    return novoItem;
  }

  atualizarDetalheDespesasMensais() {
    this.eventModalConfirmacao = "ImportarLancamentosFinanceiros";
    this.mensagemModalConfirmacao_header = "Deseja realizar a importação desta despesas novamente?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Os lançamentos poderão ser atualizados!";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmAtualizarDetalheDespesas() {
    let despesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.reprocessarImportacaoDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, this.mesRef, this.anoRef, (despesa.tpReprocessar == "S" ? true : false)).toPromise().then(() => {
      this.recarregarDetalheDespesa();
      alert('Atualização realizada com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  confirmAdiantarFluxoParcelas() {
    let despesas = this.getDetalheDespesasParceladasChecked();

    if (despesas.length == 0) {
      alert('Necessario selecionar alguma *DESPESA PARCELADA* para ser adiada.');
      return;
    } else if (despesas.length > 1) {
      alert('Selecione uma despesa por vez para adiar a parcela.');
      return;
    }

    despesas.forEach((d) => {
      if (d.tpParcelaAdiada == 'N') {
        this.detalheService.adiantarFluxoParcelas(d.idDespesa, d.idDetalheDespesa, d.idDespesaParcelada, d.idParcela).toPromise().then(() => {
          this.closeModal();
          this.recarregarDetalheDespesa();
          alert('Parcela adiantada com sucesso! \n \n *ATENÇÃO* Não esquecer de reprocessar as despesas no mês seguinte!');
        },
          err => {
            console.log(err);
          });
      } else {
        alert('Não é permitido adiantar a parcela de uma mesma despesa 2x no mesmo mês.');
      }
    });
  }

  confirmDesfazerAdiantamentoFluxoParcelas() {
    let despesas = this.getDetalheDespesasParceladasChecked();

    if (despesas.length == 0) {
      alert('Necessario selecionar somente *DESPESAS PARCELADAS* para desfazer o adiantamento de parcela.');
      return;
    } else if (despesas.length > 1) {
      alert('Selecione uma despesa por vez para desfazer o adiantamento de parcela.');
      return;
    }

    despesas.forEach((d) => {
      this.detalheService.desfazerAdiantamentoFluxoParcelas(d.idDespesa, d.idDetalheDespesa, d.idDespesaParcelada, d.idParcela).toPromise().then(() => {
        this.closeModal();
        this.recarregarDetalheDespesa();
        alert('Processamento concluido com sucesso!');
      },
        err => {
          console.log(err);
        });
    });
  }

  carregarDespesasParceladas() {
    this.despesasParceladasService.enviaMensagem();
  }

  adiantarFluxoParcelas() {
    this.eventModalConfirmacao = "AdiantarFluxoParcelas";
    this.mensagemModalConfirmacao_header = "Deseja adiar a parcela da despesa selecionada?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Ação válida somente para DESPESAS PARCELADAS.";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  desfazerAdiantamentoFluxoParcelas() {
    this.eventModalConfirmacao = "DesfazerAdiantamentoFluxoParcelas";
    this.mensagemModalConfirmacao_header = "Deseja *DESFAZER* o adiamento da parcela da despesa selecionada?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Ação válida somente para DESPESAS PARCELADAS.";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  addNovaLinhaDetalheDespesa() {
    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    if (detalheDespesa.isNovaDespesa) {
      alert('Necessário salvar a despesa para depois adicionar novas linhas.');
      return;
    }

    let novoItem = this.novaLinhaDetalheDespesa(detalheDespesa);

    this.detalheService.gravarDetalheDespesa(novoItem).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }


  /* -------------- Modal Editor Valores -------------- */
  onEditarValores() {
    var input = document.getElementById("inputNovoValor");

    input.addEventListener('keyup', function (e) {
      var key = e.which || e.keyCode;
      if (key == 13) {
        let valorAtual = parseFloat(formatRealNumber((document.getElementById("subTotalValores") as HTMLInputElement).value));
        let inputValue = (document.getElementById("inputNovoValor") as HTMLInputElement).value;

        if (parseFloat(formatRealNumber(inputValue)) !== 0) {
          let novoValor = isValorNegativo(inputValue) ? parseFloat("-" + formatRealNumber(inputValue)) : parseFloat(formatRealNumber(inputValue));

          let calculo = (novoValor + valorAtual).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

          (<HTMLInputElement>document.getElementById("subTotalValores")).value = calculo;
        }

        //limpa o campo de input
        (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "R$ 0,00";
      }
    });
  }

  confirmGravarEditarValores() {
    let novoValor = (document.getElementById("subTotalValores") as HTMLInputElement).value.replace('R$', '');
    let objeto = this.objectModalEditarValores;

    switch (this.eventModalEditarValores) {
      case 'detalheDespColValorTotal': {
        objeto.vlTotal = novoValor.trim();
        this.changeDetalheDespesasMensais(objeto);
        break;
      }
      case 'detalheDespColValorTotalPago': {
        objeto.vlTotalPago = novoValor.trim();
        this.changeDetalheDespesasMensais(objeto);
        break;
      }
      case 'valorParcelaAmortizacao': {
        objeto.vlParcela = novoValor.trim();
        this.changeParcelasAmortizacao(objeto);
        break;
      }
      default: {
      }
    }

    this.resetModalEditarValores;
    this.closeModal();
  }

  setModalEditarValores(valor, evento, objeto) {
    (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "";
    (<HTMLInputElement>document.getElementById("subTotalValores")).value = "R$ 0,00";

    this.eventModalEditarValores = (evento == "reset" ? this.eventModalEditarValores : evento);
    this.objectModalEditarValores = (evento == "reset" ? this.objectModalEditarValores : objeto);

    let valorAtual = parseFloat(formatRealNumber(valor));

    if (isValorNegativo(valor)) {
      valorAtual = (valorAtual * -1);
    }

    (<HTMLInputElement>document.getElementById("subTotalValores")).value =
      valorAtual.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
  }

  onEditarTituloDespesa() {
    this.eventModalConfirmacao = "AlterarTituloDespesa";
    this.mensagemModalConfirmacao_header = "Confirma a alteração do titulo desta despesa?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Será alterado o titulo das demais despesas relacionadas.";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmAlterarTituloDespesa() {
    let nomeDespesa = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    this.lancamentosService.editarTituloDespesa(this.detalheRef, nomeDespesa).subscribe(res => {
      alert('Titulo alterado com sucesso!');
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  resetModalEditarValores() {
    this.objectModalEditarValores = null;
    (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "R$ 0,00";
    (<HTMLInputElement>document.getElementById("subTotalValores")).value = "R$ 0,00";
  }

  carregarParcelasAmortizacao() {
    this.resetParcelasAmortizacaoChange();

    let despesas = this.getDetalheDespesasParceladasChecked();
    if (despesas.length == 0) {
      alert('Selecione uma despesa por vez para realizar a amortização.');
      return;
    } else if (despesas.length > 1) {
      alert('Necessário selecionar alguma despesa PARCELADA para realizar a amortização.');
      return;
    }

    despesas.forEach((d) => {
      this.tituloDespesaParceladaAmortizacao = d.dsTituloDespesa;
      this.despesasParceladasService.getParcelasParaAmortizacao(d.idDespesaParcelada).subscribe(res => {
        this.parcelasAmortizacao = res;
        this.setParcelasAmortizacaoObservable(res)
      },
        err => {
          console.log(err);
        });
    });
  }

  /* -------------- Metodos Gerais -------------- */
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

function isValorNegativo(str) {
  let regex = new RegExp("-");
  return regex.test(str);
}
