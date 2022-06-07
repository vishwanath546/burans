$(document).ready(function () {
  app.formValidation();
  $(".inputs").keyup(function () {
    $(this.parentElement).next(".col").children().focus();
    console.log(this.value);
  });
  $(".inputs").focusin(function () {
    this.value = "";
  });
  $("#otpVerification").validate({
    rules: {
      otpNumberOne: "required",
      otpNumberSecond: "required",
      otpNumberThree: "required",
      otpNumberFour: "required",
    },
    messages: {
      otpNumberOne: "Please Enter Valid OTP",
      otpNumberSecond: "Please Enter Valid OTP",
      otpNumberThree: "Please Enter Valid OTP",
      otpNumberFour: "Please Enter Valid OTP",
    },
    errorClass: "text-danger",
    errorElement: "span",
    submitHandler: otpVerification,
    errorPlacement: function (error) {
      let placement = $("#otp-error");
      $(placement).empty();
      $(placement).append(error);
    },
  });
});

function loginVerification(form) {
  app
    .request("client/loginVerification", new FormData(form))
    .then((response) => {
      location.href = baseURL + "client/otp/" + response.id;
    })
    .catch((error) => {
      if (error.status === 500) {
        app.errorToast("something went wrong");
      } else {
        app.errorToast(error.message);
      }
    });
}

function otpVerification(form) {
  app
    .request("client/otpVerification", new FormData(form))
    .then((response) => {
        location.href = baseURL + "client/location";
    })
    .catch((error) => {
      if (error.status === 500) {
        app.errorToast("something went wrong");
      } else {
        app.errorToast(error.message);
      }
    });
}
