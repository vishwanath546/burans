$(document).ready(function () {
  $('input[id="payment_type"]').click(function () {
    if ($(this).prop("checked") == true) {
      $("#payment_div").removeClass("d-none");
    } else if ($(this).prop("checked") == false) {
      $("#payment_div").addClass("d-none");
    }
  });
  getCartList();
});

function getCartList() {
  app
    .request("client/getCartList", "", "POST")
    .then((response) => {
      $("#final_pay").empty();
      if (response.status) {
        $("#final_pay").append(`Pay Rs.${response.finalPrice}`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function insert_order() {
  let data = new FormData();
  data.set("payment_mode", $("#payment_type").val());
  app
    .request("client/insertOrder", data, "POST")
    .then((response) => {
      if (response.status) {
        app.successToast(response.body);
        window.location.href = `${baseURL}client/home`;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      console.log(error);
    });
}
