function getLocationOptions(element) {

    return app.request("getAllLocationOptions",null).then(response=>{
        app.selectOption(element, 'Select Location', null, response.results);
        return Promise.resolve();
    })

}

function getVendorsOptions(element) {

    return app.request("vendor/getAllVendorOptions",null).then(response=>{
        app.selectOption(element, 'Select Vendors', null, response.results);
        return Promise.resolve();
    })

}

function getCategoryOption(element) {
    return app.request("getAllCategoriesOptions", null).then(response => {
        app.selectOption(element, 'Select Category', null, response.results);
        return Promise.resolve();
    })

}


function getProductOption(element) {
    return app.request("getAllProductsOptions", null).then(response => {
        app.selectOption(element, 'Select Product', null, response.results);
        return Promise.resolve();
    })
}


function getApprovalTemplate(newValue, oldValue, column, index, id,type=0) {

    if(type!==0){
        newValue = `<a href="${baseURL + newValue.replace("public", "")}" download> New File Click Download</a>`;
        oldValue = `<a href="${baseURL + oldValue.replace("public", "")}" download> Old File Click Download</a>`;
    }
    return `<li class="media">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input"
                     value="column" id="cbx-${index}"
                      data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="confirmOperation('${column}',${id})"
                            data-original-title="confirm"
                     >
                    <label class="custom-control-label" for="cbx-${index}"></label>
                </div>
                <div class="media-body">
                    <div class="badge badge-pill badge-primary mb-1 float-right">${column}</div>    
                    <h6 class="media-title">${newValue}</h6>
                    <div class="text-small text-muted">${oldValue}</div>
                </div>
            </li>`
}
