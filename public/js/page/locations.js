$(document).ready(() => {
    $("#fire-modal-location").on("shown.bs.modal", (e) => {
        app.formValidation();
        let id = parseInt($(e.relatedTarget).data('id'));
        $("#location_form").trigger("reset");
        $("#updateLocationId").val('');

        if (id !== 0) {
                getLocation(id);
        }
        $("#name").trigger('focus');
    });
    loadLocation();
});

function saveLocationDetails(form) {

    app.request("saveLocation", new FormData(form)).then(response => {
        app.successToast(response.body)
        $("#location_form").trigger('reset');
        loadLocation();
    }).catch(error => {
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }

    })
}

function getLocation(id) {
    let data = new FormData();
    data.set("locationId",id);
    app.request("getLocation",data).then(response=>{
        $("#").val(response.name)
        if(response.status === 1){
            $("input[type='radio'][value='1']").attr("checked",true);
        }else{
            $("input[type='radio'][value='0']").attr("checked",true);
        }
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });

}

function deleteLocation(id) {

    let data = new FormData();
    data.set("categoryId",id);
    app.request("deleteLocation",data,'delete').then(response=>{
        loadCategoryTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}

function loadLocation() {
    app.dataTable("locationTables", {
        url: "getAllLocationTables"
    }, [
        {data: "name"},
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
                        <button data-toggle="modal"
                                data-target="#fire-modal-location"
                                data-id="${d}"
                                class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </button>    
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteLocation(${d})"
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
