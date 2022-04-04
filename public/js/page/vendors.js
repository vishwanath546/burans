$(document).ready(function () {
    loadCategoryTable();
});


function loadCategoryTable() {

    app.dataTable("vendorsTable", {
        url: "vendor/getAllVendors"
    }, [
        {
            data: "avatar",
            render: (d, t, r, m) => {
                if(d!==""){
                    return `<img src="${baseURL+d.replace("public","")}" alt="${r["name"]}" class="mr-3 rounded" width="45" />`
                }else{
                    return `<img src="/assets/images/avatar-logo/avatar-1.png" class="mr-3 rounded" width="45" />`
                }

            }
        },

        {data: "name"},
        {data: "email"},
        {data: "mobileNumber"},
        {data: "gstNumber"},
        {data: "foodLicense"},
        {data: "area"},
        {
            data: "accountStatus",
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
                        <a href="/update-vendor/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteVendor(${d})"
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

function deleteVendor(id) {
    let data = new FormData();
    data.set("vendorId",id);
    app.request("deleteVendor",data,'delete').then(response=>{
        loadCategoryTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}
