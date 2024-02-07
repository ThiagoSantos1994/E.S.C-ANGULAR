import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoriaDespesaEnum, StatusPagamentoEnum } from 'src/app/core/enums/detalhe-despesas-enums';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { DetalheDespesasMensais } from 'src/app/core/interfaces/detalhe-despesas-mensais.interface';
import { LancamentosFinanceiros } from 'src/app/core/interfaces/lancamentos-financeiros.interface';
import { DetalheLancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais-detalhe.interface';
import { LancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais.interface';
import { PagamentoDespesasRequest } from 'src/app/core/interfaces/pagamento-despesas-request.interface';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {

  private lancamentosFinanceiros$: Observable<LancamentosFinanceiros[]> = new Observable<LancamentosFinanceiros[]>();
  private _despesasCheckbox = new BehaviorSubject<LancamentosMensais[]>([]);
  private _detalheDespesasChange = new BehaviorSubject<DetalheDespesasMensais[]>([]);
  private detalheLancamentosMensais: DetalheLancamentosMensais;

  private pesquisaForm: FormGroup;
  private modalCriarEditarReceitaForm: FormGroup;
  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalCategoriaDetalheDespesaForm: FormGroup;
  private modalDetalheDespesasMensaisForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaReferencia: number;
  private receitaSelecionada: DespesasFixasMensais;

  private valorReceitaControl = new FormControl();
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
    private lancamentosService: LancamentosFinanceirosService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.carregarConfiguracaoLancamentos();

    this.modalCriarEditarReceitaForm = this.formBuilder.group({
      nomeReceita: ['', Validators.required],
      tipoReceita: ['', Validators.required],
      checkDespesaObrigatoria: ['']
    });

    this.modalConfirmacaoQuitarDespesasForm = this.formBuilder.group({
      observacaoPagamento: ['']
    });

    this.pesquisaForm = this.formBuilder.group({
      cbMes: [this.getMesAtual(), Validators.required],
      cbAno: [this.getAnoAtual(), Validators.required]
    });

    this.modalDetalheDespesasMensaisForm = this.formBuilder.group({
      nomeDespesa: [''],
      checkLimiteMesAnterior: ['']
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
  }

  carregarDespesas() {
    this.receitaSelecionada = null;
    this.resetDespesasCheckbox();
    this.carregarLancamentosFinanceiros();
  }

  carregarLancamentosFinanceiros() {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;

    this.lancamentosService.getLancamentosFinanceiros(mes, ano).subscribe((res: any) => {
      this.lancamentosFinanceiros$ = res;
      this.despesaReferencia = res.idDespesa;
    });
  }

  carregarConfiguracaoLancamentos() {
    this.lancamentosService.getConfiguracaoLancamentos().toPromise().then((res: ConfiguracaoLancamentos) => {
      let mesReferencia = (res.mesReferencia <= 9 ? "0".concat(res.mesReferencia.toString()) : res.mesReferencia);

      this.pesquisaForm = this.formBuilder.group({
        cbMes: [mesReferencia, Validators.required],
        cbAno: [this.getAnoAtual(), Validators.required]
      });

      this.carregarLancamentosFinanceiros();
    },
      () => {
        alert('Ocorreu um erro ao obter os lancamentos mensais, tente novamente mais tarde.');
      });
  }

  /* Receitas Fixas Mensais*/
  subirLinhaReceita(receita: DespesasFixasMensais) {
    let iOrdemAtual = receita.idOrdem;
    let iNovaOrdem = (receita.idOrdem - 1);

    this.atualizarOrdemLinhaReceitaService(receita.idDespesa, iOrdemAtual, iNovaOrdem);
  }

  descerLinhaReceita(receita: DespesasFixasMensais) {
    let iOrdemAtual = receita.idOrdem;
    let iNovaOrdem = (receita.idOrdem + 1);

    this.atualizarOrdemLinhaReceitaService(receita.idDespesa, iOrdemAtual, iNovaOrdem);
  }

  setReceitaSelecionada(receita: DespesasFixasMensais) {
    this.receitaSelecionada = receita;
  }

  editarReceitaSelecionada(receita: DespesasFixasMensais) {
    this.setReceitaSelecionada(receita);

    this.valorReceitaControl.setValue(receita.dvlTotal);

    this.modalCriarEditarReceitaForm.setValue({
      nomeReceita: receita.dsDescricao,
      tipoReceita: receita.tpStatus,
      checkDespesaObrigatoria: (receita.tpFixasObrigatorias == "S" ? true : false)
    });
  }

  resetModalCriarEditarReceita() {
    this.receitaSelecionada = null;
    this.valorReceitaControl.setValue(null);
    this.modalCriarEditarReceitaForm.setValue({
      nomeReceita: '',
      tipoReceita: '+',
      checkDespesaObrigatoria: true
    });
  }

  gravarReceita() {
    let checkDespesaObrigatoria = this.modalCriarEditarReceitaForm.get('checkDespesaObrigatoria').value;
    let ordem = (null != this.receitaSelecionada ? this.receitaSelecionada.idOrdem : null);

    let request: DespesasFixasMensais = {
      idDespesa: this.despesaReferencia,
      dsDescricao: this.modalCriarEditarReceitaForm.get('nomeReceita').value,
      tpStatus: this.modalCriarEditarReceitaForm.get('tipoReceita').value,
      dvlTotal: this.valorReceitaControl.value,
      dsMes: this.pesquisaForm.get('cbMes').value,
      dsAno: this.pesquisaForm.get('cbAno').value,
      idFuncionario: Number(this.sessao.getIdLogin()),
      idOrdem: ordem,
      tpFixasObrigatorias: (checkDespesaObrigatoria == true ? 'S' : 'N'),
      tpDespesaDebitoCartao: 'N'
    };

    this.lancamentosService.gravarReceita(request).toPromise().then(() => {
      this.resetModalCriarEditarReceita();
      this.carregarDespesas();
    },
      err => {
        alert("Desculpe, ocorreu um erro no servidor. Tente novamente!")
        console.log(err);
      });
  }

  onReceitaSelecionada(receita: DespesasFixasMensais) {
    this.setReceitaSelecionada(receita);

    this.eventModalConfirmacao = "ExcluirReceitaSelecionada";
    this.mensagemModalConfirmacao = "Deseja realmente excluir o item: ".concat(receita.dsDescricao).concat(" ?");

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmExcluirReceita() {
    const receita = this.receitaSelecionada;

    this.lancamentosService.excluirReceita(receita.idDespesa, receita.idOrdem).toPromise().then(() => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  confirmExcluirTodosLancamentos() {
    this.lancamentosService.excluirTodosLancamentos(this.despesaReferencia).toPromise().then(() => {
      this.carregarDespesas();
      alert("Lançamentos excluido com sucesso!");
    },
      err => {
        console.log(err);
      });
  }

  atualizarOrdemLinhaReceitaService(idDespesa: number, iOrdemAtual: number, iNovaOrdem) {
    this.lancamentosService.atualizarOrdemLinhaReceita(idDespesa, iOrdemAtual, iNovaOrdem).toPromise().then(() => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  atualizarOrdemLinhaDespesaService(idDespesa: number, iOrdemAtual: number, iNovaOrdem) {
    this.lancamentosService.atualizarOrdemLinhaDespesa(idDespesa, iOrdemAtual, iNovaOrdem).toPromise().then(() => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.resetDetalheDespesasChange();

    this.lancamentosService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      this.detalheLancamentosMensais = res;
      this.setDetalheDespesaMensalObservable(res.detalheDespesaMensal);

      (<HTMLInputElement>document.getElementById("valorLimiteDespesa")).value = res.despesaMensal.vlLimiteExibicao;

      this.modalDetalheDespesasMensaisForm.setValue({
        nomeDespesa: (res.despesaMensal.dsNomeDespesa),
        checkLimiteMesAnterior: (res.despesaMensal.tpReferenciaSaldoMesAnterior == "S" ? true : false)
      });
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

  onQuitarDespesa(evento) {
    const despesas = (evento == 'despesa' ? this.getDespesasChecked() : this.getDetalheDespesasCheckedPagamento());
    this.eventModalConfirmacao = evento;

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

    if (this.eventModalConfirmacao == 'despesa') {
      const despesas = this.getDespesasChecked();

      despesas.forEach((d) => {
        this.lancamentosService.processarPagamentoDespesa(d.idDespesa, d.idDetalheDespesa, null).toPromise().then(() => { },
          err => {
            console.log(err);
          });
      });

    } else if (this.eventModalConfirmacao == 'detalheDespesa') {
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

        this.lancamentosService.processarPagamentoDetalheDespesa(request).toPromise().then(() => {
          d.tpStatus = 'Pago'
          d.vlTotalPago = d.vlTotal;
          d.dsObservacao = (d.dsObservacao.trim() == "" ? observacaoPagamento : d.dsObservacao);

          this.changeDetalheDespesasMensais(d);
        },
          err => {
            console.log(err);
          });
      });
    }

    this.closeModal();
    this.carregarDespesas();
  }

  carregarDetalheDespesaAberta() {
    const despesaMensal = this.detalheLancamentosMensais.despesaMensal;
    this.carregarDetalheDespesa(despesaMensal.idDespesa, despesaMensal.idDetalheDespesa, despesaMensal.idOrdemExibicao);
  }

  onNovaLinhaSeparacao() {
    let request: DespesaMensal = {
      idDespesa: this.despesaReferencia,
      idDetalheDespesa: -1,
      tpReprocessar: 'N',
      tpLinhaSeparacao: 'S',
      idFuncionario: Number(this.sessao.getIdLogin()),
      tpDespesaCompartilhada: 'N'
    };

    this.gravarDespesa(request);
  }

  gravarCategoriaDespesa() {
    let request = this.detalheLancamentosMensais.despesaMensal;

    request.tpAnotacao = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaRascunho').value == true ? "S" : "N");
    request.tpRelatorio = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaRelatorio').value == true ? "S" : "N");
    request.tpDebitoAutomatico = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaDebitoAutomatico').value == true ? "S" : "N");
    request.tpDebitoCartao = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaDebitoCartao').value == true ? "S" : "N");
    request.tpPoupanca = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaPoupancaPositiva').value == true ? "S" : "N");
    request.tpPoupancaNegativa = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaPoupancaNegativa').value == true ? "S" : "N");
    request.tpEmprestimo = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaEmprestimoAReceber').value == true ? "S" : "N");
    request.tpEmprestimoAPagar = (this.modalCategoriaDetalheDespesaForm.get('checkDespesaEmprestimoAPagar').value == true ? "S" : "N");

    this.gravarDespesa(request);
  }

  subirLinhaDespesa(despesa: DespesaMensal) {
    let iOrdemAtual = despesa.idOrdemExibicao;
    let iNovaOrdem = (despesa.idOrdemExibicao - 1);

    this.atualizarOrdemLinhaDespesaService(despesa.idDespesa, iOrdemAtual, iNovaOrdem);
  }

  descerLinhaDespesa(despesa: DespesaMensal) {
    let iOrdemAtual = despesa.idOrdemExibicao;
    let iNovaOrdem = (despesa.idOrdemExibicao + 1);

    this.atualizarOrdemLinhaDespesaService(despesa.idDespesa, iOrdemAtual, iNovaOrdem);
  }

  adicionarDespesaMensal() {
    alert('Adicionando')
  }

  onExcluirDespesa() {
    const despesas = this.getDespesasChecked();

    if (despesas.length === 0) {
      alert("Necessário marcar alguma despesa para excluir.");
    } else {
      this.modalRef = this.modalService.show(this.modalConfirmacaoExcluirDespesa);
    }
  }

  confirmExcluirDespesas() {
    const despesas = this.getDespesasChecked();

    despesas.forEach((despesa) => {
      this.lancamentosService.excluirDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(() => { },
        err => {
          console.log(err);
        });

      this.lancamentosService.excluirDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, -1).toPromise().then(() => { },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
    this.carregarDespesas();
  }

  processarImportacao() {
    this.eventModalConfirmacao = "ImportacaoLancamentos";
    this.mensagemModalConfirmacao = (this.despesaReferencia !== null ?
      "ATENÇÃO: Neste mês esta despesa ja foi processada, deseja atualizar os lançamentos?" :
      "Deseja realizar o processamento da despesa mensal para este mês?");

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmImportacaoLancamentos() {
    let idDespesa = (this.despesaReferencia !== null ? this.despesaReferencia : 0);
    let mesReferencia = this.pesquisaForm.get('cbMes').value;
    let anoReferencia = this.pesquisaForm.get('cbAno').value;

    this.lancamentosService.processarImportacaoLancamentos(idDespesa, mesReferencia, anoReferencia).toPromise().then(() => {
      this.carregarDespesas();
      alert("Processamento concluido com sucesso!");
    },
      err => {
        console.log(err);
      });
  }

  excluirTodosLancamentos() {
    this.eventModalConfirmacao = "ExcluirTodosLancamentos";
    this.mensagemModalConfirmacao = "Atenção: Deseja realmente excluir todos os lançamentos mensais?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
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

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'ImportacaoLancamentos': {
        this.confirmImportacaoLancamentos();
        break;
      }
      case 'ExcluirReceitaSelecionada': {
        this.confirmExcluirReceita();
        break;
      }
      case 'ExcluirTodosLancamentos': {
        this.confirmExcluirTodosLancamentos();
        break;
      }
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
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  onCheckDespesaChange(checked, despesa) {
    despesa.checked = checked;

    const despesas = this._despesasCheckbox.getValue();
    const index = despesas.findIndex((d) => d.idDetalheDespesa === despesa.idDetalheDespesa);

    if (index >= 0) {
      despesas[index].checked = checked;
    } else {
      despesas.push({ ...despesa });
    }

    this._despesasCheckbox.next(despesas);
  }

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
    this.eventModalConfirmacao = "GravarDetalheDespesas";
    this.mensagemModalConfirmacao = "Deseja salvar as alterações ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  gravarDespesa(despesa: DespesaMensal) {
    despesa.dsNomeDespesa = this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    if (despesa.tpReferenciaSaldoMesAnterior == "N") {
      let valorLimiteDespesa = formatRealNumber((document.getElementById("valorLimiteDespesa") as HTMLInputElement).value);

      if (valorLimiteDespesa == "NaN" || valorLimiteDespesa == "0") {
          alert('Necessário informar o valor Limite Despesa para gravar a despesa.');
          return;
      }

      despesa.vlLimite = valorLimiteDespesa;
    }
    
    this.lancamentosService.gravarDespesaMensal(despesa).toPromise().then(() => {
      this.carregarDespesas();
      this.carregarDetalheDespesaAberta();
    },
      err => {
        console.log(err);
      });
  }

  confirmGravarDetalheDespesas() {
    const despesas = this.getDetalheDespesasChange();

    despesas.forEach((d) => {
      d.dsDescricao = d.dsTituloDespesa;
      d.vlTotal = d.vlTotal.replace('.', '');
      d.vlTotalPago = d.vlTotalPago.replace('.', '');

      this.lancamentosService.gravarDetalheDespesa(d).toPromise().then(() => { },
        err => {
          console.log(err);
        });
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
      this.lancamentosService.excluritemDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdem).toPromise().then(() => {
        this.carregarDetalheDespesaAberta();
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
    this.carregarDespesas();
  }

  confirmOrganizarRegistrosDetalheDespesa() {
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

    this.lancamentosService.organizarListaItensDetalheDespesa(detalheDespesa.idDespesa, detalheDespesa.idDetalheDespesa).toPromise().then(() => {
      this.carregarDetalheDespesaAberta();
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

      this.lancamentosService.gravarDetalheDespesa(d).toPromise().then(() => {
        this.changeDetalheDespesasMensais(d);
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
    this.carregarDespesas();
  }

  atualizarOrdemLinhaDetalheDespesa(acao, objeto) {
    const ordemAtual = objeto.idOrdem;

    let novaOrdem = (acao == "UP" ? (objeto.idOrdem - 1) : (objeto.idOrdem + 1));
    if (novaOrdem <= 0) {
      novaOrdem = 1;
    }

    this.lancamentosService.atualizarOrdemLinhaDetalheDespesa(objeto.idDespesa, objeto.idDetalheDespesa, ordemAtual, novaOrdem).toPromise().then(() => {
      this.carregarDetalheDespesaAberta();
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

  getDespesasChecked() {
    return this._despesasCheckbox.getValue().filter((d) => d.checked === true);
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

  resetDespesasCheckbox() {
    this._despesasCheckbox.next([]);
  }

  resetDetalheDespesasChange() {
    this._detalheDespesasChange.next([]);
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

  addNovaLinhaDetalheDespesa(isLinhaSeparacao: boolean) {
    const detalheDespesa = this.detalheLancamentosMensais.despesaMensal;

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
      tpLinhaSeparacao: (isLinhaSeparacao ? 'S' : 'N'),
      tpParcelaAdiada: 'N',
      tpParcelaAmortizada: 'N',
      changeValues: false
    };

    this.lancamentosService.gravarDetalheDespesa(novoItem).toPromise().then(() => {
      this.carregarDetalheDespesaAberta();
    },
      err => {
        console.log(err);
      });
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
