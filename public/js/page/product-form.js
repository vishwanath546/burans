$(document).ready(function () {
    app.formValidation();
    category();
    setup();
});

function setup() {
    let dropzone = new Dropzone("#productImageDropZone", {
        url: baseURL+"productImages",
        paramName: "productImages",
        addRemoveLinks: true,
        uploadMultiple: true,
        maxFiles: 4,
        method: 'post',
        parallelUploads: 4,
        autoProcessQueue: false,
        init: function () {
            let submit = document.querySelector('#productImagesSubmit');
            mydropzone = this;
            submit.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                mydropzone.processQueue();
            });
            this.on("success", function (file, response) {
                alert(response);
            });
        }
    });

}

function category() {
    app.selectOption('ddl_category', 'Select Category', {
        url: baseURL + "getAllCategoriesOptions",
        method: 'POST',
        delay: 250,
    });
}

function subCategory(id) {
    $('#ddl_sub_category').val(null).trigger('change');
    app.selectOption('ddl_sub_category', 'Select Category', {
        url: baseURL + "getAllSubcategoriesOption/" + id,
        method: 'POST',
        delay: 250,
    });
}

function saveProductDetails(form) {

    app.request("saveProductDetails", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#productDetailsForm").trigger('reset');

    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}
