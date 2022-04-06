$(document).ready(function () {
    loadProductsTable()
})

function loadProductsTable() {

    app.dataTable("productTables", {
        url: "getAllProductsTables"
    }, [
        {data: "name"},
        {data: "description"},
        {data: "category_name"},
        {data: "subCategory_name"},
        {data: "price"},
        {data: "salePrice"},
        {data: "priceQuantity"},
        {data: "specialDeliveryCharges"},
        {
            data: "status",
            render: (d, t, r, m) => {
                if(d===1){
                    return `<span class="badge badge-success">Active</span>`;
                }else{
                    return `<span class="badge badge-danger">Inactive</span>`;
                }

            }
        },
        {
            data: "id",
            render: (d, t, r, m) => {
                return `
                    <div class="btn btn-action">
                        <a href="/update-product/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteProduct(${d})"
                            data-original-title="Delete">
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </div>`
            }
        },

    ],undefined,() => {
        app.confirmationBox()
    })
}

function deleteProduct(id) {

    let data = new FormData();
    data.set("productId",id);
    app.request("deleteProduct",data,'delete').then(response=>{
        loadProductsTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}
