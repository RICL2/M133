const timeElapsed = Date.now();
const today = new Date(timeElapsed);
$("#btnBack").on("click",function () {

});

$("#btnDate").on("click",function () {
$("#btnDate").text(today.toLocaleDateString());
});


$("#btnForward").on("click",function () {

});
