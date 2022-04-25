const beruf = $("#berufe");
const klasse = $("#klasse");
const classes = $("#class");
const knöpfe = $("#knöpfe");
const back = $("#back");
const heute = $("#heute");
const next = $("#next");
const label = $("#label");
const errorToastEl = $("#liveToast")
const error = new bootstrap.Toast(label);
var table = '';

moment.locale("de");
let Week = moment().week();
let Year = moment().year();

classes.hide();
knöpfe.hide();

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
            label.text("Leider konnten die Berufe nicht geladen werden...");
            error.show();
        })
    heute.text(Week + "-" + Year)
});

beruf.on("change", function() {
    classes.show();
    knöpfe.hide();
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
            label.text("Leider konnten die Klassen nicht geladen werden...");
            error.show();
        })
})

klasse.on("change", function() {
    knöpfe.show();
    localStorage.setItem("klasse_id", klasse.val());
    loadScedule(klasse.val());
})

function loadScedule(klasse_id) {

    $("#stundenplan").fadeOut();
    $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id + "&woche=" + Week + "-" + Year).done(function(data) {
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
                $("#stundenplan").empty().append(table).fadeIn();
            } else {
                $("#stundenplan").empty().append("<div class='text-center align-self-center'><h1>Urlaub</h1><img src='https://i.pinimg.com/originals/ad/1f/26/ad1f264d397e054a0b478fbb38a28217.gif'></div>").fadeIn("3");
            }
        })
        .fail(function() {
            label.text("Leider konnte der Stundenplan nicht geladen werden...");
            error.show();
        })
}

heute.on("click", function() {
    Week = moment().week();
    Year = moment().year();
    loadScedule(klasse.val());
    heute.text(Week + "-" + Year)
})

back.on("click", function() {
    Week--;
    loadScedule(klasse.val());
    heute.text(Week + "-" + Year)
})

next.on("click", function() {
    Week++;
    loadScedule(klasse.val());
    heute.text(Week + "-" + Year)
})