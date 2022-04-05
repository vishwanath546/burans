$(document).ready(function () {
    app.formValidation();
    getAreas();
    $.uploadPreview({
        input_field: "#shop-image",   // Default: .image-upload
        preview_box: "#shop-image-preview",  // Default: .image-preview
        label_field: "#shop-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
    let vendor = parseInt($("#updateVendorId").val());
    if(vendor!==0){
        getVendorDetails(vendor);
    }
});

function getAreas() {

    app.selectOption('area', 'Select area', null,[
        {id:1,text:"Panvel"},
        {id:2,text:"Vashi"},
        {id:3,text:"Dadar"},
        {id:4,text:"Thane"}
    ]);
}

function saveVendorDetails(form) {
    let vendor = parseInt($("#updateVendorId").val());
    let requestUrl = "vendor/saveVendorDetails"
    let type="post";
    if(vendor!==0){
        requestUrl = "vendor/saveUpdateVendorDetails/"+vendor;
    }
    app.request(requestUrl, new FormData(form),type).then(response => {
        app.successToast(response.body)
        $("#vendorDetailsForm").trigger('reset');
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}

function getVendorDetails(vendor) {


        let form = new FormData();
        form.set("vendorId",vendor);
        app.request("vendor/getVendorDetails", form).then(response => {

            $("#name").val(response.name);
            $("#mobileNumber").val(response.mobileNumber);
            $("#email").val(response.email);
            $("#area").val(response.area);
            $("#shopName").val(response.shopName);
            $("#address").val(response.address);
            $("#gstNumber").val(response.gstNumber);
            $("#foodLicense").val(response.foodLicense);

        }).catch(error => {
            if (error.status === 500) {
                app.errorToast("something went wrong");
            } else {
                app.errorToast(error.message);
            }
        })
}

