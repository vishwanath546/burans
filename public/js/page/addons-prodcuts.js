$(document).ready(function () {
    loadAddOnsProductsTable()
})

function loadAddOnsProductsTable() {

    app.dataTable("AddOnsProductTable", {
        url: "getAllAddOnsProductsTables"
    }, [
        {
            data: "photo",
            render: (d, t, r, m) => {
                if(d) {
                    return `<img src="${baseURL + d.replace("public", "")}" alt="${r["name"]}" class="mr-3 rounded" width="45" />`
                }else{
                    return '';
                }
            }
        },

        {data: "name"},
        {data: "description"},
        {data: "price"},
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
                        <a href="/update-add-ons-product/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteAddOnsProduct(${d})"
                            data-original-title="Delete"
                        >
                            <i class="fa fa-trash-alt"></i>
                        </button>
                    </div>`
            }
        },

    ],undefined,() => {
        app.confirmationBox()
    })
}

function deleteAddOnsProduct(id) {

    let data = new FormData();
    data.set("productId",id);
    app.request("deleteAddOnsProduct",data,'delete').then(response=>{
        loadAddOnsProductsTable();
        app.successToast(response.body);
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}

