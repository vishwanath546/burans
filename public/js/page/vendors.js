$(document).ready(function () {
    loadVendorTable();
    $("#fire-modal-approval").on("shown.bs.modal", (e) => {
        let id = parseInt($(e.relatedTarget).data('id'));
        getVendorDetails(id);
    });
});


function loadVendorTable() {

    app.dataTable("vendorsTable", {
        url: "vendor/getAllVendors"
    }, [
        {
            data: "avatar",
            render: (d, t, r, m) => {
                if (d !== "") {
                    return `<img src="${baseURL + d.replace("public", "")}" alt="${r["name"]}" class="mr-3 rounded" width="45" />`
                } else {
                    return `<img src="/assets/images/avatar-logo/avatar-1.png" class="mr-3 rounded" width="45" />`
                }

            }
        },

        {data: "name"},
        {data: "email"},
        {data: "mobileNumber"},
        {data: "gstNumber"},
        {data: "foodLicense"},
        {
            data: "area",
            render: (d, t, r, m) => {
                if (d !== "" && d !== null) {
                    return d.split(",").map(i => `<small><span class="badge badge-success">${i}</span></small>`).join(" ");
                }
            }
        },
        {
            data: "accountStatus",
            render: (d, t, r, m) => {
                if (parseInt(d) === 1) {
                    return `<span class="badge badge-success">Active</span>`;
                } else {
                    return `<span class="badge badge-danger">Inactive</span>`;
                }

            }
        },
        {
            data: "id",
            render: (d, t, r, m) => {
                let confirm = ``;
                if (r["adminConfirmOn"] === 0) {
                    confirm = `<button class="btn btn-primary"  data-toggle="modal" data-id="${d}" data-target="#fire-modal-approval">
                            <i class="fa fa-check"></i>    
                     </button> `
                }
                return `
                    <div class="btn btn-action">
                        ${confirm}
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

    ], undefined, () => {
        app.confirmationBox()
    })
}

function deleteVendor(id) {
    let data = new FormData();
    data.set("vendorId", id);
    app.request("deleteVendor", data, 'delete').then(response => {
        loadCategoryTable();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}


function getVendorDetails(vendor) {


    let form = new FormData();
    form.set("vendorId", vendor);
    app.request("vendor/getVendorDetails", form).then(response => {
        if (parseInt(response.adminConfirmOn) === 0) {
            if (response.updateOnColumn !== null && response.updateOnColumn !== "") {
                let object = JSON.parse(response.updateOnColumn);
                let template = object.columns.map((item, index) => {
                    switch (item) {
                        case "mobileNumber":
                            return getApprovalTemplate(object.values[index], response.mobileNumber, 'mobileNumber', index, response.id);
                        case "shopName":
                            return getApprovalTemplate(object.values[index], response.shopName, 'shopName', index, response.id);
                        case "gstNumber":
                            return getApprovalTemplate(object.values[index], response.gstNumber, 'gstNumber', index, response.id);
                        case "foodLicense":
                            return getApprovalTemplate(object.values[index], response.foodLicense, 'foodLicense', index, response.id);
                        case "area":
                            return app.request("getAllLocationOptions", null)
                                .then(options => {
                                    let newValue = [];
                                    let oldValue = [];
                                    let oldIdValues = response.area.split(",");
                                    for (let area of options.results) {
                                        if (Array.isArray(object.values[index])) {
                                            if (object.values[index].some((areaValue) => parseInt(areaValue) === parseInt(area.id))) {
                                                newValue.push(area.text);
                                            }
                                        } else {
                                            if (parseInt(object.values[index]) === parseInt(area.id)) {
                                                newValue.push(area.text);
                                            }
                                        }
                                        // old values
                                        if (oldIdValues.some((areaValue) => parseInt(areaValue) === parseInt(area.id))) {
                                            oldValue.push(area.text);
                                        }
                                    }
                                    return getApprovalTemplate(newValue.join(" "), oldValue.join(" "), 'area', index, response.id);
                                }).catch(error => {
                                    console.log(error);
                                    return ``;
                                })
                        default:
                            return ``;

                    }
                })
                Promise.all(template).then(result => {
                    $("#approvalPendingList").empty();
                    $("#approvalPendingList").append(result.join(" "));
                    app.confirmationBox();
                }).catch(error => {
                    console.log(error);
                    $("#approvalPendingList").empty();

                })

            } else {
                $("#approvalPendingList").empty();
            }
        } else {
            $("#approvalPendingList").empty();
            loadVendorTable();
        }

    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}
function confirmOperation(column, id) {

    let form = new FormData();
    form.set("column", column);
    form.set("vendorId", id);

    app.request("vendor/vendorApprovalConfirmation", form).then(response => {
        app.successToast(response.message);
        getVendorDetails(id);
    }).catch(error => {
        console.log(error);
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}
