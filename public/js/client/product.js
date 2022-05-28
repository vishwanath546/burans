$(document).ready(function () {
  getSubCategory();
  getSubCategoryProduct();
});

function getSubCategory() {
  const params = new URLSearchParams(window.location.search);
  const cat_id = params.get("cat_id");
  let data = new FormData();
  data.set("cat_id", cat_id);
  app
    .request("client/getSubCategory", data, "POST")
    .then((response) => {
      $("#Subcategory_list").empty();
      var Subcategory_list = "";
      if (response.status) {
        $("#Subcategory_list").slick({

          centerPadding: "30px",
          variableWidth: true,
          slidesToShow: 4,
          arrows: false,
          dots: false,
          autoplay: true,
          autoplaySpeed: 2500,
          responsive: [
            {
              breakpoint: 768,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: "40px",
                slidesToShow: 4,
              },
            },
            {
              breakpoint: 480,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: "40px",
                slidesToShow: 4,
              },
            },
          ],
        });

        response.body.forEach((item, value) => {
          Subcategory_list = `<div class="cat-item px-1 py-3">
                <a class="bg-white rounded d-block p-2 text-center shadow" onclick="getSubCategoryProduct(${item.id})" >
                   <img src="${baseURL + item.photo.replace("public", "")}" class="img-fluid mb-2">
                   <p class="m-0 small">${item.name}</p>
                </a>
             </div>`;
          $("#Subcategory_list").slick("slickAdd", Subcategory_list);
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function getSubCategoryProduct(Subcat_id = "", page = "1") {
  const params = new URLSearchParams(window.location.search);
  const cat_id = params.get("cat_id");
  let data = new FormData();
  data.set("cat_id", cat_id);
  data.set("Subcat_id", Subcat_id);
  data.set("page", page);
  app
    .request("client/getSubCategoryProduct", data, "POST")
    .then((response) => {
      $("#product_list").empty();
      $("#pagination").empty();

      var paginationlist = "";
      console.log(response.body);
      if (response.status) {
        var paginate = response.pagination;
        response.body.forEach((item, value) => {
          var product_list = "";
          product_list += `<div class="col-6 pr-2" style="margin-bottom: 20px;">
          <div class="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm grid-card">
             <div class="list-card-image">
                <div class="star position-absolute"><span class="badge badge-success"><i class="feather-star"></i> 3.1 (300+)</span></div>`;
          if (item.wishlisid != null) {
            product_list += `<div class="favourite-heart text-danger position-absolute"><a href="#" onclick="addtowishlist(${item.id},${item.subcategoryId})"><i class="feather-heart text-danger" ></i></a></div>`;
          } else {
            product_list += `<div class="favourite-heart text-danger position-absolute"><a href="#" onclick="addtowishlist(${item.id},${item.subcategoryId})"><i class="feather-heart text-muted"></i></a></div>`;
          }

          product_list += `<div class="member-plan position-absolute"><span class="badge badge-dark">Promoted</span></div>
                <a href="restaurant.html">
                <img src="${item.image ? baseURL + item.image.replace("public", ""):'img/trending1.png'}" class="img-fluid item-img w-100">
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

          paginationlist += `
          <nav aria-label="Page navigation example">
              <ul class="pagination">`;
          if (paginate.previous != null) {
            paginationlist += `
                <li class="page-item">
                  <a class="page-link" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                    <span class="sr-only">Previous</span>
                  </a>
                </li>`;
          }

          paginate.range.forEach((itemval) => {
            paginationlist += `<li class="page-item"><a class="page-link" onclick="getSubCategoryProduct(${item.subcategoryId},${itemval})">${itemval}</a></li>`;
          });
          if (paginate.next != null) {
            paginationlist += `  <li class="page-item">
                  <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                    <span class="sr-only">Next</span>
                  </a>
                </li>
              </ul>
            </nav>`;
          }
          $("#pagination").append(paginationlist);
          $("#product_list").append(product_list);
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
          window.location.href = "client/checkout";
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
const addtowishlist = (product_id, subcategoryId = "") => {
  let data = new FormData();
  data.set("ProductId", product_id);
  app
    .request("client/addtowishlist", data, "POST")
    .then((response) => {
      var product_list = "";
      if (response.status) {
        app.successToast(response.body);
        getSubCategoryProduct(subcategoryId);
        return;
      }
      app.errorToast(response.message);
    })
    .catch((error) => {
      app.errorToast("something went wrong");
    });
};
