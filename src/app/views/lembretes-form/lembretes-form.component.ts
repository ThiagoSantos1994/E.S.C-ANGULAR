import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { Lembretes } from 'src/app/core/interfaces/lembretes.interface';
import { TituloDespesaResponse } from 'src/app/core/interfaces/titulo-despesa-response.interface';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lembretes-form',
  templateUrl: './lembretes-form.component.html',
  styleUrls: ['./lembretes-form.component.css']
})
export class LembretesFormComponent implements OnInit {
  private lembretes$: Observable<Lembretes[]>;
  private _lembretesCheckBox = new BehaviorSubject<Lembretes[]>([]);
  private tituloLembretes: TituloDespesaResponse;
  private idLembreteReferencia: number = 0;

  private modalLembretesForm: FormGroup;
  private checkLembretesForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  @ViewChild('modalLembretes') modalLembretes;
  @ViewChild('modalVisualizarLembretes') modalVisualizarLembretes;
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
    this.carregarMonitorLembretes();

    this.service.recebeMensagem().subscribe(d => {
      if (d == "cadastro") {
        this.loadFormLembretes();
        this.carregarListaLembretes(true);
      } else {
        this.carregarMonitorLembretes();
      }
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    });
  }

  loadFormLembretes() {
    this.idLembreteReferencia = -1;

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

  carregarMonitorLembretes() {
    this.service.getMonitorLembretesPendentes().subscribe((res: any) => {
      this.lembretes$ = res;
      if (res.length() > 0) {
        this.abrirMonitorLembretes();
      }
    });
  }

  abrirMonitorLembretes() {
    this.checkLembretesForm = this.formBuilder.group({
      checkMarcarTodosLembretes: [false]
    });

    this.modalRef = this.modalService.show(this.modalVisualizarLembretes);
  }

  onCheckLembretes(checked, lembrete) {
    lembrete.checked = checked;

    let lembretes = this._lembretesCheckBox.getValue();
    let index = lembretes.findIndex((d) => d.idLembrete === lembrete.idLembrete);

    if (index >= 0) {
      lembretes[index].checked = checked;
    } else {
      lembretes.push({ ...lembrete });
    }

    this._lembretesCheckBox.next(lembrete);
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
