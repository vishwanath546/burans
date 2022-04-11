$(document).ready(function () {
    app.formValidation();
    $.uploadPreview({
        input_field: "#product-image",   // Default: .image-upload
        preview_box: "#product-image-preview",  // Default: .image-preview
        label_field: "#product-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
    let productId = parseInt($("#updateProductId").val());
    if (productId !== 0) {
        getProductDetails(productId);
    } else {
    }
});

function saveAddOnProductDetails(form) {

    app.request("saveAddOnsProductDetails", new FormData(form)).then(response => {
        $("#add_ons_product_form").trigger('reset');
        $('#product-image-preview').css("background-image", "none");
        $('#alreadyUploadImage').empty();
        app.successToast(response.body);
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}

function getProductDetails(productId) {

    let data = new FormData();
    data.set("productId", productId)
    app.request("getAddOnsProduct", data).then(response => {
        $("#name").val(response.name);
        $("#description").val(response.description);
        $("#price").val(response.price);
        $('#alreadyUploadImage').empty();
        if(response.photo && response.photo !==""){
            $('#alreadyUploadImage').append(previousImage(response.photo));
        }
        if(response.status === 1){
            $("input[type='radio'][value='1']").attr("checked",true);
        }else{
            $("input[type='radio'][value='0']").attr("checked",true);
        }
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}



function previousImage(imagePath) {
    return `<div class="d-flex flex-column" style="width: 150px;height: 150px;">
              <img alt="image" src="${baseURL+imagePath.replace("public","")}" class="author-box-picture"> 
            </div>`
}
