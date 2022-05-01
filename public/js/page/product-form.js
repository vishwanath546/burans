let subCategoryId;
$(document).ready(function () {
    subCategoryId = null
    app.formValidation();
    setup();

    let productId = parseInt($("#updateProductId").val());

    if (productId !== 0) {
        getProductDetails(productId);
    } else {
        category()
        addOnsProduct().catch(error => console.log(error));
        getProductOption("ddl_suggested_product").catch(error => console.log("while Product option fetch", error));
        getVendorsOptions('ddl_vendor').catch(error => console.log("while Vendor option fetch", error));
    }
});

function paramNameForSend() {
    return "productImages";
}

function setup() {
    let dropzone = new Dropzone("#productImageDropZone", {
        url: baseURL + "uploadProductsImages",
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
            this.on("complete", function (file) {
                if (this.getUploadingFiles().length === 0 && this.getQueuedFiles().length === 0) {
                    app.successToast("Save Changes");
                    dropzone.removeAllFiles(true);
                }
            });
            //send all the form data along with the files:
            this.on("sendingmultiple", function (data, xhr, formData) {
                formData.append("product_id", $("#imageProduct").val());
            });
        }
    });

    $('.dropzone').sortable({
        items: '.dz-preview',
        cursor: 'move',
        opacity: 0.5,
        containment: '.dropzone',
        distance: 20,
        tolerance: 'pointer',
        stop: function () {
            let queue = dropzone.files;
            let newQueue = [];
            $('.dropzone .dz-preview .dz-filename [data-dz-name]').each(function (count, el) {
                var name = el.innerHTML;
                queue.forEach(function (file) {
                    if (file.name === name) {
                        newQueue.push(file);
                    }
                });
            });
            dropzone.files = newQueue;
        }
    });

}

function category() {
    return app.request("getAllCategoriesOptions", null).then(response => {
        app.selectOption('ddl_category', 'Select Category', null, response.results);
        app.selectOption('ddl_suggested_category', 'Select Category', null, response.results);
        return Promise.resolve(1);
    })

}

function subCategory(id) {
    $('#ddl_sub_category').empty().trigger('change');
    if (id) {
        app.request("getAllSubcategoriesOption/" + id, null).then(response => {
            app.selectOption('ddl_sub_category', 'Select Category', null, response.results);
            if (subCategoryId !== null) {
                $('#ddl_sub_category').val(subCategoryId).trigger('change');
            }
        })
    }
}

function formatRepo(repo) {
    if (repo.loading) {
        return repo.text;
    }

    var $container = $(
        `
              <div class="align-items-center d-flex justify-content-center">
                <img class="mr-3 rounded-circle" width="50" src="${baseURL + repo.photo.replace("public", "")}" alt="avatar">
                  <div class="media-body">
                    <div class="badge badge-pill badge-dark float-right">${repo.price}</div>
                    <h6 class="media-title">${repo.name}</h6>
                  </div>
              </div>`
    );

    return $container;
}

function formatRepoSelection(repo) {
    return repo.name || repo.text;
}

function addOnsProduct() {
    return app.request("getAllAddOnsProductsOptions", null).then(response => {
        app.selectOption('ddl_addOnsProduct', 'Select Add-Ons Product', null, response.results, formatRepo, formatRepoSelection);
        return Promise.resolve();
    });
}

function getProductDetails(productId) {

    let data = new FormData();
    data.set("productId", productId)
    app.request("getProductById", data).then(response => {

        $("#product_name").val(response.name);
        $("#product_description").val(response.description);
        $("#price").val(response.price);
        $("#sale_price").val(response.salePrice);
        $("#price_quantity").val(response.priceQuantity);
        $("#special_delivery_charges").val(response.specialDeliveryCharges);
        $("#product_meta_title").val(response.metaTitle);
        $("#product_meta_description").val(response.metaDescription);
        $("#minStockQuantity").val(response.minStockQty);
        $("#inventoryQuantity").val(response.inventoryQuantity);
        $("#duration").val(response.duration);

        subCategoryId = response.subcategoryId
        addOnsProduct().then(() => {
            if (response.addOnsProducts) {
                $('#ddl_addOnsProduct').val(response.addOnsProducts.split(",")).trigger('change');
            }
        }).catch(error => console.log(error));
        category().then(() => {
            $('#ddl_category').val(response.categoryId).trigger('change');
            subCategory(response.categoryId);
            if (response.suggestedCategory) {
                $('#ddl_suggested_category').val(response.suggestedCategory.split(",")).trigger('change');
            }
        })
        getProductOption("ddl_suggested_product")
            .then(() => {
                if (response.suggestedProducts) {
                    $('#ddl_suggested_product').val(response.suggestedProducts.split(",")).trigger('change');
                }
            })
            .catch(error => console.log("while Product option fetch", error));
        getVendorsOptions('ddl_vendor')
            .then(() => {
                if (response.vendor) {
                    $('#ddl_vendor').val(response.vendor).trigger('change');
                }
            })
            .catch(error => console.log("while Vendor option fetch", error));

        if(parseInt(response.status)===1){
            $("#ck_isActiveStatus").attr("checked",true);
            $("#ck_isInActiveStatus").attr("checked",false);
        }else{
            $("#ck_isInActiveStatus").attr("checked",true);
            $("#ck_isActiveStatus").attr("checked",false);
        }
        if(parseInt(response.type)===1){
            $("#ck_isVeg").attr("checked",true);
            $("#ck_isNonVeg").attr("checked",false);
            $("#ck_isOther").attr("checked",false);
        }else if(parseInt(response.type) ===2){
            $("#ck_isNonVeg").attr("checked",true);
            $("#ck_isVeg").attr("checked",false);
            $("#ck_isOther").attr("checked",false);
        }else{
            $("#ck_isNonVeg").attr("checked",false);
            $("#ck_isVeg").attr("checked",false);
            $("#ck_isOther").attr("checked",true);
        }
        if(parseInt(response.status)===1){
            $("#inventoryTypeDaily").attr("checked",true);
            $("#inventoryTypeOneTime").attr("checked",false);
        }else{
            $("#inventoryTypeOneTime").attr("checked",true);
            $("#inventoryTypeDaily").attr("checked",false);
        }
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}

function saveProductDetails(form) {

    app.request("saveProductDetails", new FormData(form)).then(response => {
        $("#productDetailsForm").trigger('reset');
        $("#ddl_category").empty().trigger('change')
        $("#ddl_addOnsProduct").empty().trigger('change')
        $("#ddl_suggested_product").empty().trigger('change')
        $("#ddl_suggested_category").empty().trigger('change')
        $("#ddl_vendor").empty().trigger('change')
        if ($('.dropzone .dz-preview .dz-filename [data-dz-name]').length > 0) {
            $("#imageProduct").val(response.id);
            $("#productImagesSubmit").click();
        } else {
            app.successToast(response.message);
        }

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
        {data: "name"},
        {data: "description"},
        {data: "categoryId"},
        {data: "description"},
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
