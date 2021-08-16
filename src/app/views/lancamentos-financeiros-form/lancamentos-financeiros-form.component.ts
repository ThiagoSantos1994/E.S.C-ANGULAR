import { Component, OnInit } from '@angular/core';
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

  private despesas: DespesasMensais;
  private despesasFixas: DespesasFixasMensais;

  constructor(
    private lancamentosService: LancamentosFinanceirosService,
    private sessaoService: SessaoService
  ) { }

  ngOnInit() {
    this.obterDespesasFixasMensais();
    this.obterDespesasMensais();

    /*let element = <HTMLInputElement>document.getElementById("cbMes");
    element.innerHTML = new Date().toLocaleDateString(); //new Date().toLocaleDateString().substring(3,10).replace('/','-');*/
  }

  obterDespesasMensais() {
    this.lancamentosService.getDespesasMensais().subscribe((res) => {
      this.despesas = res
    });
  }

  obterDespesasFixasMensais() {
    let mes = <HTMLInputElement>document.getElementById("cbMes");
    let ano = <HTMLInputElement>document.getElementById("cbAno");

    this.lancamentosService.getDespesasFixasMensais(mes.value, ano.value, this.sessaoService.getIdLogin()).subscribe((res) => {
      this.despesasFixas = res
    });
  }

  carregarDespesas() {
    this.obterDespesasFixasMensais();
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
