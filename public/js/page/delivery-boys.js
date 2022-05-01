$(document).ready(function () {
    loadDeliveryTable()
    $("#fire-modal-approval").on("shown.bs.modal", (e) => {

        let id = parseInt($(e.relatedTarget).data('id'));
        getDeliveryBoy(id);
    });
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
                }else{
                    return ``;
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
                let confirm = ``;
                if (r["adminConfirmOn"] === 0) {
                    confirm = `<button class="btn btn-primary" data-toggle="modal" data-id="${d}" data-target="#fire-modal-approval">
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

function getDeliveryBoy(deliveryBoyId) {
    let formData = new FormData();
    formData.set("deliveryBoyId", deliveryBoyId)
    app.request("getDeliveryBoy", formData).then(response => {
        if (parseInt(response.adminConfirmOn) === 0) {
            if (response.updateOnColumn !== null && response.updateOnColumn !== "") {
                let object = JSON.parse(response.updateOnColumn);
                let template = object.columns.map((item, index) => {
                    switch (item) {
                        case "mobileNumber":
                            return getApprovalTemplate(object.values[index], response.mobileNumber, 'mobileNumber', index, response.id);
                        case "license":
                            return getApprovalTemplate(object.values[index], response.license, 'license', index, response.id);
                        case "licensePhoto":
                            return getApprovalTemplate(object.values[index], response.licensePhoto, 'licensePhoto', index, response.id,1);
                        case "bikeRc":
                            return getApprovalTemplate(object.values[index], response.bikeRc, 'bikeRc', index, response.id);
                        case "bikeRcPhoto":
                            return getApprovalTemplate(object.values[index], response.bikeRcPhoto, 'bikeRcPhoto', index, response.id,1);
                        case "area":
                            return app.request("getAllLocationOptions", null)
                                .then(options => {
                                    let newValue = [];
                                    let oldValue = [];
                                    let oldIdValues = response.areas ?response.areas.split(","):[];
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
                        case "vendors":
                            return app.request("vendor/getAllVendorOptions", null)
                                .then(options => {
                                    let newValue = [];
                                    let oldValue = [];
                                    let oldIdValues = response.vendors ? response.vendors.split(","):[];
                                    for (let vendor of options.results) {
                                        if (Array.isArray(object.values[index])) {
                                            if (object.values[index].some((vendorValue) => parseInt(vendorValue) === parseInt(vendor.id))) {
                                                newValue.push(vendor.text);
                                            }
                                        } else {
                                            if (parseInt(object.values[index]) === parseInt(vendor.id)) {
                                                newValue.push(vendor.text);
                                            }
                                        }
                                        // old values
                                        if (oldIdValues.some((vendorValue) => parseInt(vendorValue) === parseInt(vendor.id))) {
                                            oldValue.push(vendor.text);
                                        }
                                    }
                                    if (newValue.length !== 0) {
                                        return getApprovalTemplate(newValue.join(" "), oldValue.join(" "), 'vendors', index, response.id);
                                    } else {
                                        return ``;

                                    }
                                }).catch(error => {
                                    console.log(error);
                                    return ``;
                                });
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

            }else{
                $("#approvalPendingList").empty();
            }
        } else {
            $("#approvalPendingList").empty();
            loadDeliveryTable();
        }
    })
}

function confirmOperation(column, deliveryBoyId) {

    let form = new FormData();
    form.set("column", column);
    form.set("deliveryBoyId", deliveryBoyId);

    app.request("deliveryBoyApprovalConfirmation", form).then(response => {
        app.successToast(response.message);
        getDeliveryBoy(deliveryBoyId);
    }).catch(error => {
        console.log(error);
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}

