$(document).ready(function () {
  getwishList();
});

function getwishList() {
  app
    .request("client/getwishList", "", "POST")
    .then((response) => {
      $("#wish_list").empty();
      var wish_list = "";
      console.log(response.body);
      if (response.status) {
        response.body.forEach((item, value) => {
          wish_list = `<div class="col-6 pr-2" style="margin-bottom: 20px;">
          <div class="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm grid-card">
             <div class="list-card-image">
                <div class="star position-absolute"><span class="badge badge-success"><i class="feather-star"></i> 3.1 (300+)</span></div>
                <div class="favourite-heart text-danger position-absolute"><a href="#" onclick="addtowishlist(${item.id})"><i class="feather-heart text-danger""></i></a></div>
                <div class="member-plan position-absolute"><span class="badge badge-dark">Promoted</span></div>
                <a href="restaurant.html">
                <img src="${item.path}" class="img-fluid item-img w-100">
                </a>
             </div>
             <div class="p-3 position-relative">
                <div class="list-card-body">
                   <h6 class="mb-1"><a href="restaurant.html" class="text-black">${item.name}
                      </a>
                   </h6>
                   <p class="text-gray mb-3">${item.description}</p>
                   <p class="text-gray mb-3 time"><span class="bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"><i class="feather-clock"></i> ${item.duration} min</span> 
                   <span bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"> Rs.${item.price} </span> <strike>${item.salePrice} </strike></p>
                </div>
               <div class="list-card-badge">
               <button class="btn btn-danger" onclick="addtocart(${item.id})">Add to cart</button>
               <button class="btn btn-success" onclick="addtocart(${item.id},1,'buy_now')">Buy Now</button>
                   <span class="badge badge-danger">OFFER</span> <small>65% OSAHAN50</small>
                </div>
             </div>
          </div>
       </div>`;
          $("#wish_list").append(wish_list);
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
const addtocart = (product_id, qty = 1, type = "addtocart") => {
  let data = new FormData();
  data.set("ProductId", product_id);
  data.set("qty", qty);
  app
    .request("client/add_to_cart", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        if (type == "buy_now") {
          window.location.href = "/checkout";
        } else {
          app.successToast("Successfully Product added in Cart");
        }
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};
const addtowishlist = (product_id) => {
  let data = new FormData();
  data.set("ProductId", product_id);
  app
    .request("client/addtowishlist", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        app.successToast(response.body);
        getwishList();
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};
