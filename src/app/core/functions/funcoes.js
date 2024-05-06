
function marcarTodos(obj) {
    var itens = document.getElementsByName('item[]');
    var quantidade = itens.length;

    for (i = 0; i < quantidade; i++) {
        var status = (obj.checked) ? true : false;

        itens.item(i).checked = status;
        corLinha(itens.item(i));
    }
}

function marcarTodasParcelas(obj) {
    var itens = document.getElementsByName('parcela[]');
    var quantidade = itens.length;

    for (i = 0; i < quantidade; i++) {
        var status = (obj.checked) ? true : false;

        itens.item(i).checked = status;
        corLinha(itens.item(i));
    }
}

function marcarTodasDespesas(obj) {
    var itens = document.getElementsByName('despesa[]');
    var quantidade = itens.length;

    for (i = 0; i < quantidade; i++) {
        var status = (obj.checked) ? true : false;

        itens.item(i).checked = status;
        corLinha(itens.item(i));
    }
}

function marcarTodosLembretes(obj) {
    var itens = document.getElementsByName('lembretes[]');
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

function verifica_checkbox() {
    var itens = document.getElementsByName('item[]');

    for (i = 0; i < itens.length; i++) {
        if (itens.item(i).checked) {
            return true;
        }
    }

    return false;
}

/*SideBar Menu*/

jQuery(function ($) {

    $(".sidebar-dropdown > a").click(function () {
        $(".sidebar-submenu").slideUp(200);
        if (
            $(this)
                .parent()
                .hasClass("active")
        ) {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .parent()
                .removeClass("active");
        } else {
            $(".sidebar-dropdown").removeClass("active");
            $(this)
                .next(".sidebar-submenu")
                .slideDown(200);
            $(this)
                .parent()
                .addClass("active");
        }
    });

    $("#close-sidebar").click(function () {
        $(".page-wrapper").removeClass("toggled");
    });
    $("#show-sidebar").click(function () {
        $(".page-wrapper").addClass("toggled");
    });
});