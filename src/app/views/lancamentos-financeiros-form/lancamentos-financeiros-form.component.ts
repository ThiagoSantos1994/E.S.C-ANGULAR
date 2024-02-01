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
  private detalheDespesaMensal: DetalheLancamentosMensais;

  private pesquisaForm: FormGroup;
  private modalCriarEditarReceitaForm: FormGroup;
  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalCategoriaDetalheDespesaForm: FormGroup;
  private modalDetalheDespesasMensaisForm: FormGroup;
  private modalEditarValoresForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaReferencia: number;
  private receitaSelecionada: DespesasFixasMensais;

  private valorReceitaControl = new FormControl();
  private subTotalValoresControl = new FormControl();
  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";

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
      valorLimiteDespesa: ['0,00'],
      checkDespesaRelatorio: [false]
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

    this.modalEditarValoresForm = this.formBuilder.group({
      inputNovoValor: ['']
    })
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

  abrirDetalheDespesa(despesa: LancamentosMensais) {
    this.lancamentosService.getDetalheDespesasMensais(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).subscribe((res) => {
      this.detalheDespesaMensal = res;

      this.modalDetalheDespesasMensaisForm.setValue({
        nomeDespesa: (res.despesaMensal.dsNomeDespesa),
        valorLimiteDespesa: (res.despesaMensal.vlLimite),
        checkDespesaRelatorio: ('S')
      });
    });
  }

  onQuitarDespesa() {
    const despesas = this.getDespesasChecked();

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
    const despesas = this.getDespesasChecked();

    //let observacaoPagamento: string = this.modalConfirmacaoQuitarDespesasForm.get('observacaoPagamento').value;

    despesas.forEach((d) => {
      this.lancamentosService.processarPagamentoDespesa(d.idDespesa, d.idDetalheDespesa, null).toPromise().then(() => { },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
    this.carregarDespesas();
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

    this.lancamentosService.gravarDespesaMensal(request).toPromise().then(() => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
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

      this.lancamentosService.excluirDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(() => { },
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
    const detalheDespesa = this.detalheDespesaMensal.despesaMensal;

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
    const eventoSelecionado = this.eventModalConfirmacao;

    if (eventoSelecionado == "ImportacaoLancamentos") {
      this.confirmImportacaoLancamentos();
    } else if (eventoSelecionado == "ExcluirReceitaSelecionada") {
      this.confirmExcluirReceita();
    } else if (eventoSelecionado == "ExcluirTodosLancamentos") {
      this.confirmExcluirTodosLancamentos();
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

  onNovoValor() {
    const novoValor = this.modalEditarValoresForm.get('inputNovoValor').value;
    console.log(novoValor);
    this.subTotalValoresControl.setValue(novoValor);
    /*var input = document.getElementById("inputNovoValor");
    input.addEventListener('keyup', function (e) {
      var key = e.which || e.keyCode;
      if (key == 13) { 
        const calculo = (1000 + novoValor);
        document.getElementById("inputNovoValor").value = "";
        calculoSubTotalEditorValores(calculo);
      }
    });*/

    
  }

  calculoSubTotalEditor(novoValor) {
    this.subTotalValoresControl.setValue(novoValor);
  }

  getDespesasChecked() {
    return this._despesasCheckbox.getValue().filter((d) => d.checked === true);
  }

  resetDespesasCheckbox() {
    this._despesasCheckbox.next([]);
    /*const despesas = this._despesasCheckbox.getValue();
    despesas.forEach((d) => d.checked = false);
    this.set(despesas);*/
  }

  /*set(despesas: LancamentosMensais[]) {
    this._despesasCheckbox.next(despesas);
  }*/


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

function calculoSubTotalEditorValores(calculo: any) {
  this.subTotalValoresControl.setValue(calculo);
}

