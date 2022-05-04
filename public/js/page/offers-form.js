let selectedProduct=null;
let selectedUsers = null;
$(document).ready(function () {
    app.formValidation();
    $.uploadPreview({
        input_field: "#offers-image",   // Default: .image-upload
        preview_box: "#offers-image-preview",  // Default: .image-preview
        label_field: "#offers-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
    $("#applyTo").on('change', function (e) {
        let selectedValue = parseInt($(this).val());
        if (selectedValue === 2) {
            $("#specifyProductSelectionBox").removeClass("d-none");
            $("#minSubTotalAmountBox").addClass("d-none");
            $("#specifyUserSelectionBox").addClass("d-none");
            app.setValidation('specifyProduct', {
                required: true,
                messages: {
                    required: "Select products"
                }
            })
            app.removeValidation('specifyUser')
            app.removeValidation('minSubTotalAmount')
            getProductOption("specifyProduct")
                .then(response=>{
                    if(selectedProduct!=null){
                        $("#specifyProduct").val(selectedProduct.split(",")).trigger("change");
                    }
                })
                .catch(error => console.log("product fetch", error));
        } else if (selectedValue === 3) {
            $("#specifyProductSelectionBox").addClass("d-none");
            $("#minSubTotalAmountBox").removeClass("d-none");
            $("#specifyUserSelectionBox").addClass("d-none");
            app.setValidation('minSubTotalAmount', {
                required: true,
                messages: {
                    required: "Enter min Sub Total Amount"
                }
            })
            app.removeValidation('specifyProduct')
            app.removeValidation('specifyUser')
        } else if (selectedValue === 4) {
            $("#specifyProductSelectionBox").addClass("d-none");
            $("#minSubTotalAmountBox").addClass("d-none");
            $("#specifyUserSelectionBox").removeClass("d-none");
            app.setValidation('specifyUser', {
                required: true,
                messages: {
                    required: "Select Users"
                }
            })
            app.removeValidation('specifyProduct')
            app.removeValidation('minSubTotalAmount')
        } else {
            $("#specifyProductSelectionBox").addClass("d-none");
            $("#minSubTotalAmountBox").addClass("d-none");
            $("#specifyUserSelectionBox").addClass("d-none");
        }
    });
    let offerId = parseInt($("#updateOfferId").val());
    if (offerId !== 0) {
        app.removeValidation('offers-image');
        getOffersDetails(offerId);
    }
})

function saveOffersDetails(form) {

    app.request("saveCouponCodeDetails", new FormData(form))
        .then((response) => {
            app.successToast(response.body)
            $("#offers_form").trigger('reset');
            $('#offers-image-preview').css("background-image", "none");
            $("#specifyProductSelectionBox").addClass("d-none");
            $("#minSubTotalAmountBox").addClass("d-none");
            $("#specifyUserSelectionBox").addClass("d-none");
        }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })

}


function getOffersDetails(categoryId) {

    let formData = new FormData();
    formData.set("offerId", categoryId)
    app.request("getOfferById", formData).then(response => {
        $("#code").val(response.code);
        $("#description").val(response.description);
        $("#amountOff").val(response.discountAmount);
        $("#minSubTotalAmount").val(response.minSubTotalAmount);
        $("#limitUsers").val(response.limitUsers);
        $("#startDate").val(moment(response.couponStart).format('YYYY-MM-DD'));
        $("#endDate").val(moment(response.couponEnd).format('YYYY-MM-DD'));
        $("#offType").val(response.discountType).trigger("change");
        $("#applyTo").val(response.applyTo).trigger("change");
        if(response.products !=="" && response.products !==null) {
            selectedProduct=response.products;
        }
        if(response.users !=="" && response.users !==null) {
            selectedUsers=response.users;
        }
        if (response.photo && response.photo !== "") {
            $("#offers-image-preview").css({
                "background-image": `url("${baseURL + response.photo.replace("public", "").split("\\").join("/")}")`,
                "background-repeat": " no-repeat",
                "background-position": "left center",
                "background-size": "cover"
            })
        }

    })

}
