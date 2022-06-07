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
        submitHandler: otpDeliveryBoyVerification,
        errorPlacement: function (error) {
            let placement = $("#otp-error");
            $(placement).empty();
            $(placement).append(error);
        },
    });
});
