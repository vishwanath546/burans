$(document).ready(function () {
  getCategory();
  getSubCategoryProduct();
});

function getCategory() {
  app
    .request("client/getCategory", "", "GET")
    .then((response) => {
      $("#category_list").empty();
      var category_list = "";
      if (response.status) {
        $("#category_list").slick({
          centerMode: true,
          variableWidth: true,
          centerPadding: "30px",
          slidesToShow: 4,
          arrows: false,
          autoplay: true,
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
          category_list = `
            <div class="cat-item px-1 py-3" style="width: 84px;">
                  <a class="d-block text-center" href="product?cat_id=${item.id}">
                     <div class="img-fluid mb-2 shadow" style="background-image: url('${baseURL + item.photo.replace("public", "").split("\\").join("/")}');
                      background-position: center; background-size: cover;
                      width: 60px;height: 60px;" ></div>
                     <p class="m-0 small">${item.name}</p>
                  </a>
               </div>
`;
          $("#category_list").slick("slickAdd", category_list);
        });
        // trendingList();
        offerList();
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function trendingList() {
  $("#trending-list").slick({
    centerMode: true,
    centerPadding: "30px",
    slidesToShow: 1,
    arrows: false,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 1,
        },
      },
    ],
  });

  [1, 2, 3, 4].map((i,index) => {
    let img= index % 2===0?'/images/products/trending6.png':'/images/products/trending5.png'
    let template = ` 
                <div class="osahan-slider-item py-3 px-1">
                  <div class="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm">
                     <div class="list-card-image">
                        <div class="star position-absolute"><span class="badge badge-success"><i class="feather-star"></i> 3.4</span></div>
                        <div class="favourite-heart position-absolute"><a href="#"><i class="feather-bookmark"></i></a></div>
                        <div class="member-plan position-absolute"><span class="badge badge-danger">HOT</span></div>
                        <a href="restaurant.html">
                        <img src="${img}" class="img-fluid item-img w-100">
                        </a>
                     </div>
                     <div class="p-3 position-relative">
                        <div class="list-card-body">
                           <h6 class="mb-1"><a href="restaurant.html" class="text-black">Famous Dave's Bar-B-Que
                              </a>
                           </h6>
                           <p class="text-gray mb-3">Vegetarian, Indian, Pure veg</p>
                           <p class="text-gray mb-3 time"><span class="bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"><i class="feather-clock"></i> 15–30 min</span> <span class="float-right text-black-50"> $350 FOR TWO</span></p>
                        </div>
                        <div class="list-card-badge d-flex align-items-center">
                           <span class="badge badge-danger mr-2">OFFER</span> <small> Use Coupon NEW50</small>
                        </div>
                     </div>
                  </div>
               </div>
 
 
 `;
    $("#trending-list").slick("slickAdd", template);
  });
}

function offerList() {
  app
      .request("client/getCategory", "", "GET")
      .then((response) => {
        $("#offer-list").empty();
        var category_list = "";
        if (response.status) {
          $("#offer-list").slick({
            centerMode: true,
            centerPadding: "30px",
            slidesToShow: 2,
            arrows: false,
            autoplay: true,
            responsive: [
              {
                breakpoint: 768,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: "40px",
                  slidesToShow: 2,
                },
              },
              {
                breakpoint: 480,
                settings: {
                  arrows: false,
                  centerMode: true,
                  centerPadding: "40px",
                  slidesToShow: 2,
                },
              },
            ],
          });

          response.body.forEach((item, index) => {
            let img= index % 2===0?'/images/offers/pro3.jpg':'/images/offers/pro4.jpg'
            category_list = `         
            <div class="cat-item px-1 py-3">
                <a class="d-block text-center" href="trending.html">
                    <img src="${img}" class="img-fluid rounded rounded-lg shadow-sm">
                </a>
            </div>
`;
            $("#offer-list").slick("slickAdd", category_list);
          });

        }
      })
      .catch((error) => {
        console.log(error);
      });
}


function getSubCategoryProduct() {
  let data = new FormData();
  data.set("page", "1");
  app
    .request("client/getSubCategoryProduct", data, "POST")
    .then((response) => {
      $("#product_list").empty();
      var product_list = "";
      if (response.status) {
        $("#trending-list").slick({
          centerMode: true,
          centerPadding: "30px",
          slidesToShow: 1,
          arrows: false,
          autoplay: true,
          responsive: [
            {
              breakpoint: 768,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: "40px",
                slidesToShow: 2,
              },
            },
            {
              breakpoint: 480,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: "40px",
                slidesToShow: 1,
              },
            },
          ],
        });

        response.body.forEach((item, value) => {

          let template = ` <div class="osahan-slider-item py-3 px-1">
       <div class="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm">
           <div class="list-card-image">
               <div class="star position-absolute"><span class="badge badge-success"><i class="feather-star"></i> 3.1 (300+)</span></div>`;

          if (item.wishlisid != null) {
            template += `<div class="favourite-heart text-danger position-absolute"><a href="#" onclick="addtowishlist(${item.id},${item.subcategoryId})"><i class="feather-heart text-danger" ></i></a></div>`;
          } else {
            template += `<div class="favourite-heart text-danger position-absolute"><a href="#" onclick="addtowishlist(${item.id},${item.subcategoryId})"><i class="feather-heart text-muted"></i></a></div>`;
          }
          template += `<div class="member-plan position-absolute"><span class="badge badge-dark">Promoted</span></div>
               <a href="restaurant.html">
                   <img src="${baseURL+item.image.replace("public", "").split("\\").join("/")}" class="img-fluid item-img w-100" style="width: 194px">
               </a>
           </div>
           <div class="p-3 position-relative">
               <div class="list-card-body">
                   <h6 class="mb-1"><a href="restaurant.html" class="text-black">${item.name} </a>
                   </h6>
                   <p class="text-gray mb-3">${item.description}</p>
                   <p class="text-gray mb-3 time"><span class="bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"><i class="feather-clock"></i> ${item.duration} min</span> 
                   <span bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"> Rs.${item.price} </span> <strike>${item.salePrice} </strike>
                   </p>
               </div>
               <div class="list-card-badge">
               <button class="btn btn-danger" onclick="addtocart(${item.id})">Add to cart</button>
               <button class="btn btn-success" onclick="addtocart(${item.id},1,'buy_now')">Buy Now</button>
                   <span class="badge badge-danger">OFFER</span> <small>65% OSAHAN50</small>
                </div>
           </div>
       </div>
   </div>`;

          $("#trending-list").slick("slickAdd", template);
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
          window.location.href = "/client/checkout";
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
