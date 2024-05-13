import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { BehaviorSubject, Observable } from 'rxjs';
import { DetalheDespesasMensaisDomain } from 'src/app/core/domain/detalhe-despesas-mensais.domain';
import { DetalheLembrete } from 'src/app/core/interfaces/detalhe-lembrete.interface';
import { TituloLembretes } from 'src/app/core/interfaces/titulo-lembretes.interface';
import { LembretesService } from 'src/app/core/services/lembretes.service';
import { SessaoService } from 'src/app/core/services/sessao.service';

@Component({
  selector: 'app-lembretes-form',
  templateUrl: './lembretes-form.component.html',
  styleUrls: ['./lembretes-form.component.css']
})
export class LembretesFormComponent implements OnInit {
  private lembrete$: Observable<DetalheLembrete[]>;
  private tituloLembretes$: Observable<TituloLembretes[]>;
  private _monitorLembretes = new BehaviorSubject<TituloLembretes[]>([]);
  private idLembreteReferencia: number = 0;
  private checkboxesMarcadas: Boolean = false;

  private modalLembretesForm: FormGroup;
  private checkLembretesForm: FormGroup;
  private modalRef: BsModalRef;

  private eventModalConfirmacao: String = "";
  private mensagemModalConfirmacao_header: String = "null";
  private mensagemModalConfirmacao_body: String = "null";
  private mensagemModalConfirmacao_footer: String = "null";

  @ViewChild('modalLembretes') modalLembretes;
  @ViewChild('modalVisualizarLembretes') modalVisualizarLembretes;
  @ViewChild('modalBaixarLembretesMonitor') modalBaixarLembretesMonitor;
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
    this.carregarMonitorLembretes(true);

    this.service.recebeMensagem().subscribe(d => {
      if (d == "cadastro") {
        this.loadFormLembretes();
        this.carregarListaLembretes(false);
      } else {
        this.carregarMonitorLembretes(true);
      }
    }, () => {
      alert('Ocorreu um erro ao carregar os dados da despesa parcelada, tente novamente mais tarde.')
    });
  }

  loadFormLembretes() {
    this.idLembreteReferencia = -1;
    this.lembrete$ = null;
    this.tituloLembretes$ = null;

    this.modalLembretesForm = this.formBuilder.group({
      checkCarregarLembretesEmAberto: [true],
      nomeLembrete: [''],
      observacoesLembrete: ['']
    });
  }

  onCheckCarregarTituloLembretes(checked) {
    this.carregarListaLembretes(!checked);
  }

  onChangeTituloLembrete(value) {
    this.idLembreteReferencia = value;
    this.carregarDetalheLembrete();
  }

  carregarDetalheLembrete() {
    this.service.getDetalheLembrete(this.idLembreteReferencia).subscribe((res: any) => {
      this.lembrete$ = res;

      this.modalLembretesForm = this.formBuilder.group({
        nomeLembrete: res.dsTituloLembrete,
        observacoesLembrete: res.dsObservacoes
      });
    });
  }

  carregarListaLembretes(isTodosLembretes: boolean) {
    this.service.getTituloLembretes(isTodosLembretes).subscribe((res: any) => {
      this.tituloLembretes$ = res;
    });
  }

  carregarMonitorLembretes(abrirMonitor: boolean) {
    this.service.getMonitorLembretes().subscribe((res: any) => {
      this.tituloLembretes$ = res;
      if (res.length > 0) {
        this.resetMonitorLembretesObservable();
        this.setMonitorLembretesObservable(res, false);

        if (abrirMonitor) {
          this.abrirMonitorLembretes();
        }
      }
    });
  }

  abrirMonitorLembretes() {
    this.checkboxesMarcadas = false;

    this.checkLembretesForm = this.formBuilder.group({
      checkMarcarTodosLembretes: [false]
    });

    this.modalRef = this.modalService.show(this.modalVisualizarLembretes);
  }

  abrirModalBaixaLembretesSelecionados() {
    let lembretesChecked = this.getMonitorLembretesChecked().length;
    if (lembretesChecked == 0) {
      alert('Necessario selecionar o lembrete para baixar.');
    } else {
      this.modalRef = this.modalService.show(this.modalBaixarLembretesMonitor);
    }
  }

  resetMonitorLembretesObservable() {
    this._monitorLembretes.next([]);
  }

  setMonitorLembretesObservable(lembrete: TituloLembretes[], checkedDefaultValues: boolean) {
    let lembretes = this._monitorLembretes.getValue();

    lembrete.forEach(p => {
      p.checked = checkedDefaultValues;
      lembretes.push({ ...p });
      this._monitorLembretes.next(lembretes);
    });
  }

  onCheckMonitorLembretesChange(checked, lembrete) {
    lembrete.checked = checked;

    let lembretes = this._monitorLembretes.getValue();
    let index = lembretes.findIndex((d) => d.idLembrete === lembrete.idLembrete);

    if (index >= 0) {
      lembretes[index].checked = checked;
    } else {
      lembretes.push({ ...lembrete });
    }

    this._monitorLembretes.next(lembretes);
  }

  onMarcarDesmarcarCheckBoxes() {
    let checksMarcadas = (this.checkboxesMarcadas == true ? false : true);
    this.onChangeAllCheckBoxesLembretes(checksMarcadas);
    this.checkboxesMarcadas = checksMarcadas;
  }

  onChangeAllCheckBoxesLembretes(checked: boolean) {
    let lembretes = this._monitorLembretes.value;
    this.resetMonitorLembretesObservable();
    this.setMonitorLembretesObservable(lembretes, checked);
  }

  getMonitorLembretesChecked() {
    return this._monitorLembretes.getValue().filter((d) => d.checked === true);
  }

  confirmBaixarNotificacao() {
    let lembretes = this.getMonitorLembretesChecked();
    let tipoBaixa = ""

    if ((<HTMLInputElement>document.getElementById("radioAdiarMes")).checked) {
      tipoBaixa = "mes"
    } else if ((<HTMLInputElement>document.getElementById("radioAdiarSemana")).checked) {
      tipoBaixa = "semana"
    } else if ((<HTMLInputElement>document.getElementById("radioAdiarAno")).checked) {
      tipoBaixa = "ano"
    } else {
      tipoBaixa = "baixar"
    }

    this.service.baixarLembreteMonitor(tipoBaixa, lembretes).toPromise().then(() => {
      this.closeModal();
      this.carregarMonitorLembretes(false);
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
