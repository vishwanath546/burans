$(document).ready(function () {

    $("#categoryRanking").sortable({
        containment:'#categoryRanking',
        cursor: "move",
        update: function( event, ui ) {
            let dataArray = $('#categoryRanking').sortable("toArray");
            sequenceUpdate(dataArray);
        }
    })


    app.request("getAllCategories",null,'get').then(response=>{
        $("#countOfItem").html(`(${response.length} Items)`)
        let template=response.map(loadCategoryItem).join("");
        $("#categoryRanking").empty();
        $("#categoryRanking").append(template);
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })


});

function sequenceUpdate(data) {
    let form=new FormData();
    form.set("categories",JSON.stringify(data))
    app.request("updateCategoryRanking",form).then(response=>{
       app.successToast(response.message);
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    })
}


function loadCategoryItem(item) {

    return `<li class="media" id="${item.id}" data-id="${item.id}" >
                <a href="#">
                    <img class="mr-3 rounded" width="50" src="${baseURL + item.photo.replace("public", "")}" alt="product">
                </a>
                <div class="media-body">
                    <div class="media-title"><a href="#">${item.name}</a></div>
                    <div class="text-muted text-small">${item.description}
                    </div>
                </div>
            </li>`
}
