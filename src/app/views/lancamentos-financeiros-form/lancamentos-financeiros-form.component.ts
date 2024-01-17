import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
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

  lancamentosForm: FormGroup;
  modalNovaReceitaForm: FormGroup;

  listaDetalheDespesas: DetalheLancamentosMensais;
  lancamentosFinanceiros$: Observable<LancamentosFinanceiros[]> = new Observable<LancamentosFinanceiros[]>();

  idDespesaRef: number;
  despesasFixasMensaisTemp: DespesasFixasMensais;
  tituloDespesa: String = "";
  modalReference: any;

  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais: any;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private lancamentosService: LancamentosFinanceirosService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.modalNovaReceitaForm = this.formBuilder.group({
      nomeReceita: ['', Validators.required],
      valorReceita: ['', Validators.required],
      tipoReceita: ['', Validators.required]
    })
    this.carregarLancamentosFinanceiros();
  }

  carregarDespesas() {
    this.carregarLancamentosFinanceiros();
  }

  carregarLancamentosFinanceiros() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    this.lancamentosService.getLancamentosFinanceiros(mes.value, ano.value).subscribe((res: any) => {
      this.lancamentosFinanceiros$ = res;
      this.idDespesaRef = res.idDespesa;
    });
  }

  carregarDetalheDespesas(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number) {
    this.lancamentosService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      this.listaDetalheDespesas = res;
      //this.openModal(this.modalDetalheDespesasMensais);
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
    this.despesasFixasMensaisTemp = receita;
  }

  gravarReceita() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    let request: DespesasFixasMensais = {
      idDespesa: this.idDespesaRef,
      dsDescricao: this.modalNovaReceitaForm.get('nomeReceita').value,
      vlTotal: this.modalNovaReceitaForm.get('valorReceita').value,
      tpStatus: this.modalNovaReceitaForm.get('tipoReceita').value,
      dsMes: mes.value,
      dsAno: ano.value,
      idFuncionario: Number(this.sessao.getIdLogin()),
      idOrdem: null,
      tpFixasObrigatorias: 'S',
      tpDespesaDebitoCartao: 'N'
    };

    this.lancamentosService.gravarReceita(request).toPromise().then(res => {
      this.despesasFixasMensaisTemp = null;
      alert('Item gravado com sucesso!')
      this.carregarDespesas();
    },
      err => {
        alert("Desculpe, ocorreu um erro no servidor. Tente novamente!")
        console.log(err);
      });

  }

  excluirReceita() {
    const receita = this.despesasFixasMensaisTemp;

    this.lancamentosService.excluirReceita(receita.idDespesa, receita.idOrdem).toPromise().then(res => {
      this.despesasFixasMensaisTemp = null;
      alert('Item Excluido com Sucesso!')
      this.carregarDespesas();
    },
      err => {
        /*if (err.status == 401) {
          this.open(this.modalUsuarioInvalido);
        }*/
        console.log(err);
      });
  }

  atualizarOrdemLinhaReceitaService(idDespesa: number, iOrdemAtual: number, iNovaOrdem) {
    this.lancamentosService.atualizarOrdemLinhaReceita(idDespesa, iOrdemAtual, iNovaOrdem).toPromise().then(res => {
      this.carregarDespesas();
    },
      err => {
        /*if (err.status == 401) {
          this.open(this.modalUsuarioInvalido);
        }*/
        console.log(err);
      });
  }

  abrirDespesa(despesa: LancamentosMensais) {
    console.log(despesa);
    this.tituloDespesa = despesa.dsTituloDespesa;
    this.carregarDetalheDespesas(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao);
  }

  adicionarDespesaMensal() {
    alert('Adicionando')
  }

  excluirDespesaMensal() {
    alert('excluindo')
  }

  openModal(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  closeModal() {
    this.modalReference.close();
  }

  
}
