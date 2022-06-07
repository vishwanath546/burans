$(document).ready(function () {
    app.formValidation();
    $.uploadPreview({
        input_field: "#category-image",   // Default: .image-upload
        preview_box: "#category-image-preview",  // Default: .image-preview
        label_field: "#category-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
    let categoryId = parseInt($("#updateCategoryId").val());
    if(categoryId!==0){
        getCategoryDetails(categoryId);
    }
});


function previousImage(imagePath) {
    return `<div class="d-flex flex-column" style="width: 150px;height: 150px;">
              <img alt="image" src="${baseURL+imagePath.replace("public","")}" class="author-box-picture"> 
            </div>`
}

function loadCategoryOptions() {

    return app.request("getAllCategoriesOptions",null).then(response=>{
        app.selectOption('category_id', 'Select Category', null, response.results);
        return Promise.resolve();
    })
}

function isSubcategory(element) {
    if (element.checked) {
        $("#subcategorySelectionBox").removeClass("d-none");
        loadCategoryOptions().then(()=>{
            app.setValidation('category_id', {
                required: true,
                messages: {
                    required: "Select category"
                }
            });
        }).catch(error =>console.log(error))
    } else {
        $("#subcategorySelectionBox").addClass("d-none");
        app.removeValidation('category_id')
    }
}

function saveCategorySubCategoryDetails(form) {

    app.request("saveCategorySubcategory", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#category_form").trigger('reset');
        $('#category-image-preview').css("background-image", "none");
        $('#alreadyUploadImage').empty();
        $("#subcategorySelectionBox").addClass("d-none");
        app.removeValidation('category_id')
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}


function getCategoryDetails(categoryId) {

    let formData = new FormData();
    formData.set("categoryId",categoryId)
    app.request("getCategoryById",formData).then(response=>{
        $("#name").val(response.name);
        $("#description").val(response.description);
        if(response.isSubcategory===1){
            $("#chkIsSubcategory").attr("checked",true);
            $("#subcategorySelectionBox").removeClass("d-none");
            loadCategoryOptions().then(()=>{
                $("#category_id").val(response.category_id).trigger('change');
                app.setValidation('category_id', {
                    required: true,
                    messages: {
                        required: "Select category"
                    }
                });

            }).catch(error =>console.log(error))
        }else{
            $("#chkIsSubcategory").attr("checked",false);
        }
        if(response.isService===1){
            $("#ck_isService").attr("checked",true);
        }else{
            $("#ck_isService").attr("checked",false);
        }

        if (response.photo && response.photo !== "") {
            $("#category-image-preview").css({
                "background-image": `url("${baseURL + response.photo.replace("public", "").split("\\").join("/")}")`,
                "background-repeat": " no-repeat",
                "background-position": "left center",
                "background-size": "cover"
            })
        }

        if(response.status === 1){
            $("input[type='radio'][value='1']").attr("checked",true);
        }else{
            $("input[type='radio'][value='0']").attr("checked",true);
        }
    })

}

