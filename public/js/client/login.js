$(document).ready(function () {
    app.formValidation();
    $(".inputs").keyup(function () {
        if (this.value.length == this.maxLength) {
            $(this).next('.inputs').focus();
        }
    });
});
function loginVerification(form) {
    app.request("client/loginVerification", new FormData(form)).then(response => {
        location.href=baseURL+"client/otpVerification/"+response.id
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}
