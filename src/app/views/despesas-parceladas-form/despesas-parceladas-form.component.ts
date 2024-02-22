import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, formatDate } from 'ngx-bootstrap';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { DetalheDespesasService } from 'src/app/core/services/detalhe-despesas.service';
import { LancamentosFinanceirosService } from 'src/app/core/services/lancamentos-financeiros.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-despesas-parceladas-form',
  templateUrl: './despesas-parceladas-form.component.html',
  styleUrls: ['./despesas-parceladas-form.component.css']
})
export class DespesasParceladasFormComponent implements OnInit {
  private tituloDespesasParceladas: TituloDespesaResponse;

  private modalDespesasParceladasForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao: String = "";

  @ViewChild('modalDespesasParceladas') modalDespesasParceladas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private detalheService: DetalheDespesasService,
    private lancamentosService: LancamentosFinanceirosService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.carregarFormDespesasParceladas();
  }

  carregarFormDespesasParceladas() {
    this.tituloDespesasParceladas = {
      despesas: []
    }

    this.carregarListaDespesasParceladas(true);

    this.modalDespesasParceladasForm = this.formBuilder.group({
      parcelaAtual: ['0/0'],
      checkCarregarDespesasPendente: [true],
      nomeDespesa: [''],
      cbMesVigencia: [''],
      cbAnoVigencia: [''],
      vigenciaFinal: ['']
    });

    (<HTMLInputElement>document.getElementById("parcelas")).value = "";
    (<HTMLInputElement>document.getElementById("valorDespesa")).value = "0";
    (<HTMLInputElement>document.getElementById("valorParcela")).value = "0";
  }


  onQuantidadeParcelasChange() {
    let campo = document.getElementById("parcelas");

    campo.onblur = () => {
      if (!this.validarVigenciaInicial()) {
        alert('Favor selecionar o periodo da vigencia inicial.');
        (<HTMLInputElement>document.getElementById("parcelas")).value = "";
        return;
      }

      var vigenciaIni = parseDate("01/" + this.modalDespesasParceladasForm.get('cbMesVigencia').value + "/" + this.modalDespesasParceladasForm.get('cbAnoVigencia').value);

      //Capturar Quantidade de meses
      var meses = (<HTMLInputElement>document.getElementById("parcelas")).value;

      //Adicionar meses 
      vigenciaIni.setMonth(vigenciaIni.getMonth() + parseInt(meses));

      //Exibir nova data
      (<HTMLInputElement>document.getElementById("vigenciaFinal")).value = formatDate(vigenciaIni, 'MM/YYYY');
    }
  }

  onValorDespesaChange() {
    let campo = document.getElementById("valorDespesa");

    campo.onblur = () => {
      var valorDespesa = parseFloat(formatRealNumber((document.getElementById("valorDespesa") as HTMLInputElement).value));
      var qtdeParcelas = parseInt((document.getElementById("parcelas") as HTMLInputElement).value);

      var calculo = (valorDespesa / qtdeParcelas);
      (<HTMLInputElement>document.getElementById("valorParcela")).value = calculo.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }
  }

  validarVigenciaInicial() {
    if (this.modalDespesasParceladasForm.get('cbMesVigencia').value == "" || this.modalDespesasParceladasForm.get('cbAnoVigencia').value == "") {
      return false;
    } else {
      return true;
    }
  }

  gerarFluxoParcelas() {
    
  }

  confirmEventModal() {
    this.closeModal();

    switch (this.eventModalConfirmacao) {
      case 'GravarDetalheDespesas': {
        this.confirmGravarDetalheDespesas();
        break;
      }
      default: {
      }
    }

    this.eventModalConfirmacao = "";
  }

  carregarDetalheDespesa(idDespesa: number, idDetalheDespesa: number, ordemExibicao: number, idFuncionario: number) {
    //this.resetDetalheDespesasChange();

    this.detalheService.getDetalheDespesasMensais(idDespesa, idDetalheDespesa, ordemExibicao).subscribe((res) => {
      //this.detalheLancamentosMensais = res;
      //this.setDetalheDespesaMensalObservable(res.detalheDespesaMensal);
      //this.carregarFormDetalheDespesasMensais(res.despesaMensal);
    });
  }

  excluirItemDetalheDespesa() {
    this.eventModalConfirmacao = "ExcluirItemDetalheDespesa";
    this.mensagemModalConfirmacao = "Deseja excluir a(s) despesa(s) selecionada(s) ?";

    /*if (this.getDetalheDespesasChecked().length == 0) {
      alert('Necessário selecionar alguma despesa para excluir.')
      return;
    }*/

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheDespesa() {
    const despesa = this.detalheDomain.getDespesaMensal();
    this.carregarDetalheDespesa(despesa.idDespesa, despesa.idDetalheDespesa, despesa.idOrdemExibicao, despesa.idFuncionario);
    this.lancamentosService.enviaMensagem();
  }

  carregarListaDespesasParceladas(isTodasDespesas: boolean) {
    this.detalheService.getTituloDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParceladas = res;
    });
  }

  onCheckCarregarTodasDespParceladas(checked) {
    //this.carregarListaDespesasParceladasImportacao(checked);
  }

  gravarDetalheDespesas() {
    const despesa = null //this.detalheLancamentosMensais.despesaMensal;
    despesa.dsNomeDespesa = null //this.modalDetalheDespesasMensaisForm.get('nomeDespesa').value;

    if (despesa.dsNomeDespesa == "") {
      alert('Digite o nome da despesa.');
      return;
    }

    if (despesa.tpReferenciaSaldoMesAnterior == "N") {
      let valorLimiteDespesa = formatRealNumber((document.getElementById("valorLimiteDespesa") as HTMLInputElement).value);

      if (valorLimiteDespesa == "NaN" || valorLimiteDespesa == "0") {
        alert('Necessário digitar o valor Limite Despesa.');
        return;
      }

      despesa.vlLimite = valorLimiteDespesa;
    }

    this.eventModalConfirmacao = "GravarDetalheDespesas";
    this.mensagemModalConfirmacao = "Deseja salvar as alterações ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  gravarDespesa(despesa: DespesaMensal) {
    this.detalheService.gravarDespesaMensal(despesa).toPromise().then(() => {
      this.detalheDomain.setDespesaMensal(despesa);
      this.recarregarDetalheDespesa();
    },
      err => {
        console.log(err);
      });
  }

  confirmGravarDetalheDespesas() {
    this.gravarDespesa(null /*this.detalheLancamentosMensais.despesaMensal*/);
    this.closeModal();
  }

  confirmExcluirItemDetalheDespesa() {
    const despesas = null//this.getDetalheDespesasChecked();

    despesas.forEach((d) => {
      this.detalheService.excluritemDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdem).toPromise().then(() => {
        this.recarregarDetalheDespesa();
      },
        err => {
          console.log(err);
        });
    })

    this.closeModal();
  }

  /* -------------- Metodos Gerais -------------- */
  closeModal(): void {
    this.modalRef.hide();
  }

}

function parserToInt(str) {
  return parseInt(str.replace(/[\D]+/g, ''));
}

function formatRealNumber(str) {
  var tmp = parserToInt(str) + '';
  tmp = tmp.replace(/([0-9]{2})$/g, ".$1");
  if (tmp.length > 6)
    tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, "$1.$2");

  return tmp;
}

function isValorNegativo(str) {
  let regex = new RegExp("-");
  return regex.test(str);
}

function parseDate(texto) {
  let dataDigitadaSplit = texto.split("/");

  let dia = dataDigitadaSplit[0];
  let mes = dataDigitadaSplit[1];
  let ano = dataDigitadaSplit[2];

  if (ano.length < 4 && parseInt(ano) < 50) {
    ano = "20" + ano;
  } else if (ano.length < 4 && parseInt(ano) >= 50) {
    ano = "19" + ano;
  }
  ano = parseInt(ano);
  mes = mes - 1;

  return new Date(ano, mes, dia);
}