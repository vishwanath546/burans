$(document).ready(function () {
    app.formValidation();
    $.uploadPreview({
        input_field: "#shop-image",   // Default: .image-upload
        preview_box: "#shop-image-preview",  // Default: .image-preview
        label_field: "#shop-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
});

function saveVendorDetails(form) {
    console.log(form)
}
