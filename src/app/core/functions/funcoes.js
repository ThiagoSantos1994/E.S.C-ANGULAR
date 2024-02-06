
function marcarTodos(obj) {
    var itens = document.getElementsByName('item[]');
    var quantidade = itens.length;

    for (i = 0; i < quantidade; i++) {
        var status = (obj.checked) ? true : false;

        itens.item(i).checked = status;
        corLinha(itens.item(i));
    }
}

function toUpper(input) {
    var start = input.selectionStart;
    input.value = input.value.toUpperCase();
    input.selectionStart = input.selectionEnd = start;
}

function toLower(input) {
    var start = input.selectionStart;
    input.value = input.value.toLowerCase();
    input.selectionStart = input.selectionEnd = start;
}

function corLinha(obj) {
    var cor = obj.checked ? '#ffffcc' : '';

    $(obj).closest('tr').css('background-color', cor);
}
