$(document).ready(function () {
    app.formValidation();
});

function SignUp(from){
    app.request("client/signup",new FormData(from))
        .then(response=>{
            location.href=baseURL+'client/otpVerification/'+response.data;
        })
        .catch(error=>{
            if (error.status === 500) {
                app.errorToast("something went wrong");
            } else {
                app.errorToast(error.message);
            }

        })
}
