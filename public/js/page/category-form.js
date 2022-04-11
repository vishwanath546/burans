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
    listOfCategory();
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
        listOfCategory();
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


        $('#alreadyUploadImage').empty();

        if(response.photo && response.photo !==""){
            $('#alreadyUploadImage').append(previousImage(response.photo));
        }

        if(response.status === 1){
            $("input[type='radio'][value='1']").attr("checked",true);
        }else{
            $("input[type='radio'][value='0']").attr("checked",true);
        }
    })

}

function listOfCategory() {

    // let data =new FormData();
    // data.set("categoryId",categoryId);
    app.request("getAllCategories", null, "get").then(response => {
        let accordionTemplate = response.map(getAccordion).join("");
        $("#accordion").empty();
        $("#accordion").append(accordionTemplate);
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}

function getSubCategoryAccordionBody(subcategories) {
    return ` <li class="list-group-item">
                <p class="mb-1">${subcategories.name}</p>
                <small class="text-muted">${subcategories.description}</small>
             </li>`;
}

function getAccordion(category, index) {

    return `<div class="accordion">
                <div class="accordion-header" role="button" data-toggle="collapse" 
                    data-target="#panel-body-${category.category.id}"
                     aria-expanded="${index === 0}">
                    <div class="d-flex align-items-center justify-content-between">
                        <h4>${category.category.name}</h4>
                        <span class="badge badge-white">${category.category.subcategory.length}</span>
                    </div>
                </div>
                <div class="accordion-body collapse ${index === 0 ? 'show' : ''}" 
                    id="panel-body-${category.category.id}" 
                    data-parent="#accordion">
                    <ul class="list-group">
                       ${category.category.subcategory.map(getSubCategoryAccordionBody).join("")}
                    </ul>
                </div>
            </div>`
}

