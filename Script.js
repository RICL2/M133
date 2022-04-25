const beruf = $("#beruf");
const klasse = $("#klasse");
const rowKlasse = $("#rowKlasse");
const rowHide = $("#rowHide");
const btnBack = $("#btnBack");
const btnToday = $("#btnToday");
const btnForward = $("#btnForward");
const lblErrorToast = $("#lblToast");
const errorToastEl = $("#liveToast")
const errorToast = new bootstrap.Toast(errorToastEl);

moment.locale("de");
let iCWeek = moment().week();
let iYear = moment().year();

rowKlasse.hide();
rowHide.hide();

$(document).ready(function() {
    $.getJSON("http://sandbox.gibm.ch/berufe.php").done(function(data) {
            $.each(data, function() {
                beruf.append($("<option></option>").val(this['beruf_id']).html(this['beruf_name']));
            })

            if (localStorage.getItem("beruf_id") !== null && localStorage.getItem("klasse_id") !== null) {
                beruf.val(localStorage.getItem("beruf_id")).change();
            }
        })
        .fail(function() {
            lblErrorToast.text("Die Berufe konnten nicht geladen werden");
            errorToast.show();
        })
    btnToday.text(iCWeek + "-" + iYear)
});

beruf.on("change", function() {
    rowKlasse.show();
    rowHide.hide();
    klasse.empty();
    klasse.append($("<option></option>").html('Wählen Sie eine Klasse aus'));
    $.getJSON("http://sandbox.gibm.ch/klassen.php?beruf_id=" + beruf.val()).done(function(data) {
            $.each(data, function() {
                klasse.append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname']));
            })
            localStorage.setItem("beruf_id", beruf.val());

            if (localStorage.getItem("klasse_id") !== null) {
                klasse.val(localStorage.getItem("klasse_id")).change();
            }
        })
        .fail(function() {
            lblErrorToast.text("Die Klassen konnten nicht geladen werden");
            errorToast.show();
        })
})

klasse.on("change", function() {
    rowHide.show();
    localStorage.setItem("klasse_id", klasse.val());
    loadScedule(klasse.val());
})

function loadScedule(klasse_id) {
    var table = '';
    $("#Stundenplan").fadeOut();
    $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id + "&woche=" + iCWeek + "-" + iYear).done(function(data) {
            if (data.length > 0) {
                table += "<table class='table table-dark'><thead class='fw-bold'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th></thead>";
                $.each(data, function() {
                    table += "<tr>"
                    table += "<td>" + moment(this['tafel_datum']).format("DD-MM-YYYY") + "</td>";
                    table += "<td>" + moment(this['tafel_datum']).format('dddd') + "</td>";
                    table += "<td>" + this['tafel_von'].slice(0, 5) + " bis " + this['tafel_bis'].slice(0, 5) + "</td>";
                    table += "<td>" + this['tafel_longfach'] + "</td>";
                    table += "<td>" + this['tafel_lehrer'] + "</td>";
                    table += "<td>" + this['tafel_raum'] + "</td>";
                    table += "</tr>";
                });
                table += "</table>";
                $("#Stundenplan").empty().append(table).fadeIn();
            } else {
                $("#Stundenplan").empty().append("<div class='text-center align-self-center'><h1>Ferien</h1><img src='https://i0.wp.com/media.giphy.com/media/5ocAtoAPhIDcI/giphy.gif' alt='gif'></div>").fadeIn("2");
            }
        })
        .fail(function() {
            lblErrorToast.text("Der Stundenplan konnte nicht geladen werden");
            errorToast.show();
        })
}

btnToday.on("click", function() {
    iCWeek = moment().week();
    iYear = moment().year();
    loadScedule(klasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})

btnBack.on("click", function() {
    iCWeek--;
    loadScedule(klasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})

btnForward.on("click", function() {
    iCWeek++;
    loadScedule(klasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})