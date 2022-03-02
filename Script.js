const ddlBeruf = $("#ddlBeruf");
const ddlKlasse = $("#ddlKlasse");
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

$(document).ready(function () {
    $.getJSON("http://sandbox.gibm.ch/berufe.php").done(function (data) {
        $.each(data, function () {
            ddlBeruf.append($("<option></option>").val(this['beruf_id']).html(this['beruf_name']));
        })

        if (localStorage.getItem("beruf_id") !== null && localStorage.getItem("klasse_id") !== null) {
            ddlBeruf.val(localStorage.getItem("beruf_id")).change();
        }
    })
        .fail(function () {
            lblErrorToast.text("Die Berufe konnten nicht geladen werden");
            errorToast.show();
        })
    btnToday.text(iCWeek + "-" + iYear)

    console.log(localStorage);
});

ddlBeruf.on("change", function () {
    rowKlasse.show();
    rowHide.hide();
    ddlKlasse.empty();
    ddlKlasse.append($("<option></option>").html('Wählen Sie eine Klasse aus'));
    $.getJSON("http://sandbox.gibm.ch/klassen.php?beruf_id=" + ddlBeruf.val()).done(function (data) {
        $.each(data, function () {
            ddlKlasse.append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname']));
        })
        localStorage.setItem("beruf_id", ddlBeruf.val());

        if(localStorage.getItem("klasse_id") !== null)
        {
            ddlKlasse.val(localStorage.getItem("klasse_id")).change();
        }
    })
        .fail(function () {
            lblErrorToast.text("Die Klassen konnten nicht geladen werden");
            errorToast.show();
        })
})

ddlKlasse.on("change", function () {
    rowHide.show();
    localStorage.setItem("klasse_id", ddlKlasse.val());
    loadScedule(ddlKlasse.val());
    console.log(ddlKlasse.val())
})

function loadScedule(klasse_id) {
    var table = '';
    $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id + "&woche=" + iCWeek + "-" + iYear).done(function (data) {
        if (data.length > 2) {
            table += "<table class='table table-dark table-responsive'><thead class='fw-bold'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th></thead>";
            $.each(data, function () {
                table += "<tr>"
                table += "<td>" + moment(this['tafel_datum']).format("DD-MM-YYYY") + "</td>";
                table += "<td>" + moment(this['tafel_datum']).format('dddd') + "</td>";
                table += "<td>" + "Von " + this['tafel_von'].slice(0, 5) + " bis " + this['tafel_bis'].slice(0, 5) + "</td>";
                table += "<td>" + this['tafel_longfach'] + "</td>";
                table += "<td>" + this['tafel_lehrer'] + "</td>";
                table += "<td>" + this['tafel_raum'] + "</td>";
                table += "</tr>";
            });
            table += "</table>";
            $("#Stundenplan").empty().append(table).fadeIn("2");
        } else {
            $("#Stundenplan").empty().append("<div class='text-center align-self-center'><h1>Ferien</h1><img src='https://i0.wp.com/media.giphy.com/media/5ocAtoAPhIDcI/giphy.gif' alt='gif'></div>").fadeIn("2");
        }
    })
        .fail(function () {
            lblErrorToast.text("Der Stundenplan konnte nicht geladen werden");
            errorToast.show();
        })
}

btnToday.on("click", function () {
    iCWeek = moment().week();
    iYear = moment().year();
    loadScedule(ddlKlasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})

btnBack.on("click", function () {
    iCWeek--;
    loadScedule(ddlKlasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})

btnForward.on("click", function () {
    iCWeek++;
    loadScedule(ddlKlasse.val());
    btnToday.text(iCWeek + "-" + iYear)
})