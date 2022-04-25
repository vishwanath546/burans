$(document).ready(function () {
    loadDeliveryTable()
})

function loadDeliveryTable() {

    app.dataTable("deliveryBoyTables", {
        url: "getAllDeliveryBoysTables"
    }, [
        {
            data: "photo",
            render: (d, t, r, m) => {
                if (d) {
                    return `<img src="${baseURL + d.replace("public", "")}" alt="${r["name"]}" class="mr-3 rounded" width="45" />`
                } else {
                    return '';
                }
            }
        },

        {data: "name"},
        {data: "email"},
        {data: "mobileNumber"},
        {
            data: "areas",
            render: (d, t, r, m) => {
                if (d !== null && d !== "") {
                    return d.split(',').map(i => `<small><span class="badge badge-success">${i}</span></small>`).join(" ")
                }
            }
        },
        {data: "license"},
        {data: "bikeRc"},
        {
            data: "id",
            render: (d, t, r, m) => {
                return `<span class="badge badge-success">Active</span>`;
            }
        },
        {
            data: "id",
            render: (d, t, r, m) => {
                let confirm=``;
                if(r["adminConfirmOn"] === 0){
                    confirm=  `<button class="btn btn-primary">
                            <i class="fa fa-check"></i>    
                     </button> `
                }
                return `
                    <div class="btn btn-action">
                        ${confirm}
                        <a href="/update-delivery-boy/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteDeliveryBoy(${d})"
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

function deleteDeliveryBoy(id) {

    let data = new FormData();
    data.set("deliveryBoyId", id);
    app.request("deleteDeliveryBoy", data, 'delete').then(response => {
        loadDeliveryTable();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}

function statusUpdate(categoryId, status) {
    let data = new FormData();
    data.set("categoryId", categoryId);
    data.set("status", status);
    app.request("", data, 'put').then(response => {
        app.successToast(response.body);
        loadCategoryTable();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}
