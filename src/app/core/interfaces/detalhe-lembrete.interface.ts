export interface DetalheLembrete{
    idLembrete: number;
    idFuncionario: number;
    numeroDias: number;
    dsTituloLembrete: string;
    tpHabilitaNotificacaoDiaria?: number;
    tpSegunda?: string;
    tpTerca?: string;
    tpQuarta?: string;
    tpQuinta?: string;
    tpSexta?: string;
    tpSabado?: string;
    tpDomingo?: string;
    tpContagemRegressiva?: string;
    tpLembreteDatado?: string;
    tpRenovarAuto?: string;
    dataInicial?: string;
    dsObservacoes?: string;
    data1?: string;
    data2?: string;
    data3?: string;
    data4?: string;
    data5?: string;
    checked?: boolean;
    change?: boolean;
}