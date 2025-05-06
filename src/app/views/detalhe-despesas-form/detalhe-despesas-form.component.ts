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
import { ObservacoesDetalheDespesaRequest } from 'src/app/core/interfaces/observacoes-detalhe-despesa-request.interface';
import { PagamentoDespesasRequest } from 'src/app/core/interfaces/pagamento-despesas-request.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { ConsolidacaoService } from 'src/app/core/services/consolidacao.service';
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
  private tituloDespesasParcelada: TituloDespesaResponse;
  private tituloDespesasRelatorio: TituloDespesaResponse;
  private tituloDespesasConsolidacao: TituloDespesaResponse;
  private tituloDespesasAlteracao: TituloDespesaResponse;
  private detalheLancamentosMensais: DetalheLancamentosMensais;
  private observacoes: ObservacoesDetalheDespesaRequest;
  private parcelasAmortizacao: Parcelas[];

  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalCategoriaDetalheDespesaForm: FormGroup;
  private modalDetalheDespesasMensaisForm: FormGroup;
  private modalImportacaoDespesaParceladaForm: FormGroup;
  private modalAssociarDespesaParceladaConsolidacaoForm: FormGroup;
  private modalAssociarDespesaMensalExistenteForm: FormGroup;
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
  private checkVisualizarParcelasConsolidadas: Boolean = false;
  private observacoesEditorValores: string = "";

  private eventModalConfirmacao: string = "";
  private mensagemModalConfirmacao_header: string = "";
  private mensagemModalConfirmacao_body: string = "";
  private mensagemModalConfirmacao_footer: string = "";

  private eventModalEditarValores: string = "";
  private objectModalEditarValores: any;
  private objectModalObservacoes: any;
  private objectModalHistorico: any;

  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais;
  @ViewChild('modalConfirmacaoExcluirDespesa') modalConfirmacaoExcluirDespesa;
  @ViewChild('modalConfirmacaoQuitarDespesas') modalConfirmacaoQuitarDespesas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;
  @ViewChild('modalCategoriaDetalheDespesa') modalCategoriaDetalheDespesa;
  @ViewChild('modalAssociarDespesaMensalExistente') modalAssociarDespesaMensalExistente;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private detalheService: DetalheDespesasService,
    private despesasParceladasService: DespesasParceladasService,
    private lancamentosService: LancamentosFinanceirosService,
    private consolidacaoService: ConsolidacaoService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.tituloDespesasParcelada = {
      despesas: []
    }

    this.tituloDespesasRelatorio = {
      despesas: []
    }

    this.tituloDespesasConsolidacao = {
      despesas: []
    }

    this.tituloDespesasAlteracao = {
      despesas: []
    }

    this.modalConfirmacaoQuitarDespesasForm = this.formBuilder.group({
      observacaoPagamento: ['']
    });

    this.modalDetalheDespesasMensaisForm = this.formBuilder.group({
      nomeDespesa: [''],
      checkLimiteMesAnterior: [''],
      checkReprocessarDespesasNaoParceladas: [''],
      checkVisualizarParcelasConsolidadas: ['']
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

    this.modalAssociarDespesaMensalExistenteForm = this.formBuilder.group({
    });

    this.modalImportacaoDespesaParceladaForm = this.formBuilder.group({
      checkCarregarTodasDespesasParceladas: ['']
    });

    this.modalAssociarDespesaParceladaConsolidacaoForm = this.formBuilder.group({
      checkCarregarTodasConsolidacoes: [false]
    });

    this.checkDespesasForm = this.formBuilder.group({
      checkMarcarTodasDespesas: [false]
    });

    this.detalheService.recebeMensagem().subscribe(d => {
      this.resetCheckBoxMarcarTodos();
      this.modalDetalheDespesasMensaisForm.reset();
      this.modalConfirmacaoQuitarDespesasForm.reset();
      this.modalCategoriaDetalheDespesaForm.reset();
      this.modalImportacaoDespesaParceladaForm.reset();
      this.modalAssociarDespesaParceladaConsolidacaoForm.reset();
      this.modalAssociarDespesaMensalExistenteForm.reset();
      this.despesaRef = d.idDespesa;
      this.detalheRef = d.idDetalheDespesa;
      this.mesRef = d.mesPesquisaForm;
      this.anoRef = d.anoPesquisaForm;
      this.checkVisualizarParcelasConsolidadas = false;

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

    (<HTMLInputElement>document.getElementById("observacoesDetalhe")).value = "";
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
    let despesasRequest: PagamentoDespesasRequest[] = [];

    this.getDetalheDespesasCheckedPagamento().forEach((d) => {
      let despesa: PagamentoDespesasRequest = {
        idDespesa: d.idDespesa,
        idDetalheDespesa: d.idDetalheDespesa,
        idDespesaParcelada: d.idDespesaParcelada,
        idConsolidacao: d.idConsolidacao,
        idParcela: d.idParcela,
        idOrdem: d.idOrdem,
        idFuncionario: d.idFuncionario,
        vlTotal: d.vlTotal,
        vlTotalPago: d.vlTotal,
        tpStatus: d.tpStatus,
        dsObservacoes: (d.dsObservacao == "" ? this.modalConfirmacaoQuitarDespesasForm.get('observacaoPagamento').value : d.dsObservacao),
        dsObservacoesComplementar: d.dsObservacao2,
        isProcessamentoAdiantamentoParcelas: false
      };

      despesasRequest.push(despesa);
    });

    this.detalheService.processarPagamentoDetalheDespesa(despesasRequest).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  adicionarNovaDespesa() {
    this.resetDetalheDespesasChange();
    this.carregarListaDespesasTipoRelatorio();
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
      dsExtratoDespesa: "Para salvar esta despesa, é necessário digitar o Nome da Despesa e opcionalmente um Limite Referencia.",
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
    this.checkVisualizarParcelasConsolidadas = false;

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
        this.confirmOrganizarRegistrosDetalheDespesa(true);
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
      case 'AdiarFluxoParcelas': {
        this.confirmAdiarFluxoParcelas();
        break;
      }
      case 'DesfazerAdiamentoFluxoParcelas': {
        this.confirmDesfazerAdiamentoFluxoParcelas();
        break;
      }
      case 'AlterarTituloDespesa': {
        this.confirmAlterarTituloDespesa();
        break;
      }
      case 'AssociarDespesaParceladaConsolidacao': {
        this.confirmAssociarDespesaConsolidacao();
        break;
      }
      case 'AssociarDespesaMensalExistente': {
        this.confirmAssociarDespesaMensalExistente();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  isExibirParcelasConsolidadas(): Boolean {
    return !this.checkVisualizarParcelasConsolidadas;
  }

  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.resetDetalheDespesasChange();
    this.carregarListaDespesasTipoRelatorio();

    this.detalheService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao, this.isExibirParcelasConsolidadas()).subscribe((res) => {
      this.detalheLancamentosMensais = res;
      this.despesaRef = res.despesaMensal.idDespesa;
      this.detalheRef = res.despesaMensal.idDetalheDespesa;
      this.nomeDespesa = res.despesaMensal.dsTituloDespesa;
      this.detalheLancamentosMensais.despesaMensal.isNovaDespesa = false;

      if (ordemExibicao == null) {
        this.detalheService.getExtratoDetalheDespesa(idDespesa, idDetalheDespesa).subscribe((res) => {
          if (res.qtDespesas == null) {
            this.detalheLancamentosMensais.despesaMensal.dsExtratoDespesa = "Visualização temporaria de lançamentos - Mês Referência: ".concat(this.mesAnoVisualizacaoTemp);
          }
        });
      }

      if (res.detalheDespesaMensal.length == 0) {
        this.addNovaLinhaDetalheDespesa();
        return;
      }

      this.setDetalheDespesaMensalObservable(res.detalheDespesaMensal);
      this.carregarFormDetalheDespesasMensais(res.despesaMensal);
    });
  }

  bloquearControlesDespesaTipoRelatorio(isBloqueado: boolean) {
    (<HTMLInputElement>document.getElementById("buttonQuitar")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonDesfazerPagamento")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonImportar")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAtualizar")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAssociarDespesaAConsolidacao")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAmortizarParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAdiarParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonDesfazerAdiamentoFluxoParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("checkVisualizarParcelasConsolidadas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("checkReprocessarDespesasNaoParceladas")).disabled = isBloqueado;
  }

  bloquearControlesNovaDespesa(isBloqueado: boolean) {
    (<HTMLInputElement>document.getElementById("buttonImportar")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAtualizar")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAssociarDespesaAConsolidacao")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAmortizarParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAdiarParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonDesfazerAdiamentoFluxoParcelas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonOrdenarRegistros")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("checkVisualizarParcelasConsolidadas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("checkReprocessarDespesasNaoParceladas")).disabled = isBloqueado;
    (<HTMLInputElement>document.getElementById("buttonAssociarDespesaExistente")).disabled = isBloqueado;
  }

  validarCategoriaDespesaLoad(despesa: DespesaMensal) {
    if (despesa.tpAnotacao == "S") {
      this.onCategoriaRascunho(true);
    } else if (despesa.tpRelatorio == "S") {
      this.onCategoriaRelatorio(true);
    } else if (despesa.tpDebitoAutomatico == "S") {
      this.onCategoriaDebitoAuto(true);
    } else if (despesa.tpDebitoCartao == "S") {
      this.onCategoriaDebitoCartao(true);
    } else if (despesa.tpEmprestimoAPagar == "S") {
      this.onCategoriaEmpAPagar(true);
    } else if (despesa.tpEmprestimo == "S") {
      this.onCategoriaEmpAReceber(true);
    } else if (despesa.tpPoupanca == "S") {
      this.onCategoriaPoupancaPositiva(true);
    } else if (despesa.tpPoupancaNegativa == "S") {
      this.onCategoriaPoupancaNegativa(true);
    } else {
      this.onCategoriaRascunho(false);
      this.onCategoriaRelatorio(false);
      this.onCategoriaDebitoAuto(false);
      this.onCategoriaDebitoCartao(false);
      this.onCategoriaEmpAPagar(false);
      this.onCategoriaEmpAReceber(false);
      this.onCategoriaPoupancaPositiva(false);
      this.onCategoriaPoupancaNegativa(false);
    }
  }

  carregarFormDetalheDespesasMensais(despesa: DespesaMensal) {
    (<HTMLInputElement>document.getElementById("valorLimiteDespesa")).value = despesa.vlLimiteExibicao;

    this.modalDetalheDespesasMensaisForm.setValue({
      nomeDespesa: (despesa.dsNomeDespesa),
      checkLimiteMesAnterior: (despesa.tpReferenciaSaldoMesAnterior == "S"),
      checkReprocessarDespesasNaoParceladas: (despesa.tpReprocessar == "S"),
      checkVisualizarParcelasConsolidadas: this.checkVisualizarParcelasConsolidadas
    });

    this.bloquearControlesNovaDespesa(despesa.isNovaDespesa);

    if (despesa.isNovaDespesa == false) {
      this.bloquearControlesDespesaTipoRelatorio(despesa.tpRelatorio == "S");
    }
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

    this.lancamentosService.enviaMensagem("recarregarDetalhes");
  }

  resetCheckBoxMarcarTodos() {
    this.checkDespesasForm = this.formBuilder.group({
      checkMarcarTodasDespesas: [false]
    });

    this.checkboxesMarcadas = false;
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
      checkDespesaEmprestimoAReceber: (detalheDespesa.tpEmprestimo == "S" ? true : false),
      checkDespesaEmprestimoAPagar: (detalheDespesa.tpEmprestimoAPagar == "S" ? true : false)
    });

    this.validarCategoriaDespesaLoad(detalheDespesa);
  }

  carregarListaDespesasParceladasImportacao(isTodasDespesas: boolean) {
    this.detalheService.getTituloDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParcelada = res;
    });
  }

  carregarListaConsolidacoesParaAssociacao(isTodasDespesas: boolean) {
    this.detalheService.getTituloConsolidacoesParaAssociacao(this.despesaRef, this.detalheRef, isTodasDespesas).subscribe((res) => {
      this.tituloDespesasConsolidacao = res;
    });
  }

  carregarListaDespesasAlteracao() {
    this.detalheService.getTituloDespesaAlteracao(this.despesaRef, Number(this.anoRef)).subscribe((res) => {
      this.tituloDespesasAlteracao = res;
    });
  }

  carregarListaDespesasTipoRelatorio() {
    this.detalheService.getTituloDespesasRelatorio(this.despesaRef).subscribe((res) => {
      this.tituloDespesasRelatorio = res;
    });
  }

  onAssociarDespesaParceladaConsolidacao() {
    let valor = (document.getElementById("comboTituloConsolidacao") as HTMLInputElement).value;
    if (valor == "") {
      alert('Necessário selecionar uma consolidação para associação.');
      return;
    }

    this.eventModalConfirmacao = "AssociarDespesaParceladaConsolidacao";
    this.mensagemModalConfirmacao_header = "Deseja realmente associar a(s) despesa(s) a esta consolidação?";
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  onAssociarDespesaMensalExistente() {
    let valor = (document.getElementById("comboTituloDespesaExistente") as HTMLInputElement).value;
    if (valor == "") {
      alert('Necessário selecionar uma despesa.');
      return;
    }

    this.eventModalConfirmacao = "AssociarDespesaMensalExistente";
    this.mensagemModalConfirmacao_header = "Deseja realmente alterar as referencias da despesa atual pela selecionada?";
    this.mensagemModalConfirmacao_body = " ";
    this.mensagemModalConfirmacao_footer = "A alteração é irreversível!";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  onImportarDespesaParcelada() {
    let valor = (document.getElementById("comboTituloDespesaParcelada") as HTMLInputElement).value;
    if (valor == "") {
      alert('Necessário selecionar alguma despesa para importação.');
      return;
    }

    this.eventModalConfirmacao = "ImportacaoDespesaParcelada";
    this.mensagemModalConfirmacao_header = (valor.indexOf('-') < 0 ? "Deseja importar esta despesa parcelada ?" : "Deseja importar esta consolidação?")
    this.mensagemModalConfirmacao_body = "null";
    this.mensagemModalConfirmacao_footer = "null";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  onCheckCarregarTodasDespParceladas(checked) {
    this.carregarListaDespesasParceladasImportacao(checked);
  }

  onCheckCarregarTodasConsolidacoes(checked) {
    this.carregarListaConsolidacoesParaAssociacao(checked);
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

  onChangeDespesaRelatorioAssociada(despesaRelatorio, detalhe) {
    detalhe.idDespesaLinkRelatorio = despesaRelatorio;
    detalhe.tpRelatorio = ((despesaRelatorio > 0) ? 'S' : 'N');
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

  onCheckVisualizarParcelasConsolidadas(checked) {
    this.checkVisualizarParcelasConsolidadas = checked;
    this.recarregarDetalheDespesa();
  }

  onCategoriaRascunho(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;

    if ((<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).checked) {
      this.onCategoriaDebitoAuto(true);
    }

    if ((<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).checked) {
      this.onCategoriaDebitoCartao(true);
    }
  }

  onCategoriaRelatorio(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRascunho")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;
  }

  onCategoriaDebitoAuto(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;

    if ((<HTMLInputElement>document.getElementById("checkDespesaRascunho")).checked) {
      this.onCategoriaRascunho(true);
    }
  }

  onCategoriaDebitoCartao(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;

    if ((<HTMLInputElement>document.getElementById("checkDespesaRascunho")).checked) {
      this.onCategoriaRascunho(true);
    }
  }

  onCategoriaEmpAPagar(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaRascunho")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;
  }

  onCategoriaEmpAReceber(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaRascunho")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;
  }

  onCategoriaPoupancaPositiva(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaNegativa")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
  }

  onCategoriaPoupancaNegativa(checked) {
    (<HTMLInputElement>document.getElementById("checkDespesaRelatorio")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoAutomatico")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaDebitoCartao")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaPoupancaPositiva")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAPagar")).disabled = checked;
    (<HTMLInputElement>document.getElementById("checkDespesaEmprestimoAReceber")).disabled = checked;
  }

  changeDetalheDespesasMensais(detalhe: DetalheDespesasMensais) {
    let detalheDespesa = this._detalheDespesasChange.getValue();
    let index = detalheDespesa.findIndex((d) => d.idDetalheDespesa === detalhe.idDetalheDespesa && d.idOrdem === detalhe.idOrdem);

    detalhe.changeValues = true;
    detalhe.idDetalheReferencia = this.detalheRef;

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

    if (!this.validarAlteracaoTituloDespesaExistente(despesa)) {
      return;
    }

    if (despesa.tpReferenciaSaldoMesAnterior == "N") {
      let valorLimiteDespesa = formatRealNumber((document.getElementById("valorLimiteDespesa") as HTMLInputElement).value);

      if (valorLimiteDespesa == "NaN" || valorLimiteDespesa == "0") {
        valorLimiteDespesa = "0,00";
      }

      despesa.vlLimite = valorLimiteDespesa;
    }

    this.detalheService.validarDuplicidadeTituloDespesa(this.despesaRef, this.detalheRef, despesa.dsNomeDespesa).subscribe(res => {
      if (res.mensagem !== 'OK') {
        alert(res.mensagem);
        return;
      } else {
        this.eventModalConfirmacao = "GravarDetalheDespesas";
        this.mensagemModalConfirmacao_header = (despesa.isNovaDespesa ? "Deseja gravar esta nova despesa?" : "Deseja salvar as alterações ?")
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

  validarAlteracaoTituloDespesaExistente(despesa: DespesaMensal): boolean {
    let tituloAnterior = despesa.dsNomeDespesa;
    let tituloAtual = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    if (tituloAtual == "") {
      alert('Digite o titulo da despesa.');
      return false;
    }

    if (tituloAnterior == "") {
      despesa.dsNomeDespesa = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;
      tituloAnterior = despesa.dsNomeDespesa;
    }

    if (tituloAtual.trim() !== tituloAnterior.trim()) {
      this.onEditarTituloDespesa();
      return false;
    }

    return true;
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
    let detalhesRequest: DetalheDespesasMensais[] = [];

    this.getDetalheDespesasChange().forEach((d) => {
      d.dsDescricao = d.dsTituloDespesa;
      d.vlTotal = d.vlTotal.replace('.', '');
      d.vlTotalPago = d.vlTotalPago.replace('.', '');

      detalhesRequest.push(d);
    });

    this.detalheService.gravarDetalheDespesa(detalhesRequest).toPromise().then(() => {
      this.gravarDespesa(this.detalheLancamentosMensais.despesaMensal);
    },
      err => {
        console.log(err);
      }
    );

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
      this.confirmOrganizarRegistrosDetalheDespesa(false);
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  confirmOrganizarRegistrosDetalheDespesa(isExibirConfirmacao: boolean) {
    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.organizarListaItensDetalheDespesa(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa).toPromise().then(() => {
      this.recarregarDetalheDespesa();
      if (isExibirConfirmacao) {
        alert('Lista de despesas ordenada com sucesso.');
      }
    },
      err => {
        console.log(err);
      });
  }

  confirmImportarDespesaParcelada() {
    let idDespesaImportacao = +(document.getElementById("comboTituloDespesaParcelada") as HTMLInputElement).value;
    let idConsolidacaoImportacao = 0;

    if (idDespesaImportacao < 0) {
      idConsolidacaoImportacao = Math.abs(idDespesaImportacao);
      idDespesaImportacao = 0;
    }

    let detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.processarImportacaoDespesasParceladas(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa, idDespesaImportacao, idConsolidacaoImportacao).toPromise().then(() => {
      this.carregarListaDespesasParceladasImportacao(false);
      this.confirmOrganizarRegistrosDetalheDespesa(false);
    },
      err => {
        console.log(err);
      });
  }

  confirmDesfazerPagamentoDespesa() {
    let detalhesRequest: DetalheDespesasMensais[] = [];

    this.getDetalheDespesasChecked().forEach((d) => {
      d.tpStatus = 'Pendente';
      d.dsObservacao = '';

      detalhesRequest.push(d);
    });

    this.detalheService.gravarDetalheDespesa(detalhesRequest).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });

    this.closeModal();
  }

  carregarObservacoes(objeto) {
    this.objectModalObservacoes = objeto;

    this.detalheService.getObservacoesDetalheDespesa(this.despesaRef, objeto.idDetalheDespesa, objeto.idObservacao).subscribe(res => {
      (<HTMLInputElement>document.getElementById("observacoesDetalhe")).value = res.observacoes;
    },
      err => {
        console.log(err);
      }
    );
  }

  carregarHistorico(objeto) {
    this.objectModalHistorico = objeto;

    this.detalheService.getHistoricoDetalheDespesa(objeto.idDetalheDespesaLog, this.despesaRef, objeto.idDetalheDespesa).subscribe(res => {
      (<HTMLInputElement>document.getElementById("historicoDetalhe")).value = res.historico;
    },
      err => {
        console.log(err);
      }
    );
  }

  gravarObservacoes() {
    let objeto = this.objectModalObservacoes;

    let observacaoRequest = this.observacoes = {
      idObservacao: objeto.idObservacao,
      idDespesa: objeto.idDespesa,
      idDetalheDespesa: objeto.idDetalheDespesa,
      idOrdem: objeto.idOrdem,
      idFuncionario: objeto.idFuncionario,
      dsObservacoes: (<HTMLInputElement>document.getElementById("observacoesDetalhe")).value
    }

    this.detalheService.gravarObservacoesDetalheDespesa(observacaoRequest).toPromise().then(() => {
      alert('Observações gravadas com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  atualizarOrdemLinhaDetalheDespesa(acao, objeto) {
    let ordemAtual = objeto.idOrdem;

    if (this.isDetalheNewOrChanged()) {
      alert('Necessario salvar a despesa para depois alterar a ordem de exibição.');
      return;
    }

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
    this.mensagemModalConfirmacao_header = "Deseja organizar a lista de despesas por prazo?"
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

  getDetalheDespesasParceladasSemParcelasAdiantadasChecked() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && (d.idDespesaParcelada !== 0 || d.idConsolidacao !== 0) && d.tpLinhaSeparacao == 'N' && d.tpParcelaAdiada == 'N');
  }

  getDetalheDespesasParceladasComParcelasAdiantadasChecked() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && (d.idDespesaParcelada !== 0 || d.idConsolidacao !== 0) && d.tpLinhaSeparacao == 'N' && d.tpParcelaAdiada == 'S');
  }

  getDetalheDespesasCheckedPagamento() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && d.tpAnotacao == 'N' && d.tpLinhaSeparacao == 'N');
  }

  getDetalheDespesasChange() {
    let resultado = this._detalheDespesasChange.getValue().filter((d) => d.changeValues === true);
    return resultado;
  }

  isDetalheNewOrChanged(): boolean {
    return this._detalheDespesasChange.getValue().filter((d) => d.changeValues === true).length > 0;
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
      idDetalheReferencia: this.detalheRef,
      idConsolidacao: 0,
      idDespesaConsolidacao: 0,
      idFuncionario: Number(this.sessao.getIdLogin()),
      dsDescricao: '',
      dsObservacao: '',
      dsObservacao2: '',
      idOrdem: null, // Somenta para nova linha
      idObservacao: 0,
      idDetalheDespesaLog: 0,
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
      changeValues: true,
      isNovaLinhaEmBranco: true
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
      this.confirmOrganizarRegistrosDetalheDespesa(false);
      alert('Atualização realizada com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  confirmAdiarFluxoParcelas() {
    let despesas = this.getDetalheDespesasParceladasSemParcelasAdiantadasChecked();

    if (despesas.length == 0) {
      alert('Necessario selecionar alguma *DESPESA PARCELADA* para ser adiada.');
      return;
    }

    this.detalheService.adiarFluxoParcelas(despesas).toPromise().then(() => {
      this.closeModal();
      this.recarregarDetalheDespesa();
      alert('Parcela(s) adiada(s) com sucesso! \n \n *ATENÇÃO* Não esquecer de reprocessar as despesas no mês seguinte!');
    },
      err => {
        console.log(err);
      });
  }

  confirmDesfazerAdiamentoFluxoParcelas() {
    let despesas = this.getDetalheDespesasParceladasComParcelasAdiantadasChecked();

    if (despesas.length == 0) {
      alert('Necessario selecionar alguma *DESPESA PARCELADA* para ser adiada.');
      return;
    }

    this.detalheService.desfazerAdiamentoFluxoParcelas(despesas).toPromise().then(() => {
      this.closeModal();
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  carregarDespesasParceladas() {
    this.despesasParceladasService.enviaMensagem(null);
  }

  adiarFluxoParcelas() {
    this.eventModalConfirmacao = "AdiarFluxoParcelas";
    this.mensagemModalConfirmacao_header = "Deseja adiar a parcela da despesa selecionada?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Ação válida somente para DESPESAS PARCELADAS.";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  desfazerAdiamentoFluxoParcelas() {
    this.eventModalConfirmacao = "DesfazerAdiamentoFluxoParcelas";
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

    let novaLinha: DetalheDespesasMensais[] = [];
    novaLinha.push(this.novaLinhaDetalheDespesa(detalheDespesa));

    this.detalheService.gravarDetalheDespesa(novaLinha).toPromise().then(() => {
      this.confirmOrganizarRegistrosDetalheDespesa(false);
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

      if (key >= 96 && key <= 105) {
        mascaraMoedaInputDinamico(input);
      }

      if (key == 13) {
        let valorAtual = parseFloat(formatRealNumber((document.getElementById("subTotalValores") as HTMLInputElement).value));
        let inputValue = (document.getElementById("inputNovoValor") as HTMLInputElement).value;
        let inputObservacoes = (document.getElementById("inputObservacoesEditorValores") as HTMLInputElement).value;
        let observacoes = (document.getElementById("observacoes") as HTMLInputElement).value;

        if (validarCaracteresInput(inputValue) && "" !== inputObservacoes) {
          inputObservacoes = inputObservacoes.concat(inputValue);

          (document.getElementById("observacoes") as HTMLInputElement).value = observacoes.concat(inputObservacoes.concat('\\n'));

          console.log(observacoes.concat(inputObservacoes.concat('\\n')));

          (document.getElementById("inputObservacoesEditorValores") as HTMLInputElement).value = "";
        }

        if (!validarCaracteresInput(inputValue) && parseFloat(formatRealNumber(inputValue)) >= 0) {
          let novoValor = isValorNegativo(inputValue) ? parseFloat("-" + formatRealNumber(inputValue)) : parseFloat(formatRealNumber(inputValue));

          let calculo = (novoValor + valorAtual).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

          (<HTMLInputElement>document.getElementById("subTotalValores")).value = calculo;

          if (!validarCaracteresInput(inputValue)) {
            (<HTMLInputElement>document.getElementById("inputObservacoesEditorValores")).value = inputValue.concat(' - ');
          }
        }

        //limpa o campo de input
        (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "";
      }

    });
  }

  abrirModalCadastroDespesasParceladas(despesa) {
    this.despesasParceladasService.enviaMensagem(despesa);
  }

  abrirModalCadastroConsolidacoes(despesa) {
    this.consolidacaoService.enviaMensagem(despesa);
  }

  obterExtratoDespesaConsolidada(despesa) {
    this.detalheService.obterExtratoDespesasParceladasConsolidadas(this.despesaRef, this.detalheRef, despesa.idConsolidacao).toPromise().then((res) => {
      alert('* VISUALIZAÇÃO DESPESAS PARCELADAS CONSOLIDADAS * \r\n \r\n' + res.nomeDespesaParcelada);
    },
      err => {
        alert('Ocorreu um erro ao obter os dados do extrato de quitação, tente novamente mais tarde.');
      });
  }

  confirmGravarEditarValores() {
    let novoValor = (document.getElementById("subTotalValores") as HTMLInputElement).value.replace('R$', '');
    let objeto = this.objectModalEditarValores;

    switch (this.eventModalEditarValores) {
      case 'detalheDespColValorTotal': {
        objeto.vlTotal = novoValor.trim();
        objeto.dsObservacoesEditorValores = (document.getElementById("observacoes") as HTMLInputElement).value;
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
    (<HTMLInputElement>document.getElementById("inputObservacoesEditorValores")).value = "";
    (<HTMLInputElement>document.getElementById("observacoes")).value = "";

    this.eventModalEditarValores = (evento == "reset" ? this.eventModalEditarValores : evento);
    this.objectModalEditarValores = (evento == "reset" ? this.objectModalEditarValores : objeto);

    let valorAtual = parseFloat(formatRealNumber(valor));

    if (isValorNegativo(valor)) {
      valorAtual = (valorAtual * -1);
    }

    (<HTMLInputElement>document.getElementById("subTotalValores")).value =
      valorAtual.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

    setarFocoCampo('inputNovoValor');
  }

  onEditarTituloDespesa() {
    this.eventModalConfirmacao = "AlterarTituloDespesa";
    this.mensagemModalConfirmacao_header = "Confirma a alteração do titulo desta despesa?"
    this.mensagemModalConfirmacao_body = "";
    this.mensagemModalConfirmacao_footer = "Obs: Será alterado o titulo das demais despesas relacionadas.";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmAssociarDespesaConsolidacao() {
    let despesas = this.getDetalheDespesasParceladasChecked();

    if (despesas.length == 0) {
      alert('Necessário selecionar alguma despesa parcelada para ser consolidada.');
      return;
    }

    let idConsolidacao = +(document.getElementById("comboTituloConsolidacao") as HTMLInputElement).value;

    this.detalheService.associarDespesasConsolidacao(idConsolidacao, despesas).toPromise().then(() => {
      this.closeModal();
      this.recarregarDetalheDespesa();
      alert('Despesa(s) associada(s) com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  confirmAssociarDespesaMensalExistente() {
    let idDetalheDespesaAssociada = Number((document.getElementById("comboTituloDespesaExistente") as HTMLInputElement).value);

    this.detalheService.alterarReferenciaDespesaMensal(this.despesaRef, this.detalheRef, idDetalheDespesaAssociada).toPromise().then(() => {
      this.closeModal();
      alert('Despesa alterada com sucesso!');
      this.detalheDomain.getDespesaMensal().idDetalheDespesa = idDetalheDespesaAssociada;
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
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
    (<HTMLInputElement>document.getElementById("inputObservacoesEditorValores")).value = "";
    (<HTMLInputElement>document.getElementById("observacoes")).value = "";
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

function mascaraMoedaInputDinamico(valor) {
  var valorAlterado = valor.value;

  if (validarCaracteresInput(valorAlterado)) {
    return;
  }

  valorAlterado = valorAlterado.replace(/\D/g, ""); // Remove todos os não dígitos
  valorAlterado = valorAlterado.replace(/(\d+)(\d{2})$/, "$1,$2"); // Adiciona a parte de centavos
  valorAlterado = valorAlterado.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Adiciona pontos a cada três dígitos
  valor.value = valorAlterado;
}

function validarCaracteresInput(valor): boolean {
  if (valor.includes('/', ',', '-', '(', ')')) {
    return true;
  }

  let regex = /[a-zA-Z]/;
  return regex.test(valor);
}

function isValorNegativo(str) {
  let regex = new RegExp("-");
  return regex.test(str);
}

async function setarFocoCampo(inputName: string) {
  await aguardarTempo(500); // Aguarda 1/2 segundo
  const campoInput = document.getElementById(inputName) as HTMLInputElement;

  // Define o foco no campo
  campoInput.focus();
}

async function aguardarTempo(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}