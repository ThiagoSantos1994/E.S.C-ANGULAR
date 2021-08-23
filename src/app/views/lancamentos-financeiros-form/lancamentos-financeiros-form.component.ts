import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { DespesasFixasDomain } from 'src/app/core/domain/despesas-fixas.domain';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from 'src/app/core/interfaces/despesas-mensais.interface';
import { DetalheDespesasMensais } from 'src/app/core/interfaces/detalhe-despesas-mensais.interface';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {

  listaDespesasFixas$: Observable<DespesasFixasMensais[]> = new Observable<DespesasFixasMensais[]>();
  listaDespesas: DespesasMensais;
  listaDetalheDespesas: DetalheDespesasMensais;
  modalReference: any;

  tituloDespesa: String = "";

  @ViewChild('modalDetalheDespesasMensais') modalDetalheDespesasMensais: any;

  constructor(
    private lancamentosService: LancamentosFinanceirosService,
    private modalService: NgbModal
  ) { }

  ngOnInit() { }

  carregarDespesas() {
    this.carregarListaDespesasFixasMensais();
  }

  carregarListaDespesasMensais(idDespesa: number) {
    /*this.despesasDomain.getDespesasAsObservable().subscribe((res: any) => {
      this.id_Despesa = res.listaDespesasFixasMensais[0].id_Despesa;
    });*/

    this.lancamentosService.getDespesasMensais(idDespesa).subscribe((res) => {
      this.listaDespesas = res;
    });
  }

  carregarListaDespesasFixasMensais() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    this.lancamentosService.getDespesasFixasMensais(mes.value, ano.value).subscribe((res: any) => {
      this.listaDespesasFixas$ = res;
      this.carregarListaDespesasMensais(res.listaDespesasFixasMensais[0].id_Despesa);
    });
  }

  carregarDetalheDespesas(idDespesa: number, idDetalheDespesa: number) {
    this.lancamentosService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa).subscribe((res) => {
      this.listaDetalheDespesas = res;
      this.openModal(this.modalDetalheDespesasMensais);
    });
  }

  abrirDespesa(despesa: DespesasMensais) {
    console.log(despesa);
    this.tituloDespesa = despesa.ds_NomeDespesa;
    this.carregarDetalheDespesas(despesa.id_Despesa, despesa.id_DetalheDespesa);
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
