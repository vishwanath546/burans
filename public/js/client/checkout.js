$(document).ready(function () {
  getCartList();
});

function applycoupon() {
  var couponCode = $("#couponCode").val();
  var Note = $("#Note").val();
  getCartList(couponCode, Note);
}
function redirectpayment() {
  var couponCode = $("#couponCode").val();
  var Note = $("#Note").val();
  let data = new FormData();
  data.set("couponCode", couponCode);
  data.set("Note", Note);
  app
    .request("client/redirectpayment", data, "POST")
    .then((response) => {
      window.location.href = baseURL + "client/payment";
    })
    .catch((error) => {
      console.log(error);
    });
}
function getCartList(couponCode = "", Note = "") {
  let data = new FormData();
  data.set("couponCode", couponCode);
  data.set("Note", Note);
  app
    .request("client/getCartList", data, "POST")
    .then((response) => {
      $("#cart_list").empty();
      $("#total_pay").empty();
      $("#final_pay").empty();
      $("#restaurant_charges").empty();
      $("#delivery_charge").empty();
      $("#item_total").empty();
      $("#discount_value").empty();

      var cart_list = "";
      var suggested_list = "";
      $("#payment_view").addClass("d-none");
      if (response.status) {
        $("#payment_view").removeClass("d-none");
        response.body.forEach((item, value) => {
          cart_list = `  <div class="gold-members d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div class="media align-items-center">
             <div class="mr-2 text-danger">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
                           <circle cx="8" cy="8" r="8"/>
                        </svg>
                     </div>
             <div class="media-body">
                <p class="m-0">${item.name}</p>
             </div>
          </div>
          <div class="d-flex align-items-center">
             <div class="osahan-quantity">
                <input type="button" value="-" class="minus"  onclick="addtocart(${item.id},'sub')">
                <input type="text" name="quantity" value="${item.qty}" title="Qty" class="qty" size="4">
                <input type="button" value="+" class="plus" onclick="addtocart(${item.id})">
             </div>
             <p class="text-gray mb-0 float-right ml-2 text-muted small">Rs.${item.price}</p>
             <button type="button" class="btn btn-danger ml-2" onclick="delete_product_from_cart(${item.id})">
                <i class='feather-trash-2'></i>
             </button>
          </div>
       </div>`;
          cart_list += `<div class="bg-light">
       <div class="cat-slider border-bottom" id="suggested_list_${value}">`;
          item.addonlist.forEach((item2, value2) => {
            cart_list += `<div class="cat-item px-1 py-3">
        <a class="bg-white rounded d-block p-2 text-center shadow" >
           <img src="${
             baseURL + item2.photo.replace("public", "").split("\\").join("/")
           }" class="img-fluid mb-2">
           <p class="m-0 small">${item2.name}</p>
           <button class="btn btn-danger" onclick="addtocart(${
             item2.id
           })">Add to cart</button>
        </a>
    
     </div>`;
          });
          cart_list += `</div>
       </div>`;
          $("#cart_list").append(cart_list);
        });
        $("#restaurant_charges").append(`Rs.${response.restaurant_charges}`);
        $("#delivery_charge").append(`Rs.${response.delivery_charge}`);
        $("#item_total").append(`Rs.${response.totalPrice}`);
        $("#discount_value").append(`Rs.${response.discount_value}`);
        $("#total_pay").append(`Rs.${response.finalPrice}`);
        $("#final_pay").append(`Pay Rs.${response.finalPrice}`);
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
