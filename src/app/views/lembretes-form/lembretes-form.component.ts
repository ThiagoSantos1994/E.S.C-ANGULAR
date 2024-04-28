import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DespesaParceladaResponse, Parcelas } from 'src/app/core/interfaces/despesa-parcelada-response.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lembretes-form',
  templateUrl: './lembretes-form.component.html',
  styleUrls: ['./lembretes-form.component.css']
})
export class LembretesFormComponent implements OnInit {
  private _parcelas = new BehaviorSubject<Parcelas[]>([]);
  private despesaParceladaDetalhe: DespesaParceladaResponse;
  private tituloLembretes: TituloDespesaResponse;
  private idLembreteReferencia: number = 0;

  private modalLembretesForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  @ViewChild('modalLembretes') modalLembretes;
  @ViewChild('modalConfirmacaoEventos') modalConfirmacaoEventos;

  constructor(
    private formBuilder: FormBuilder,
    private sessao: SessaoService,
    private modalService: BsModalService,
    private service: LembretesService,
    private detalheDomain: DetalheDespesasMensaisDomain
  ) { }

  ngOnInit() {
    this.loadFormLembretes();

    this.service.recebeMensagem().subscribe(d => {
      this.loadFormLembretes();
      this.carregarListaLembretes(true);
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    })
  }

  loadFormLembretes() {
    this.idLembreteReferencia = -1;
    this.despesaParceladaDetalhe = null;

    this.tituloLembretes = {
      despesas: []
    }

    this.modalLembretesForm = this.formBuilder.group({
      checkCarregarLembretesEmAberto: [true],
      nomeLembrete: [''],
      observacoesLembrete: ['']
    });
  }

  carregarListaLembretes(isTodosLembretes: boolean) {
    this.tituloLembretes = null;

    this.service.getNomeDespesasParceladas(isTodosLembretes).subscribe((res) => {
      this.tituloLembretes = res;
    });
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

  return tmp.replace('.', ',');
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
