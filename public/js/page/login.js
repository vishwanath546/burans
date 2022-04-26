$(document).ready(function () {
    app.formValidation();

});

function loginValidation(form) {
    app.request("admin/verification",new FormData(form))
        .then(response=>{
            app.successToast(response.body);
            setTimeout(()=>{
                location.href="dashboard";
            },100);
        }).catch(error=>{
            app.errorToast(error.responseJSON.message);
    })
}
