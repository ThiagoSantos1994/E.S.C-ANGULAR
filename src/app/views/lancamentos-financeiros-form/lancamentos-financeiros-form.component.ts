import { Component, OnInit } from '@angular/core';
import { DespesasFixasMensais } from 'src/app/core/interfaces/despesas-fixas-mensais.interface';
import { DespesasMensais } from 'src/app/core/interfaces/despesas-mensais.interface';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';

@Component({
  selector: 'app-lancamentos-financeiros-form',
  templateUrl: './lancamentos-financeiros-form.component.html',
  styleUrls: ['./lancamentos-financeiros-form.component.css']
})
export class LancamentosFinanceirosFormComponent implements OnInit {

  private despesas: DespesasMensais;
  private despesasFixas: DespesasFixasMensais;

  constructor(
    private lancamentosService: LancamentosFinanceirosService
  ) { }

  ngOnInit() {
    this.obterDespesasFixasMensais();
    this.obterDespesasMensais();
  }

  obterDespesasMensais() {
    this.lancamentosService.getDespesasMensais().subscribe((res) => {
      this.despesas = res
    });
  }

  obterDespesasFixasMensais() {
    this.lancamentosService.getDespesasFixasMensais().subscribe((res) => {
      this.despesasFixas = res
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
