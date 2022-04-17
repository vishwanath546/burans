$(document).ready(function () {
    app.formValidation();
    $.uploadPreview({
        input_field: "#service-image",   // Default: .image-upload
        preview_box: "#service-image-preview",  // Default: .image-preview
        label_field: "#service-image-label",    // Default: .image-label
        label_default: "Choose File",   // Default: Choose File
        label_selected: "Change File",  // Default: Change File
        no_label: false,                // Default: false
        success_callback: null          // Default: null
    });
    listOfServices();
    let serviceId = parseInt($("#updateServiceId").val());
    if(serviceId!==0){
        getServiceDetails(serviceId);
    }
});


function previousImage(imagePath) {
    return `<div class="d-flex flex-column" style="width: 150px;height: 150px;">
              <img alt="image" src="${baseURL+imagePath.replace("public","")}" class="author-box-picture"> 
            </div>`
}

function loadServiceOptions() {

    return app.request("getAllServiceOptions",null).then(response=>{
        app.selectOption('service_id', 'Select Service', null, response.results);
        return Promise.resolve();
    })

}

function isSubService(element) {
    if (element.checked) {
        $("#subServiceSelectionBox").removeClass("d-none");
        loadServiceOptions().then(()=>{
            app.setValidation('service_id', {
                required: true,
                messages: {
                    required: "Select service"
                }
            });
        }).catch(error =>console.log(error))
    } else {
        $("#subServiceSelectionBox").addClass("d-none");
        app.removeValidation('service_id')
    }
}

function saveServiceDetails(form) {

    app.request("saveService", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#service_form").trigger('reset');
        $('#service-image-preview').css("background-image", "none");
        $('#alreadyUploadImage').empty();
        $("#subServiceSelectionBox").addClass("d-none");
        app.removeValidation('service_id')
        listOfServices();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}


function getServiceDetails(serviceId) {

    let formData = new FormData();
    formData.set("serviceId",serviceId)
    app.request("getService",formData).then(response=>{
        $("#name").val(response.name);
        $("#description").val(response.description);
        if(parseInt(response.isSubService)===1){
            $("#chkIsSubService").attr("checked",true);
            $("#subServiceSelectionBox").removeClass("d-none");
            loadServiceOptions().then(()=>{
                $("#service_id").val(response.serviceID).trigger('change');
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

        if(parseInt(response.status) === 1){
            $("input[type='radio'][value='1']").attr("checked",true);
        }else{
            $("input[type='radio'][value='0']").attr("checked",true);
        }
    })

}

function listOfServices() {

    // let data =new FormData();
    // data.set("categoryId",categoryId);
    app.request("getAllService", null, "get").then(response => {
        let accordionTemplate = response.map(getAccordion).join("");
        $("#serviceAccordion").empty();
        $("#serviceAccordion").append(accordionTemplate);
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

function getAccordion(item, index) {

    return `<div class="accordion">
                <div class="accordion-header" role="button" data-toggle="collapse" 
                    data-target="#panel-body-${item.service.id}"
                     aria-expanded="${index === 0}">
                    <div class="d-flex align-items-center justify-content-between">
                        <h4>${item.service.name}</h4>
                        <span class="badge badge-white">${item.subService.length}</span>
                    </div>
                </div>
                <div class="accordion-body collapse ${index === 0 ? 'show' : ''}" 
                    id="panel-body-${item.service.id}" 
                    data-parent="#serviceAccordion">
                    <ul class="list-group">
                       ${item.subService.map(getSubCategoryAccordionBody).join("")}
                    </ul>
                </div>
            </div>`
}

