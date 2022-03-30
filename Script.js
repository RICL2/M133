const ddlBeruf = $("#ddlBeruf"); //Elemente definiert
const ddlKlasse = $("#ddlKlasse");
const rowKlasse = $("#rowKlasse");
const rowHide = $("#rowHide");
const btnBack = $("#btnBack");
const btnToday = $("#btnToday");
const btnForward = $("#btnForward");
const lblErrorToast = $("#lblToast");
const errorToastEl = $("#liveToast")
const errorToast = new bootstrap.Toast(errorToastEl);

moment.locale("de"); //js-libary konfiguriert
let iCWeek = moment().week(); //aktuelle Woche in variable gespeichert
let iYear = moment().year(); // aktuelles Jahr in variable gespeichert

rowKlasse.hide(); // elemente ausgeblendet welche nicht verwednet werden
rowHide.hide();

$(document).ready(function () { // wenn die seite feriig geladen ist ...
    $.getJSON("http://sandbox.gibm.ch/berufe.php").done(function (data) { //daten per api im json-format geholt
        $.each(data, function () { //durch das json geloopt
            ddlBeruf.append($("<option></option>").val(this['beruf_id']).html(this['beruf_name'])); //das Dropdown der berufe mit den Daten gefüllt
        })

        if (localStorage.getItem("beruf_id") !== null && localStorage.getItem("klasse_id") !== null) { //überprüfung ob localstorage gesetzt wurde
            ddlBeruf.val(localStorage.getItem("beruf_id")).change(); //dropdown beruf gefüllt falls localstorage nicht leer ist
        }
    })
        .fail(function () { //funktion falls die Daten nicht geladen werden konnten
            lblErrorToast.text("Die Berufe konnten nicht geladen werden"); //Toast-Text angepasst und angezeigt
            errorToast.show();
        })
    btnToday.text(iCWeek + "-" + iYear) //aktuelles Datum auf button angezeigt
});

ddlBeruf.on("change", function () { //wennn dropdown geändert wird...
    rowKlasse.show(); //dropdown der klassen anzeigen
    rowHide.hide(); //elemente ausgeblendet welche nicht verwendet werden
    ddlKlasse.empty(); //dropdown der klassen geleert
    ddlKlasse.append($("<option></option>").html('Wählen Sie eine Klasse aus')); //dropdown der klassen default tag hinzugefügt
    $.getJSON("http://sandbox.gibm.ch/klassen.php?beruf_id=" + ddlBeruf.val()).done(function (data) { //daten per api im json-format geholt
        $.each(data, function () { //duch das json geloopt
            ddlKlasse.append($("<option></option>").val(this['klasse_id']).html(this['klasse_longname'])); //das Dropdown der klasse mit den Daten gefüllt
        })
        localStorage.setItem("beruf_id", ddlBeruf.val()); //localstorage mit der beruf_id gefüllt

        if(localStorage.getItem("klasse_id") !== null) //überprüfung ob localstorage gesetzt wurde
        {
            ddlKlasse.val(localStorage.getItem("klasse_id")).change(); //dropdown beruf gefüllt falls localstorage nicht leer ist
        }
    })
        .fail(function () { //funktion falls die Daten nicht geladne werden konnten
            lblErrorToast.text("Die Klassen konnten nicht geladen werden"); //Toast-Text angepasst und angezeigt
            errorToast.show();
        })
})

ddlKlasse.on("change", function () { //wenn dropdown geändert wird...
    rowHide.show(); //table mit dem Stundenplan angezeigt
    localStorage.setItem("klasse_id", ddlKlasse.val()); //localstorage mit der klassen_id gefüllt
    loadScedule(ddlKlasse.val()); //function zum laden des stundenplansaufgerufen und klasse_id mitgegeben
})

function loadScedule(klasse_id) { //funktion zum laden des stundenplans
    var table = '';
    $.getJSON("http://sandbox.gibm.ch/tafel.php?klasse_id=" + klasse_id + "&woche=" + iCWeek + "-" + iYear).done(function (data) { //daten per api im json-format geholt mit aktueller woche und Jahr
        if (data.length > 2) { //Überprüfung ob Ferien sind oder nicht
            table += "<table class='table table-dark table-responsive'><thead class='fw-bold'><th scope='col'>Datum</th><th scope='col'>Wochentag</th><th scope='col'>Von-Bis</th><th scope='col'>Fach</th><th scope='col'>Lehrer</th><th scope='col'>Zimmer</th></thead>"; //stundenplan designt und erstellt
            $.each(data, function () {
                table += "<tr>"
                table += "<td>" + moment(this['tafel_datum']).format("DD-MM-YYYY") + "</td>"; //Datum in zahlen
                table += "<td>" + moment(this['tafel_datum']).format('dddd') + "</td>"; //wochentag
                table += "<td>" + this['tafel_von'].slice(0, 5) + " bis " + this['tafel_bis'].slice(0, 5) + "</td>"; //zeit
                table += "<td>" + this['tafel_longfach'] + "</td>"; //fach
                table += "<td>" + this['tafel_lehrer'] + "</td>"; //lehrer
                table += "<td>" + this['tafel_raum'] + "</td>"; //zimmer
                table += "</tr>";
            });
            table += "</table>";
            $("#Stundenplan").empty().append(table).fadeIn("2"); //div geleert und table stundenplan hinzugefügt
        } else {
            $("#Stundenplan").empty().append("<div class='text-center align-self-center'><h1>Ferien</h1><img src='https://i0.wp.com/media.giphy.com/media/5ocAtoAPhIDcI/giphy.gif' alt='gif'></div>").fadeIn("2"); //falls ferien = gif angezeigt und ferien geschrieben
        }
    })
        .fail(function () { //funktion falls die Daten nicht geladne werden konnten
            lblErrorToast.text("Der Stundenplan konnte nicht geladen werden"); //Toast-Text angepasst und angezeigt
            errorToast.show();
        })
}

btnToday.on("click", function () { //per btn klick wird auf die heutige Woche gewechselt
    iCWeek = moment().week(); //variable mit akuteller woche überschireben
    iYear = moment().year(); //variable mit akutellem Jahr überschireben
    loadScedule(ddlKlasse.val()); //stundenplan neu geladen mit klasse_id
    btnToday.text(iCWeek + "-" + iYear) //btn text geändert
})

btnBack.on("click", function () { //per btn klick eine woche zurück
    iCWeek--; //minus eine Woche
    loadScedule(ddlKlasse.val()); //stundenplan neu geladen mit klasse_id
    btnToday.text(iCWeek + "-" + iYear) //btn text geändert
})

btnForward.on("click", function () {
    iCWeek++; //plus eine Woche
    loadScedule(ddlKlasse.val()); //stundenplan neu geladen mit klasse_id
    btnToday.text(iCWeek + "-" + iYear) //btn text gewechselt
})