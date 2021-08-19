import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DespesasFixasDomain } from 'src/app/core/domain/despesas-fixas.domain';
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

  listaDespesasFixas$: Observable<DespesasFixasMensais[]> = new Observable<DespesasFixasMensais[]>();
  listaDespesas: DespesasMensais;

  private id_Despesa: number;

  constructor(
    private lancamentosService: LancamentosFinanceirosService,
    private sessaoService: SessaoService,
    private despesasDomain: DespesasFixasDomain
  ) { }

  ngOnInit() { }

  carregarDespesas() {
    this.carregarListaDespesasFixasMensais();

    setTimeout(() => {
      this.carregarListaDespesasMensais();
    }, 2000)
  }

  carregarListaDespesasMensais() {
    this.despesasDomain.getDespesasAsObservable().subscribe((res: any) => {
      this.id_Despesa = res.listaDespesasFixasMensais[0].id_Despesa;
    });

    this.lancamentosService.getDespesasMensais(this.id_Despesa).subscribe((res) => {
      this.listaDespesas = res
    });
  }

  carregarListaDespesasFixasMensais() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    this.lancamentosService.getDespesasFixasMensais(mes.value, ano.value).subscribe((res: any) => {
      this.listaDespesasFixas$ = res;
    });
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
