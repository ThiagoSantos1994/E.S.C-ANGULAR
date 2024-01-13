import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { LancamentosFinanceiros } from 'src/app/core/interfaces/lancamentos-financeiros.interface';
import { DetalheLancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais-detalhe.interface';
import { LancamentosMensais } from 'src/app/core/interfaces/lancamentos-mensais.interface';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {

  listaDetalheDespesas: DetalheLancamentosMensais;
  lancamentosFinanceiros$: Observable<LancamentosFinanceiros[]> = new Observable<LancamentosFinanceiros[]>();

  despesaFixaMensal: DespesasFixasMensais;
  tituloDespesa: String = "";
  modalReference: any;
  
  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais: any;

  constructor(
    private lancamentosService: LancamentosFinanceirosService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
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
    this.despesaFixaMensal = receita;
  }
  
  excluirReceita() {
    const receita = this.despesaFixaMensal;
    
    this.lancamentosService.excluirReceita(receita.idDespesa, receita.idOrdem).toPromise().then(res => {
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
    alert('Excluido')
  }

  openModal(content) {
    this.modalReference = this.modalService.open(content, { size: 'lg', backdrop: 'static' });
  }

  closeModal() {
    this.modalReference.close();
  }
}
