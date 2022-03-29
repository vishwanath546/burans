$(document).ready(function () {
    loadCategoryTable()
})

function loadCategoryTable() {

    app.dataTable("categoriesTable", {
        url: "getAllCategoriesTables"
    }, [
        {
            data: "photo",
            render: (d, t, r, m) => {
                return `<img src="${baseURL+d.replace("public","")}" alt="${r["name"]}" class="mr-3 rounded" width="45" />`
            }
        },

        {data: "name"},
        {data: "description"},
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

    ],undefined,() => {
        app.confirmationBox()
    })
}

function deleteCategory(id) {

    let data = new FormData();
    data.set("categoryId",id);
    app.request("",data,'delete').then(response=>{
        loadCategoryTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}

function statusUpdate(categoryId,status) {
    let data = new FormData();
    data.set("categoryId",categoryId);
    data.set("status",status);
    app.request("",data,'put').then(response=>{
        app.successToast(response.body);
        loadCategoryTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}
