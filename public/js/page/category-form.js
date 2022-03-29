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
});


function previousImage() {
return `<div class="gallery-item"
             data-image="images/category/1648314083759-504120518-32819.jpg"
             data-title="Image 1"
             href="images/category/1648314083759-504120518-32819.jpg"
             title="Image 1"
             style="height: 100px;
             background-image: url('images/category/1648314083759-504120518-32819.jpg');">
        </div>`
}

function isSubcategory(element) {
    if (element.checked) {
        $("#subcategorySelectionBox").removeClass("d-none");

        app.selectOption('category_id', 'Select Category', {
            url: baseURL + "getAllCategoriesOptions",
            method: 'POST',
            delay: 250,
        });

        app.setValidation('category_id', {
            required: true,
            messages: {
                required: "Select category"
            }
        });
    } else {
        $("#subcategorySelectionBox").addClass("d-none");
        app.removeValidation('category_id')
    }
}

function saveCategorySubCategoryDetails(form) {

    app.request("saveCategorySubcategory", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#category_form").trigger('reset');
        listOfCategory();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
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
                        <span class="badge badge-white">${category.subCategories.length}</span>
                    </div>
                </div>
                <div class="accordion-body collapse ${index === 0 ? 'show' : ''}" 
                    id="panel-body-${category.category.id}" 
                    data-parent="#accordion">
                    <ul class="list-group">
                       ${category.subCategories.map(getSubCategoryAccordionBody).join("")}
                    </ul>
                </div>
            </div>`
}

