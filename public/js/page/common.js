function getLocationOptions(element) {

    return app.request("getAllLocationOptions",null).then(response=>{
        app.selectOption(element, 'Select Category', null, response.results);
        return Promise.resolve();
    })

}

function getVendorsOptions(element) {

    return app.request("vendor/getAllVendorOptions",null).then(response=>{
        app.selectOption(element, 'Select Vendors', null, response.results);
        return Promise.resolve();
    })

}
