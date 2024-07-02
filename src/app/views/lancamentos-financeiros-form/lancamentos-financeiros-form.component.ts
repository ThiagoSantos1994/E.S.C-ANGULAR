import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable } from 'rxjs';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from 'src/app/core/interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais.interface';
import { DetalheDespesasService } from 'src/app/core/services/detalhe-despesas.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {
  private lancamentosFinanceiros$: Observable<LancamentosFinanceiros[]>;
  private lancamentosMensais: LancamentosMensais[];
  private _despesasCheckbox = new BehaviorSubject<LancamentosMensais[]>([]);

  private pesquisaForm: FormGroup;
  private checkDespesasForm: FormGroup;
  private modalCriarEditarReceitaForm: FormGroup;
  private modalParametrizacaoForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaRef: number;
  private receitaSelecionada: DespesasFixasMensais;
  private parametrizacoes: ConfiguracaoLancamentos;

  private valorReceitaControl = new FormControl();
  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";
  private checkboxesMarcadas: Boolean = false;

  @ViewChild('modalConfirmacaoExcluirDespesa') modalConfirmacaoExcluirDespesa;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;
  @ViewChild('modalCategoriaDetalheDespesa') modalCategoriaDetalheDespesa;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private lancamentosService: LancamentosFinanceirosService,
    private detalheService: DetalheDespesasService,
    private modalService: BsModalService
  ) { }

  ngOnInit() {
    this.parametrizacoes = {
      dataViradaMes: null,
      mesReferencia: null,
      idFuncionario: null,
      bviradaAutomatica: null,
      qtdeLembretes: null,
      anosReferenciaFiltro: []
    }

    this.carregarConfiguracaoLancamentos();

    this.modalCriarEditarReceitaForm = this.formBuilder.group({
      nomeReceita: ['', Validators.required],
      tipoReceita: ['', Validators.required],
      checkDespesaObrigatoria: ['']
    });

    this.pesquisaForm = this.formBuilder.group({
      cbMes: [this.getMesAtual(), Validators.required],
      cbAno: [this.getAnoAtual(), Validators.required]
    });

    this.lancamentosService.recebeMensagem().subscribe(() => {
      this.carregarDespesas();
    }, () => {
      alert('Ocorreu um erro ao carregar as informações da despesa, tente novamente mais tarde.')
    });
  }

  carregarDespesas() {
    this.receitaSelecionada = null;
    this.resetDespesasCheckbox();
    this.carregarLancamentosFinanceiros();
    this.sessao.validarSessao();
  }

  carregarLancamentosFinanceiros() {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;

    this.lancamentosService.getLancamentosFinanceiros(mes, ano).subscribe((res: any) => {
      this.lancamentosFinanceiros$ = res;
      this.lancamentosMensais = res.lancamentosMensais;
      this.despesaRef = res.idDespesa;
    });
  }

  carregarConfiguracaoLancamentos() {
    this.lancamentosService.getConfiguracaoLancamentos().toPromise().then((res: ConfiguracaoLancamentos) => {
      this.parametrizacoes = res;
      
      let mesReferencia = (res.mesReferencia <= 9 ? "0".concat(res.mesReferencia.toString()) : res.mesReferencia);

      this.pesquisaForm = this.formBuilder.group({
        cbMes: [mesReferencia, Validators.required],
        cbAno: [this.getAnoAtual(), Validators.required]
      });

      this.checkDespesasForm = this.formBuilder.group({
        checkMarcarTodasDespesas: [false]
      });

      this.modalParametrizacaoForm = this.formBuilder.group({
        dataVirada: [res.dataViradaMes, Validators.required],
        checkViradaAutomatica: [res.bviradaAutomatica, Validators.required]
      });

      this.lancamentosFinanceiros$ = null;
      this.lancamentosMensais = null;
      this.carregarLancamentosFinanceiros();
    },
      err => {
        console.log(err);
      });
  }

  /* -------------- Receitas Fixas Mensais -------------- */
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
    
    if (null == this.valorReceitaControl.value) {
      alert('O Valor da receita não pode estar em branco ou vazio.');
      return;
    }

    let checkDespesaObrigatoria = this.modalCriarEditarReceitaForm.get('checkDespesaObrigatoria').value;
    let ordem = (null != this.receitaSelecionada ? this.receitaSelecionada.idOrdem : null);

    let request: DespesasFixasMensais = {
      idDespesa: this.despesaRef,
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
    let receita = this.receitaSelecionada;

    this.lancamentosService.excluirReceita(receita.idDespesa, receita.idOrdem).toPromise().then(() => {
      this.carregarDespesas();
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

  /* -------------- Despesas Fixas Mensais -------------- */
  confirmExcluirTodosLancamentos() {
    this.lancamentosService.excluirTodosLancamentos(this.despesaRef).toPromise().then(() => {
      this.carregarDespesas();
      alert("Lançamentos excluido com sucesso!");
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

  onDesfazerQuitacaoDespesa() {
    let despesas = this.getDespesasCheckedSemLinhaSeparacao();

    if (despesas.length === 0) {
      alert("Necessário marcar alguma despesa para desfazer o pagamento.");
    } else {
      this.eventModalConfirmacao = "DesfazerQuitacaoLancamentos";
      this.mensagemModalConfirmacao = "Deseja *DESFAZER* o pagamento  da(s) despesa(s) selecionadas(s) ?";

      this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
    }
  }

  confirmDesfazerQuitacaoDespesas() {
    let despesas = this.getDespesasCheckedSemLinhaSeparacao();

    this.lancamentosService.desfazerPagamentoDespesa(despesas).toPromise().then(() => {
      this.closeModal();
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  onQuitarDespesa() {
    let despesas = this.getDespesasChecked();

    if (despesas.length === 0) {
      alert("Necessário marcar alguma despesa para pagar.");
    } else {
      this.eventModalConfirmacao = "QuitarLancamentos";
      this.mensagemModalConfirmacao = "Deseja quitar a(s) despesa(s) selecionadas(s) ?";

      this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
    }
  }

  confirmQuitarDespesas() {
    let despesas = this.getDespesasCheckedSemLinhaSeparacao();

    this.lancamentosService.processarPagamentoDespesa(despesas).toPromise().then(() => {
      this.closeModal();
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

  onNovaLinhaSeparacao() {
    let request = this.obterNovaDespesaObjeto(-1);
    request.tpLinhaSeparacao = 'S';

    this.gravarDespesa(request);
  }

  onNovaDespesa() {
    if (null == this.despesaRef) {
      alert("Necessário primeiro criar uma nova receita.");
    } else {
      this.carregarDetalheDespesa(this.despesaRef, null, -1)
    }
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

  gravarDespesa(despesa: DespesaMensal) {
    this.lancamentosService.gravarDespesaMensal(despesa).toPromise().then(() => {
      this.carregarDespesas();
    },
      err => {
        console.log(err);
      });
  }

  onExcluirDespesa() {
    let despesas = this.getDespesasChecked();

    if (despesas.length === 0) {
      alert("Necessário marcar alguma despesa para excluir.");
    } else {
      this.modalRef = this.modalService.show(this.modalConfirmacaoExcluirDespesa);
    }
  }

  confirmExcluirDespesas() {
    let despesas = this.getDespesasChecked();

    despesas.forEach((despesa) => {
      this.lancamentosService.excluirDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(() => { },
        err => {
          console.log(err);
        });

      this.detalheService.excluirDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, -1).toPromise().then(() => { },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
    this.carregarDespesas();
  }

  processarImportacao() {
    this.eventModalConfirmacao = "ImportacaoLancamentos";
    this.mensagemModalConfirmacao = (this.despesaRef !== null ?
      "ATENÇÃO: Neste mês esta despesa ja foi processada, deseja atualizar os lançamentos?" :
      "Deseja realizar o processamento da despesa mensal para este mês?");

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  confirmImportacaoLancamentos() {
    let idDespesa = (this.despesaRef !== null ? this.despesaRef : 0);
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

  gravarParametrizacao() {
    let request: ConfiguracaoLancamentos = {
      dataViradaMes: this.modalParametrizacaoForm.get('dataVirada').value,
      bviradaAutomatica: this.modalParametrizacaoForm.get('checkViradaAutomatica').value,
      idFuncionario: Number(this.sessao.getIdLogin())
    };

    this.lancamentosService.gravarParametrizacao(request).toPromise().then(() => {
      alert('Parametros gravados com sucesso!');
    },
      err => {
        alert('Ocorreu um erro ao gravar as parametrizações, tente novamente mais tarde.');
      });
  }

  excluirTodosLancamentos() {
    this.eventModalConfirmacao = "ExcluirTodosLancamentos";
    this.mensagemModalConfirmacao = "Atenção: Deseja realmente excluir todos os lançamentos mensais?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  obterDetalhesLabelQuitacaoMes() {
    this.lancamentosService.obterExtratoDespesaQuitacaoMes(this.despesaRef).toPromise().then((res) => {
      alert('CONSULTA DE DESPESAS Á QUITAR: \r\n \r\nValor R$   -   DESCRIÇÃO \r\n \r\n' + res.relatorioDespesas);
    },
      err => {
        alert('Ocorreu um erro ao obter os dados do extrato de quitação, tente novamente mais tarde.');
      });
  }

  visualizarDespesasMesAnterior() {
    this.validarMesPesquisa("-");
    this.carregarDespesas();
  }

  visualizarDespesasMesPosterior() {
    this.validarMesPesquisa("+");
    this.carregarDespesas();
  }

  validarMesPesquisa(ref: String) {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;

    mes = (ref == "+" ? (parseInt(mes) + 1) : (parseInt(mes) - 1));
    mes = (mes <= 9 ? "0".concat(mes) : mes);

    if (mes <= 0) {
      mes = "01";
    } else if (mes == 13) {
      mes = "12";
    }

    this.pesquisaForm = this.formBuilder.group({
      cbMes: [mes, Validators.required],
      cbAno: [ano, Validators.required]
    });
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
      case 'QuitarLancamentos': {
        this.confirmQuitarDespesas();
        break;
      }
      case 'DesfazerQuitacaoLancamentos': {
        this.confirmDesfazerQuitacaoDespesas();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  onCheckDespesaChange(checked, despesa) {
    despesa.checked = checked;

    let despesas = this._despesasCheckbox.getValue();
    let index = despesas.findIndex((d) => d.idDetalheDespesa === despesa.idDetalheDespesa);

    if (index >= 0) {
      despesas[index].checked = checked;
    } else {
      despesas.push({ ...despesa });
    }

    this._despesasCheckbox.next(despesas);
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.changeCheckBoxesDespesas(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  changeCheckBoxesDespesas(checked: boolean) {
    this.resetDespesasCheckbox();
    let despesas = this._despesasCheckbox.getValue();

    this.lancamentosMensais.forEach(despesa => {
      despesa.checked = checked;
      despesas.push({ ...despesa });
    });

    this._despesasCheckbox.next(despesas);
  }

  getDespesasChecked() {
    return this._despesasCheckbox.getValue().filter((d) => d.checked === true);
  }

  getDespesasCheckedSemLinhaSeparacao() {
    return this._despesasCheckbox.getValue().filter((d) => d.checked === true && d.tpLinhaSeparacao == 'N');
  }

  resetDespesasCheckbox() {
    this._despesasCheckbox.next([]);
  }

  /* -------------- Modal Detalhe Despesas Mensais -------------- */
  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.detalheService.enviaMensagem(idDespesa, idDetalheDespesa, ordemExibicao, Number(this.sessao.getIdLogin()), this.pesquisaForm.get('cbMes').value, this.pesquisaForm.get('cbAno').value);
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