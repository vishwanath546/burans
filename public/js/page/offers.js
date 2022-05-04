$(document).ready(function () {
    loadOfferTable();
});


function loadOfferTable() {

    app.dataTable("offersTable", {
        url: "getAllCouponTables"
    }, [
        {data: "code"},
        {data: "description"},
        {data: "couponStart", render: (d, t, r, m) => {
                return new Date(d).toLocaleString('en-US');
            }},

        {data: "couponEnd", render: (d, t, r, m) => {
            return new Date(d).toLocaleString('en-US');
        }},
        {
            data: "applyTo",
            render: (d, t, r, m) => {
                let applyTo='-';
               switch (parseInt(d)) {
                   case 1:
                       applyTo="All Product";
                       break;
                   case 2:
                       applyTo="Specific Product";
                       break;
                   case 3:
                       applyTo="Minimum order subtotal";
                       break;
                   case 4:
                       applyTo="Specific User";
                       break;
                   case 5:
                       applyTo="All Order";
                       break;
               }
                return `<span class="badge badge-dark">${applyTo}</span>`;
            }
        },
        {
            data: "usageCount",
            render: (d, t, r, m) => {
                let limitUser = r["limitUsers"];
                return `<div class="badges">
                        ${d}/${limitUser}</div>`;

            }
        },
        {
            data: "status",
            render: (d, t, r, m) => {
                if(parseInt(d)===1){
                    return `<span class="badge badge-success">Active</span>`;
                }else if(parseInt(d)===0){
                    return `<span class="badge badge-danger">Inactive</span>`;
                }else{
                    return `<span class="badge badge-danger">Expiry</span>`;
                }

            }
        },
        {
            data: "id",
            render: (d, t, r, m) => {
                return `
                    <div class="btn btn-action">
                       <a href="/update-offers/${d}" class="btn btn-primary">
                            <i class="fa fa-pen-alt"></i>    
                        </a>       
                        <button class="btn btn-danger"
                            data-toggle="tooltip" title
                            data-confirm="Are You Sure?|This action can not be undone. Do you want to continue?"
                            data-confirm-yes="deleteOffers(${d})"
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

function deleteOffers(id) {

    let data = new FormData();
    data.set("offerId",id);
    app.request("deleteOffer",data,'delete').then(response=>{
        loadOfferTable();
    }).catch(error=>{
        if (error.status === 500) {
            app.errorToast("something went wrong");
        } else {
            app.errorToast(error.message);
        }
    });
}
