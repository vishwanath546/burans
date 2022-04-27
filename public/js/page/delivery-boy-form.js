$(document).ready(function () {
    app.formValidation();
    app.removeValidation('profile-image', 'required');
    previewUpload("#profile-image-label", "#profile-image-preview", "#profile-image");
    previewUpload("#license-image-label", "#license-image-preview", "#license-image");
    previewUpload("#rc-image-label", "#rc-image-preview", "#rc-image");
    let deliveryBoyId = parseInt($("#deliveryBoyId").val());

    if (deliveryBoyId !== 0) {
        getDeliveryBoy(deliveryBoyId);


    } else {
        getLocationOptions('area').catch(error => console.log("location Fetch error", error));
        getVendorsOptions('vendor').catch(error => console.log("vendor fetch error", error));
    }

});

function previewUpload(label_field, preview_box, input_field) {
    $.uploadPreview({
        input_field: input_field,   // Default: .image-upload
        preview_box: preview_box,  // Default: .image-preview
        label_field: label_field,    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
}

function getDeliveryBoy(deliveryBoyId) {
    let formData = new FormData();
    formData.set("deliveryBoyId", deliveryBoyId)
    app.request("getDeliveryBoy", formData).then(response => {
        $("#name").val(response.name);
        $("#mobileNumber").val(response.mobileNumber);
        $("#email").val(response.email);
        $("#address").val(response.address);
        $("#license").val(response.license);
        $("#bikeRc").val(response.bikeRc);

        if (response.photo && response.photo !== "") {
            $("#profile-image-preview").css({
                "background-image": `url("${baseURL + response.photo.replace("public", "").split("\\").join("/")}")`,
                "background-repeat": " no-repeat",
                "background-position": "left center",
                "background-size": "cover"
            })
        }
        if (response.bikeRcPhoto && response.bikeRcPhoto !== "") {
            $("#rc-image-preview").css({
                "background-image": `url("${baseURL + response.bikeRcPhoto.replace("public", "").split("\\").join("/")}")`,
                "background-repeat": " no-repeat",
                "background-position": "left center",
                "background-size": "cover"
            })
        }
        if (response.licensePhoto && response.licensePhoto !== "") {
            $("#license-image-preview").css({
                "background-image": `url("${baseURL + response.licensePhoto.replace("public", "").split("\\").join("/")}")`,
                "background-repeat": " no-repeat",
                "background-position": "left center",
                "background-size": "cover"
            })
        }

        getLocationOptions('area')
            .then(() => {
                $("#area").val(response.areas.split(",")).trigger('change');
            })
            .catch(error => console.log("location Fetch error", error));

        getVendorsOptions("vendor").then(() => {
            $("#vendor").val(response.vendors.split(",")).trigger('change');
        }).catch(error => console.log(error))

        if (response.status === 1) {
            $("input[type='radio'][value='1']").attr("checked", true);
        } else {
            $("input[type='radio'][value='0']").attr("checked", true);
        }
    })

}

function saveDeliveryBoyDetails(form) {
    let delivery = parseInt($("#deliveryBoyId").val());
    let requestUrl = "saveDeliveryBoyDetails"
    let type = "post";
    if (delivery !== 0) {
        requestUrl = "saveUpdateDeliveryDetails/" + delivery;
    }
    app.request(requestUrl, new FormData(form), type).then(response => {
        app.successToast(response.body)
        $("#deliveryBoyForm").trigger('reset');
        $('#profile-image-preview').css("background-image", "none");
        $('#license-image-preview').css("background-image", "none");
        $('#rc-image-preview').css("background-image", "none");
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}

function previousImage(imagePath) {
    return `<div class="d-flex justify-content-center" style="width: 150px;height: 150px;">
              <img alt="image" src="${baseURL + imagePath.replace("public", "")}" class="author-box-picture"> 
            </div>`
}
