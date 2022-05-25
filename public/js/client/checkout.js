$(document).ready(function () {
  getCartList();
});

function getCartList() {
  app
    .request("client/getCartList", "", "POST")
    .then((response) => {
      $("#cart_list").empty();
      $("#total_pay").empty();
      $("#final_pay").empty();

      var cart_list = "";
      var suggested_list = "";
      if (response.status) {
        response.body.forEach((item, value) => {
          cart_list += `  <div class="gold-members d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div class="media align-items-center">
             <div class="mr-2 text-danger">&middot;</div>
             <div class="media-body">
                <p class="m-0">${item.name}</p>
             </div>
          </div>
          <div class="d-flex align-items-center">
          <span class="count-number float-right">
          <button type="button" class="btn-sm left dec btn btn-outline-secondary" onclick="addtocart(${item.id},'sub')"> <i class="feather-minus"></i> </button>
          <input class="count-number-input" type="text" readonly="" value="${item.qty}">
          <button type="button" class="btn-sm right inc btn btn-outline-secondary" onclick="addtocart(${item.id})"> <i class="feather-plus"></i> </button></span>
               <p class="text-gray mb-0 float-right ml-2 text-muted small">Rs.${item.price}</p>
          <button type="button" class="btn btn-danger ml-2" onclick="delete_product_from_cart(${item.id})">
          <i class='fa fa-remove'></i></button>
          </span>
          </div>
       </div>`;
          cart_list += `<div class="bg-light">
       <div class="cat-slider border-bottom" id="suggested_list_${value}">`;
          item.addonlist.forEach((item2, value2) => {
            cart_list += `<div class="cat-item px-1 py-3">
        <a class="bg-white rounded d-block p-2 text-center shadow" >
           <img src="${item2.photo}" class="img-fluid mb-2">
           <p class="m-0 small">${item2.name}</p>
           <button class="btn btn-danger" onclick="addtocart(${item2.id})">Add to cart</button>
        </a>
    
     </div>`;
          });
          cart_list += `</div>
       </div>`;
          console.log(`cart_list_${value}`, cart_list);
          $("#cart_list").append(cart_list);
        });
        $("#total_pay").append(`Rs.${response.totalPrice}`);
        $("#final_pay").append(`Pay Rs.${response.totalPrice}`);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

const delete_product_from_cart = (product_id) => {
  let data = new FormData();
  data.set("ProductId", product_id);
  app
    .request("client/delete_product_from_cart", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        getCartList();
        app.successToast(response.body);
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};

const addtocart = (product_id, type = "add", qty = 1) => {
  let data = new FormData();
  data.set("ProductId", product_id);
  data.set("qty", qty);
  data.set("type", type);
  app
    .request("client/add_to_cart", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        getCartList();
        app.successToast(response.body);
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};

const inserOrder = () => {
  app
    .request("client/insertOrder", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        getCartList();
        app.successToast(response.body);
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};
