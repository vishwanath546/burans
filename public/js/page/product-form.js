$(document).ready(function () {
    app.formValidation();

    category();
    getProductDetails();
    setup();
});
function paramNameForSend() {
    return "productImages";
}
function setup() {
    let dropzone = new Dropzone("#productImageDropZone", {
        url: baseURL+"uploadProductsImages",
        paramName: paramNameForSend,
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
            //send all the form data along with the files:
            this.on("sendingmultiple", function(data, xhr, formData) {
                formData.append("product_id", $("#imageProduct").val());
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

function getProductDetails(){
    let productId = parseInt($("#updateProductId").val());
    if(productId !== 0){
        let data = new FormData();
        data.set("productId",productId)
        app.request("getProductById",data).then(response=>{

            $("#product_name").val(response.name);
            $("#product_description").val(response.description);
            $("#price").val(response.price);
            $("#sale_price").val(response.salePrice);
            $("#price_quantity").val(response.priceQuantity);
            $("#special_delivery_charges").val(response.specialDeliveryCharges);


            $("#product_meta_title").val(response.metaTitle);
            $("#product_meta_description").val(response.metaDescription);
            $('#ddl_category').val(response.categoryId).trigger('change');
            $('#ddl_sub_category').val(response.subCategoryId).trigger('change');

        }).catch(error=>{
            if (error.status === 500) {
                app.errorToast("something went wrong");
            } else {
                app.errorToast(error.message);
            }
        })
    }
}

function saveProductDetails(form) {

    app.request("saveProductDetails", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#productDetailsForm").trigger('reset');
        console.log(response.product);
        $("#imageProduct").val(response.product.id);
        $("#productImagesSubmit").click();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}

function loadCategoryTable() {

    app.dataTable("categoriesTable", {
        url: "getAllCategoriesTables"
    }, [
        { data: "name" },
        { data: "description" },
        { data: "categoryId" },
        { data: "description" },
        {
            data: "status",
            render: (d, t, r, m) => {
                if (d === 1) {
                    return `<span class="badge badge-success">Active</span>`;
                } else {
                    return `<span class="badge badge-danger">Inactive</span>`;
                }

            }
        },
        {
            data: "id",
            render: (d, t, r, m) => {
                return `
                    <div class="btn btn-action">
                        <a href="/create-categories/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteCategory(${d})"
                            data-original-title="Delete"
                        >
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </div>`
            }
        },

    ], undefined, () => {
        app.confirmationBox()
    })
}
