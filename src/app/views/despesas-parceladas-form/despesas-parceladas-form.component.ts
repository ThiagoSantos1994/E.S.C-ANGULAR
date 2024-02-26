import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService, formatDate } from 'ngx-bootstrap';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DespesaMensal } from 'src/app/core/interfaces/despesa-mensal.interface';
import { DespesaParceladaResponse } from 'src/app/core/interfaces/despesa-parcelada-response.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { DespesasParceladasService } from 'src/app/core/services/despesas-parceladas.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-despesas-parceladas-form',
  templateUrl: './despesas-parceladas-form.component.html',
  styleUrls: ['./despesas-parceladas-form.component.css']
})
export class DespesasParceladasFormComponent implements OnInit {
  private despesaParceladaDetalhe: DespesaParceladaResponse;
  private tituloDespesasParceladas: TituloDespesaResponse;

  private modalDespesasParceladasForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "";
  private mensagemModalConfirmacao_body: String = "";
  private mensagemModalConfirmacao_footer: String = "";

  private idDespesaReferencia: number = 0;

  @ViewChild('modalDespesasParceladas') modalDespesasParceladas;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private service: DespesasParceladasService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.service.recebeMensagem().subscribe(d => {
      this.loadFormDespesaParcelada();
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    })
  }

  loadFormDespesaParcelada() {
    this.idDespesaReferencia = 0;
    this.despesaParceladaDetalhe = null;

    this.tituloDespesasParceladas = {
      despesas: []
    }

    this.carregarListaDespesasParceladas(true);

    this.modalDespesasParceladasForm = this.formBuilder.group({
      checkCarregarDespesasPendente: [true],
      nomeDespesa: [''],
      cbMesVigencia: [''],
      cbAnoVigencia: [''],
      vigenciaFinal: ['']
    });

    (<HTMLInputElement>document.getElementById("parcelaAtual")).value = "0/0";
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

  carregarDetalheDespesaParcelada() {
    const despesaSelecionada = this.idDespesaReferencia;

    if (despesaSelecionada <= 0) {
      alert('Necessário selecionar uma despesa para pesquisar.')
      return;
    }

    this.carregarDetalheDespesaParceladaService(despesaSelecionada);
  }

  carregarDetalheDespesaParceladaService(despesa: number) {
    this.service.getDetalhesDespesaParcelada(despesa).subscribe((res) => {
      this.despesaParceladaDetalhe = res;

      this.modalDespesasParceladasForm = this.formBuilder.group({
        nomeDespesa: res.despesas.dsTituloDespesaParcelada,
        cbMesVigencia: res.despesas.dsMesVigIni,
        cbAnoVigencia: res.despesas.dsAnoVigIni,
        parcelas: res.despesas.nrTotalParcelas,
        vigenciaFinal: res.despesas.dsVigenciaFin,
        valorDespesa: res.valorTotalDespesa,
        valorParcela: res.valorParcelaAtual
      });

      (<HTMLInputElement>document.getElementById("parcelaAtual")).value = res.parcelaAtual.toString();
      (<HTMLInputElement>document.getElementById("parcelas")).value = res.despesas.nrTotalParcelas.toString();
      (<HTMLInputElement>document.getElementById("valorDespesa")).value = res.valorTotalDespesa.toString();
      (<HTMLInputElement>document.getElementById("valorParcela")).value = res.valorParcelaAtual.toString();
    });
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

  excluirDespesaParcelada() {
    this.eventModalConfirmacao = "ExcluirDespesa";
    this.mensagemModalConfirmacao_header = "Deseja excluir esta despesa parcelada?";
    this.mensagemModalConfirmacao_footer = "Este processo exclui todos os lançamentos mensais processados!";

    if (null == this.despesaParceladaDetalhe) {
      alert('Necessário selecionar uma despesa para excluir.')
      return;
    }

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }

  recarregarDetalheDespesa() {
    const despesa = this.despesaParceladaDetalhe.idDespesaParcelada;
    this.carregarListaDespesasParceladas(true);
    this.carregarDetalheDespesaParceladaService(despesa);
  }

  carregarListaDespesasParceladas(isTodasDespesas: boolean) {
    this.tituloDespesasParceladas = null;

    this.service.getNomeDespesasParceladas(isTodasDespesas).subscribe((res) => {
      this.tituloDespesasParceladas = res;
    });
  }

  onCheckCarregarNomeDespParceladas(checked) {
    this.carregarListaDespesasParceladas(checked);
  }

  onChangeTituloDespesa(value) {
    this.idDespesaReferencia = value;
  }

  gravarDespesaParcelada() {
    this.eventModalConfirmacao = "GravarDetalheDespesas";
    this.mensagemModalConfirmacao_body = "Deseja salvar as alterações ?";

    this.modalRef = this.modalService.show(this.modalConfirmacaoEventos);
  }


  confirmGravarDetalheDespesas() {
    //this.gravarDespesa(null /*this.detalheLancamentosMensais.despesaMensal*/);
    this.closeModal();
  }

  confirmExcluirItemDetalheDespesa() {
    const despesas = null//this.getDetalheDespesasChecked();

    /*despesas.forEach((d) => {
      this.detalheService.excluritemDetalheDespesa(d.idDespesa, d.idDetalheDespesa, d.idOrdem).toPromise().then(() => {
        this.recarregarDetalheDespesa();
      },
        err => {
          console.log(err);
        });
    })*/

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