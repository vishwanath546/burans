function loginDeliveryBoyVerification(form) {

    app.request("delivery-boy/login", new FormData(form))
        .then(response => {
            location.href = baseURL + "delivery-boy/otp/" + response.id;
        })
        .catch(error => {
            if (error.status === 500) {
                app.errorToast("something went wrong");
            } else {
                app.errorToast(error.message);
            }
        })
}

function otpDeliveryBoyVerification(form) {
    app.request("delivery-boy/otp/verification", new FormData(form))
        .then(response => {
            app.successToast(response.body);
            location.href = baseURL + "delivery-boy/orders/";
        })
        .catch(error => {
            if (error.status === 500) {
                app.errorToast("something went wrong");
            } else {
                app.errorToast(error.message);
            }
        })
}
