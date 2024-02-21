import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService, formatDate } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { CategoriaDespesaEnum, StatusPagamentoEnum } from 'src/app/core/enums/detalhe-despesas-enums';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DetalheDespesasMensais } from 'src/app/core/interfaces/detalhe-despesas-mensais.interface';
import { DetalheLancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais-detalhe.interface';
import { PagamentoDespesasRequest } from 'src/app/core/interfaces/pagamento-despesas-request.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { DetalheDespesasService } from 'src/app/core/services/detalhe-despesas.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-despesas-parceladas-form',
  templateUrl: './despesas-parceladas-form.component.html',
  styleUrls: ['./despesas-parceladas-form.component.css']
})
export class DespesasParceladasFormComponent implements OnInit {
  private _detalheDespesasChange = new BehaviorSubject<DetalheDespesasMensais[]>([]);
  private tituloDespesasParceladas: TituloDespesaResponse;
  private detalheLancamentosMensais: DetalheLancamentosMensais;

  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalCategoriaDetalheDespesaForm: FormGroup;
  private modalDetalheDespesasMensaisForm: FormGroup;
  private modalImportacaoDespesaParceladaForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaRef: number;
  private mesRef: string;
  private anoRef: string;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";

  private eventModalEditarValores: String = "";
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

    this.detalheService.recebeMensagem().subscribe(d => {
      this.despesaRef = d.idDespesa;
      this.mesRef = d.mesPesquisaForm;
      this.anoRef = d.anoPesquisaForm;

      if (null == d.idDetalheDespesa) {
        this.adicionarNovaDespesa();
      } else {
        this.carregarDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdemExibicao, d.idFuncionario);
      }
    }, () => {
      alert('Ocorreu um erro ao carregar os detalhes da despesa, tente novamente mais tarde.')
    })
  }

  onQuitarDespesa() {
    const despesas = this.getDetalheDespesasCheckedPagamento();

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
    const observacaoPagamento: string = this.modalConfirmacaoQuitarDespesasForm.get('observacaoPagamento').value;

    const detalheDespesas = this.getDetalheDespesasCheckedPagamento();

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
        dsObservacoes: (d.dsObservacao.trim() == "" ? observacaoPagamento : d.dsObservacao),
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
      const novaDespesa = this.obterNovaDespesaObjeto(res.novaChave);

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
    const novaDespesa: DespesaMensal = {
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
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number, idFuncionario: number) {
    this.resetDetalheDespesasChange();

    this.detalheService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      this.detalheLancamentosMensais = res;
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
    const detalheDespesa = this._detalheDespesasChange.getValue();

    despesa.forEach(d => {
      detalheDespesa.push({ ...d });
      this._detalheDespesasChange.next(detalheDespesa);
    });
  }

  excluirItemDetalheDespesa() {
    this.eventModalConfirmacao = "ExcluirItemDetalheDespesa";
    this.mensagemModalConfirmacao = "Deseja excluir a(s) despesa(s) selecionada(s) ?";

    if (this.getDetalheDespesasChecked().length == 0) {
      alert('Necessário selecionar alguma despesa para excluir.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheDespesa() {
    const despesa = this.detalheDomain.getDespesaMensal();
    this.carregarDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao, despesa.idFuncionario);
    this.lancamentosService.enviaMensagem();
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
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

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
    this.mensagemModalConfirmacao = "Deseja importar esta despesa parcelada ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  onCheckCarregarTodasDespParceladas(checked) {
    this.carregarListaDespesasParceladasImportacao(checked);
  }

  onCheckDetalheDespesaChange(checked, detalhe) {
    detalhe.checked = checked;
    this.changeDetalheDespesasMensais(detalhe);
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
    const detalheDespesa = this._detalheDespesasChange.getValue();
    const index = detalheDespesa.findIndex((d) => d.idDetalheDespesa === detalhe.idDetalheDespesa && d.idOrdem === detalhe.idOrdem);

    detalhe.changeValues = true;

    if (index >= 0) {
      detalheDespesa[index] = detalhe;
    } else {
      detalheDespesa.push({ ...detalhe });
    }

    this._detalheDespesasChange.next(detalheDespesa);
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
    const despesa = this.detalheLancamentosMensais.despesaMensal;
    despesa.dsNomeDespesa = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    if (despesa.dsNomeDespesa == "") {
      alert('Digite o nome da despesa.');
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

    this.eventModalConfirmacao = "GravarDetalheDespesas";
    this.mensagemModalConfirmacao = "Deseja salvar as alterações ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  gravarDespesa(despesa: DespesaMensal) {
    this.detalheService.gravarDespesaMensal(despesa).toPromise().then(() => {
      this.detalheDomain.setDespesaMensal(despesa);
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  confirmGravarDetalheDespesas() {
    this.getDetalheDespesasChange().forEach((d) => {
      d.dsDescricao = d.dsTituloDespesa;
      d.vlTotal = d.vlTotal.replace('.', '');
      d.vlTotalPago = d.vlTotalPago.replace('.', '');

      this.detalheService.gravarDetalheDespesa(d).toPromise().then(() => { },
        err => { }
      );
    })

    this.gravarDespesa(this.detalheLancamentosMensais.despesaMensal);
    this.closeModal();
  }

  desfazerPagamentoDespesa() {
    this.eventModalConfirmacao = "DesfazerPagamentoDespesa";
    this.mensagemModalConfirmacao = "Deseja alterar o status do pagamento da(s) despesa(s) selecionada(s) para PENDENTE ?";

    if (this.getDetalheDespesasChecked().length == 0) {
      alert('Necessário marcar alguma despesa para alterar o status do pagamento.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmExcluirItemDetalheDespesa() {
    const despesas = this.getDetalheDespesasChecked();

    despesas.forEach((d) => {
      this.detalheService.excluritemDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdem).toPromise().then(() => {
        this.recarregarDetalheDespesa();
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
  }

  confirmOrganizarRegistrosDetalheDespesa() {
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.organizarListaItensDetalheDespesa(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa).toPromise().then(() => {
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  confirmImportarDespesaParcelada() {
    const idDespesaParcelada = +(document.getElementById("comboTituloDespesaParcelada") as HTMLInputElement).value;
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.processarImportacaoDespesasParceladas(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa, idDespesaParcelada).toPromise().then(() => {
      this.carregarListaDespesasParceladasImportacao(false);
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  confirmDesfazerPagamentoDespesa() {
    const despesas = this.getDetalheDespesasChecked();

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
    const ordemAtual = objeto.idOrdem;

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
    this.mensagemModalConfirmacao = "Deseja organizar os ID's da lista de despesas ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  getDetalheDespesasChecked() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true);
  }

  getDetalheDespesasCheckedPagamento() {
    return this._detalheDespesasChange.getValue().filter((d) => d.checked === true && d.tpAnotacao == 'N' && d.tpLinhaSeparacao == 'N');
  }

  getDetalheDespesasChange() {
    const resultado = this._detalheDespesasChange.getValue().filter((d) => d.changeValues === true);
    return resultado;
  }

  resetDetalheDespesasChange() {
    this._detalheDespesasChange.next([]);
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
    this.mensagemModalConfirmacao = "Deseja realizar a importação desta despesas novamente? Obs: Os lançamentos poderão ser atualizados! ";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmAtualizarDetalheDespesas() {
    const despesa = this.detalheLancamentosMensais.despesaMensal;

    this.detalheService.reprocessarImportacaoDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.mesPesquisaForm, despesa.anoPesquisaForm, (despesa.tpReprocessar == "S" ? true : false)).toPromise().then(() => {
      this.recarregarDetalheDespesa();
      alert('Atualização realizada com sucesso!');
    },
      err => {
        console.log(err);
      });
  }

  addNovaLinhaDetalheDespesa() {
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    if (detalheDespesa.isNovaDespesa) {
      alert('Necessário salvar a despesa para depois adicionar novas linhas.');
      return;
    }

    const novoItem = this.novaLinhaDetalheDespesa(detalheDespesa);

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
        const valorAtual = parseFloat(formatRealNumber((document.getElementById("subTotalValores") as HTMLInputElement).value));

        const inputValue = (document.getElementById("inputNovoValor") as HTMLInputElement).value;
        const novoValor = parseFloat(formatRealNumber(inputValue));

        const calculo = (isValorNegativo(inputValue) ? (valorAtual - novoValor) : (valorAtual + novoValor))
          .toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });

        (<HTMLInputElement>document.getElementById("subTotalValores")).value = calculo;

        //limpa o campo de input
        (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "R$ 0,00";
      }
    });
  }

  confirmGravarEditarValores() {
    const novoValor = (document.getElementById("subTotalValores") as HTMLInputElement).value.replace('R$', '');
    const objeto = this.objectModalEditarValores;

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
      default: {
      }
    }

    this.resetModalEditarValores;
    this.closeModal();
  }

  setModalEditarValores(valor, evento, objeto) {
    (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "R$ 0,00";
    (<HTMLInputElement>document.getElementById("subTotalValores")).value = "R$ 0,00";

    this.eventModalEditarValores = (evento == "reset" ? this.eventModalEditarValores : evento);
    this.objectModalEditarValores = (evento == "reset" ? this.objectModalEditarValores : objeto);

    const valorAtual = parseFloat(formatRealNumber(valor));

    (<HTMLInputElement>document.getElementById("subTotalValores")).value =
      valorAtual.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
  }

  resetModalEditarValores() {
    this.objectModalEditarValores = null;
    (<HTMLInputElement>document.getElementById("inputNovoValor")).value = "R$ 0,00";
    (<HTMLInputElement>document.getElementById("subTotalValores")).value = "R$ 0,00";
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
