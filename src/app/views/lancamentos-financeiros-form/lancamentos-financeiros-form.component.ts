import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Observable } from 'rxjs';
import { TipoMensagem } from 'src/app/core/enums/tipo-mensagem-enums';
import { CategoriaDespesasResponse } from 'src/app/core/interfaces/categoria-despesa-response.interface';
import { ConfiguracaoLancamentos } from 'src/app/core/interfaces/configuracao-lancamentos.interface';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from 'src/app/core/interfaces/lancamentos-financeiros.interface';
import { LancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais.interface';
import { DetalheDespesasService } from 'src/app/core/services/detalhe-despesas.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { LoginService } from 'src/app/core/services/login.service';
import { MensagemService } from 'src/app/core/services/mensagem.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {
  private lancamentosFinanceiros$: Observable<LancamentosFinanceiros[]>;
  private lancamentosMensais: LancamentosMensais[];
  private categoriaDespesa: CategoriaDespesasResponse;
  private _despesasCheckbox = new BehaviorSubject<LancamentosMensais[]>([]);

  private pesquisaForm: FormGroup;
  private checkDespesasForm: FormGroup;
  private modalCriarEditarReceitaForm: FormGroup;
  private modalParametrizacaoForm: FormGroup;
  private modalAutenticacaoForm: FormGroup;
  private modalRef: BsModalRef;

  private despesaRef: number;
  private despesaRefCategoria: number;
  private receitaSelecionada: DespesasFixasMensais;
  private parametrizacoes: ConfiguracaoLancamentos;
  private quantidadeTentativasAutenticacao: number;

  private valorReceitaControl = new FormControl();
  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";
  private checkboxesMarcadas: Boolean = false;

  @ViewChild('modalConfirmacaoExcluirDespesa') modalConfirmacaoExcluirDespesa;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;
  @ViewChild('modalCategoriaDetalheDespesa') modalCategoriaDetalheDespesa;
  @ViewChild('modalAutenticacaoUsuario') modalAutenticacaoUsuario;

  constructor(
    private formBuilder: FormBuilder,
    private sessaoService: SessaoService,
    private lancamentosService: LancamentosFinanceirosService,
    private detalheService: DetalheDespesasService,
    private loginService: LoginService,
    private router: Router,
    private modalService: BsModalService,
    private mensagens: MensagemService
  ) { }

  ngOnInit() {
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

    this.modalAutenticacaoForm = this.formBuilder.group({
      usuario: [],
      senha: []
    });

    this.quantidadeTentativasAutenticacao = 2; // 3 tentativas para bloqueio

    this.lancamentosService.recebeMensagem().subscribe(tipo => {
      if (tipo == "recarregarDetalhes") {
        this.carregarDespesas();
      }
    }, () => {
      this.mensagens.enviarMensagem("Ocorreu um erro ao carregar as informações da despesa, tente novamente mais tarde.", TipoMensagem.Erro);
    });
  }

  carregarDespesas() {
    this.receitaSelecionada = null;
    this.resetDespesasCheckbox();
    this.carregarLancamentosFinanceiros();
    this.sessaoService.validarSessao();
  }

  carregarLancamentosFinanceiros() {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;

    this.lancamentosService.getLancamentosFinanceiros(mes, ano).subscribe((res: any) => {
      this.lancamentosFinanceiros$ = res;
      this.lancamentosMensais = res.lancamentosMensais;
      this.despesaRef = res.idDespesa;
      this.carregarCategoriaDespesas(this.despesaRef);
    });
  }

  carregarCategoriaDespesas(idDespesa: number) {
    if (this.despesaRefCategoria == null) {
      this.despesaRefCategoria = idDespesa;
    }

    if (idDespesa != null) {
      this.lancamentosService.getSubTotalCategoriaDespesas(idDespesa).subscribe((res: any) => {
        this.categoriaDespesa = res;
      },
        err => {
          console.log(err);
        });
    }
  }

  visualizarCategoriasMesAnterior() {
    this.carregarCategoriaDespesas(--this.despesaRefCategoria);
  }

  visualizarCategoriasMesSeguinte() {
    this.carregarCategoriaDespesas(++this.despesaRefCategoria);
  }

  carregarConfiguracaoLancamentos() {
    this.inicializarVariaveis();

    this.lancamentosService.getConfiguracaoLancamentos().subscribe((res: ConfiguracaoLancamentos) => {
      this.parametrizacoes = res;
      let mesReferencia = (res.mesReferencia <= 9 ? "0".concat(res.mesReferencia.toString()) : res.mesReferencia);
      let anoReferencia = (null == res.anoReferencia ? this.getAnoAtual() : res.anoReferencia.toString());

      this.pesquisaForm = this.formBuilder.group({
        cbMes: [mesReferencia, Validators.required],
        cbAno: [anoReferencia, Validators.required]
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

  inicializarVariaveis() {
    this.parametrizacoes = {
      dataViradaMes: null,
      mesReferencia: null,
      idFuncionario: null,
      bviradaAutomatica: null,
      qtdeLembretes: null,
      anosReferenciaFiltro: []
    };

    this.categoriaDespesa = {
      categorias: null,
      mesAnoReferencia: ""
    };
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

    setarFocoCampo('nomeReceita');
  }

  resetModalCriarEditarReceita() {
    this.receitaSelecionada = null;
    this.valorReceitaControl.setValue("0.00");
    this.modalCriarEditarReceitaForm.setValue({
      nomeReceita: '',
      tipoReceita: '+',
      checkDespesaObrigatoria: true
    });

    setarFocoCampo('nomeReceita');
  }

  gravarReceita() {
    if (this.modalCriarEditarReceitaForm.get('tipoReceita').value == "< X >") {
      this.valorReceitaControl.setValue("0.00");
    } else if (null == this.valorReceitaControl.value) {
      this.mensagens.enviarMensagem("O Valor da receita não pode estar em branco ou vazio.", TipoMensagem.Generica);
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
      idFuncionario: Number(this.sessaoService.getIdLogin()),
      idOrdem: ordem,
      tpFixasObrigatorias: (checkDespesaObrigatoria == true ? 'S' : 'N'),
      tpDespesaDebitoCartao: 'N',
      idDetalheDespesaDebitoCartao: null
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
      this.mensagens.enviarMensagem("Lançamentos excluido com sucesso!", TipoMensagem.Sucesso);
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
      this.mensagens.enviarMensagem("Necessário marcar alguma despesa para desfazer o pagamento.", TipoMensagem.Generica);
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

  confirmExecutarBackup() {
    this.iniciarSpinner();
    this.lancamentosService.executarBackup().subscribe(res => {
      this.fecharSpinner();
      alert(res.mensagem);
      //TODO - Melhorar modal para mensagens grandes.
      //this.mensagens.enviarMensagem(res.mensagem, TipoMensagem.Generica);
    },
      err => {
        this.fecharSpinner();
        console.log(err);
        this.mensagens.enviarMensagem("Ocorreu um erro ao realizar o Backup, contate o desenvolvedor do sistema.", TipoMensagem.Erro);
      });
  }

  onQuitarDespesa() {
    let despesas = this.getDespesasChecked();

    if (despesas.length === 0) {
      this.mensagens.enviarMensagem("Necessário marcar alguma despesa para pagar.", TipoMensagem.Generica);
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
      this.mensagens.enviarMensagem("Necessário primeiro criar uma nova receita.", TipoMensagem.Generica);
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
      idFuncionario: Number(this.sessaoService.getIdLogin()),
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
      this.mensagens.enviarMensagem("Necessário marcar alguma despesa para excluir.", TipoMensagem.Generica);
    } else {
      this.modalRef = this.modalService.show(this.modalConfirmacaoExcluirDespesa);
    }
  }

  confirmValidarAutenticidade() {
    let usuario = this.modalAutenticacaoForm.get('usuario').value;
    let senha = this.modalAutenticacaoForm.get('senha').value;

    if (usuario == "" || senha == "") {
      this.mensagens.enviarMensagem("Necessário digitar o usuario e senha.", TipoMensagem.Generica);
      return;
    }

    this.loginService.autenticar(usuario, senha).toPromise().then(res => {
      this.closeModal();
      this.abrirModalExcluirTodosLancamentos();
    },
      err => {
        if (this.quantidadeTentativasAutenticacao == 0) {
          this.closeModal();
          this.router.navigate(['login']);
        } else if (err.status == 401) {
          this.mensagens.enviarMensagem("A autenticação falhou!, voce possui mais " + (this.quantidadeTentativasAutenticacao--) + " tentativa(s)", TipoMensagem.Alerta);
        }
      });
  }

  confirmExcluirDespesas() {
    let despesas = this.getDespesasChecked();

    despesas.forEach((despesa) => {
      this.lancamentosService.excluirDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao).toPromise().then(() => {
        this.detalheService.excluirDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, -1).toPromise().then(() => { },
          err => {
            console.log(err);
            return;
          });
      },
        err => {
          console.log(err);
          return;
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
    this.iniciarSpinner();

    let idDespesa = (this.despesaRef !== null ? this.despesaRef : 0);
    let mesReferencia = this.pesquisaForm.get('cbMes').value;
    let anoReferencia = this.pesquisaForm.get('cbAno').value;

    this.lancamentosService.processarImportacaoLancamentos(idDespesa, mesReferencia, anoReferencia).toPromise().then(() => {
      this.fecharSpinner();
      this.carregarDespesas();
      this.mensagens.enviarMensagem("Processamento concluido com sucesso!", TipoMensagem.Sucesso);
    },
      err => {
        console.log(err);
      });
  }

  gravarParametrizacao() {
    let request: ConfiguracaoLancamentos = {
      dataViradaMes: this.modalParametrizacaoForm.get('dataVirada').value,
      bviradaAutomatica: this.modalParametrizacaoForm.get('checkViradaAutomatica').value,
      idFuncionario: Number(this.sessaoService.getIdLogin())
    };

    this.lancamentosService.gravarParametrizacao(request).toPromise().then(() => {
      this.mensagens.enviarMensagem("Parametros gravados com sucesso!", TipoMensagem.Sucesso);
    },
      err => {
        this.mensagens.enviarMensagem("Ocorreu um erro ao gravar as parametrizações, tente novamente mais tarde.", TipoMensagem.Erro);
      });
  }

  executarBackup() {
    this.eventModalConfirmacao = "ExecutarBackup";
    this.mensagemModalConfirmacao = "Deseja executar o Backup da Base de Dados?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  excluirTodosLancamentos() {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;
    let isDespesaExistente = (this.despesaRef !== null);

    if (!isDespesaExistente) {
      this.mensagens.enviarMensagem("Não é possivel excluir lançamentos que não foram processados e/ou não existem.", TipoMensagem.Generica);
      return;
    }

    if (mes <= this.getMesAtual() && ano <= this.getAnoAtual()) {
      this.modalRef = this.modalService.show(this.modalAutenticacaoUsuario);
    } else {
      this.abrirModalExcluirTodosLancamentos();
    }
  }

  abrirModalExcluirTodosLancamentos() {
    this.eventModalConfirmacao = "ExcluirTodosLancamentos";
    this.mensagemModalConfirmacao = "Atenção: Deseja realmente excluir todos os lançamentos mensais?";
    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  obterDetalhesLabelQuitacaoMes() {
    this.lancamentosService.obterExtratoDespesaQuitacaoMes(this.despesaRef).toPromise().then((res) => {
      alert('CONSULTA DE DESPESAS Á QUITAR: \r\n \r\nValor R$   -   DESCRIÇÃO \r\n \r\n' + res.relatorioDespesas)
    },
      err => {
        this.mensagens.enviarMensagem("Ocorreu um erro ao obter os dados do extrato de quitação, tente novamente mais tarde.", TipoMensagem.Erro);
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

  visualizarDespesasMesAtual() {
    this.validarMesPesquisa("*");
    this.carregarDespesas()
  }

  validarMesPesquisa(ref: String) {
    let mes = this.pesquisaForm.get('cbMes').value;
    let ano = this.pesquisaForm.get('cbAno').value;

    if (ref == "*") {
      mes = this.parametrizacoes.mesReferencia;
      ano = this.parametrizacoes.anoReferencia;
    } else {
      mes = (ref == "+" ? (parseInt(mes) + 1) : (parseInt(mes) - 1));
    }

    mes = (mes <= 9 ? "0".concat(mes) : mes);

    if (mes <= 0) {
      mes = "12";
      ano = (parseInt(ano) - 1);
    } else if (mes == 13) {
      mes = "01";
      ano = (parseInt(ano) + 1);
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
      case 'ExecutarBackup': {
        this.confirmExecutarBackup();
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
    this.detalheService.enviaMensagem(idDespesa, idDetalheDespesa, ordemExibicao, Number(this.sessaoService.getIdLogin()), this.pesquisaForm.get('cbMes').value, this.pesquisaForm.get('cbAno').value);
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

  /* -------------- Spinner --------------- */
  iniciarSpinner() {
    this.mensagens.enviarMensagem(null, TipoMensagem.Spinner);
  }

  fecharSpinner() {
    this.mensagens.enviarMensagem(null, null);
  }
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