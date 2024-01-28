import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
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
  private detalheLancamentos: DetalheLancamentosMensais;

  private pesquisaForm: FormGroup;
  private modalCriarEditarReceitaForm: FormGroup;
  private modalConfirmacaoQuitarDespesasForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaReferencia: number;
  private receitaSelecionada: DespesasFixasMensais;
  private tituloDespesa: String = "";
  private mensagemConfirmacaoImportacao = "";

  private valorReceitaControl = new FormControl();
  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";

  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais;
  @ViewChild('modalCriarEditarReceita') modalCriarEditarReceita;
  @ViewChild('modalConfirmacaoExcluirDespesa') modalConfirmacaoExcluirDespesa;
  @ViewChild('modalConfirmacaoQuitarDespesas') modalConfirmacaoQuitarDespesas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

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

  carregarDetalheDespesas(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.lancamentosService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      this.detalheLancamentos = res;
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
      err => {
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

    this.lancamentosService.gravarReceita(request).toPromise().then(res => {
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

    this.lancamentosService.excluirReceita(receita.idDespesa, receita.idOrdem).toPromise().then(res => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  confirmExcluirTodosLancamentos() {
    this.lancamentosService.excluirTodosLancamentos(this.despesaReferencia).toPromise().then(res => {
      this.carregarDespesas();
      alert("Lançamentos excluido com sucesso!");
    },
      err => {
        console.log(err);
      });
  }

  atualizarOrdemLinhaReceitaService(idDespesa: number, iOrdemAtual: number, iNovaOrdem) {
    this.lancamentosService.atualizarOrdemLinhaReceita(idDespesa, iOrdemAtual, iNovaOrdem).toPromise().then(res => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  atualizarOrdemLinhaDespesaService(idDespesa: number, iOrdemAtual: number, iNovaOrdem) {
    this.lancamentosService.atualizarOrdemLinhaDespesa(idDespesa, iOrdemAtual, iNovaOrdem).toPromise().then(res => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  abrirDespesa(despesa: LancamentosMensais) {
    this.tituloDespesa = despesa.dsTituloDespesa;
    this.carregarDetalheDespesas(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao);
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
      this.lancamentosService.processarPagamentoDespesa(d.idDespesa, d.idDetalheDespesa, null).toPromise().then(res => { },
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

    this.lancamentosService.gravarDespesaMensal(request).toPromise().then(res => {
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
      this.lancamentosService.excluirDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(res => { },
        err => {
          console.log(err);
        });

      this.lancamentosService.excluirDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(res => { },
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

    this.lancamentosService.processarImportacaoLancamentos(idDespesa, mesReferencia, anoReferencia).toPromise().then(res => {
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
      //despesas.slice(index, 1); quando for para alterar o objeto inteiro
      despesas[index].checked = checked;
    } else {
      despesas.push({ ...despesa });
    }

    this._despesasCheckbox.next(despesas);
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
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }

  getAnoAtual() {
    return formatDate(Date.now(), 'yyyy', 'en-US');
  }
}
