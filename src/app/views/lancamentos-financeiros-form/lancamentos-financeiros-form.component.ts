import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DespesasFixas } from 'src/app/core/domain/despesas-fixas.domain';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from 'src/app/core/interfaces/despesas-mensais.interface';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {

  despesas: DespesasMensais;
  listaDespesasFixas$: Observable<DespesasFixasMensais[]> = new Observable<DespesasFixasMensais[]>();

  private id_Despesa: number;

  constructor(
    private lancamentosService: LancamentosFinanceirosService,
    private sessaoService: SessaoService,
    private despesasDomain: DespesasFixas
  ) { }

  ngOnInit() { }

  carregarListaDespesasMensais() {
    this.despesasDomain.getDespesasAsObservable().subscribe((res: any) => {
      this.id_Despesa = res.listaDespesasFixasMensais[0].id_Despesa;
    });

    console.log(this.id_Despesa);
    
    this.lancamentosService.getDespesasMensais().subscribe((res) => {
      this.despesas = res
    });
  }

  carregarListaDespesasFixasMensais() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    console.log(this.mesAtual);

    this.lancamentosService.getDespesasFixasMensais(mes.value, ano.value, this.sessaoService.getIdLogin())
      .subscribe((res: any) => {
        this.listaDespesasFixas$ = res;
      });
  }

  /*obterDespesasFixasMensais() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    this.lancamentosService.getDespesasFixasMensais(mes.value, ano.value, this.sessaoService.getIdLogin()).subscribe((res) => {
      this.despesasFixas = res
    });
  }*/

  carregarDespesas() {
    this.carregarListaDespesasFixasMensais();

    setTimeout(() => {
      this.carregarListaDespesasMensais();
    }, 2000)

  }

  abrirDespesa() {
    alert('Abrindo')
  }

  adicionarDespesaMensal() {
    alert('Adicionado')
  }

  excluirDespesaMensal() {
    alert('Excluido')
  }
}
