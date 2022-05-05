$(document).ready(function () {

    $('#category_list').slick({
        centerMode: true,
        centerPadding: '30px',
        slidesToShow: 4,
        arrows: false,
        dots: false,
        autoplay: true,
        autoplaySpeed: 2500,
        responsive: [{
            breakpoint: 768,
            settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '40px',
                slidesToShow: 4
            }
        },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 4
                }
            }
        ]
    });

   [1, 2, 3, 4,5,6,7,8,9,10].map((i) => {
        let template =`<div class="cat-item px-1 py-3">
                <a class="bg-white rounded d-block p-2 text-center shadow" href="trending.html">
                    <img src="img/icons/Fries.png" class="img-fluid mb-2">
                    <p class="m-0 small">${i}</p>
                </a>
            </div>`;
        $("#category_list").slick('slickAdd', template);
    })
    trendingList();
})

function trendingList() {
    $('#trending-list').slick({
        centerMode: true,
        centerPadding: '30px',
        slidesToShow: 2,
        arrows: false,
        autoplay: true,
        responsive: [{
            breakpoint: 768,
            settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '40px',
                slidesToShow: 2
            }
        },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 2
                }
            }
        ]
    });

    [1, 2, 3, 4,].map((i) => {
        let template =` <div class="osahan-slider-item py-3 px-1">
                <div class="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm">
                    <div class="list-card-image">
                        <div class="star position-absolute"><span class="badge badge-success"><i class="feather-star"></i> 3.1 (300+)</span></div>
                        <div class="favourite-heart text-danger position-absolute"><a href="#"><i class="feather-heart"></i></a></div>
                        <div class="member-plan position-absolute"><span class="badge badge-dark">Promoted</span></div>
                        <a href="restaurant.html">
                            <img src="img/trending1.png" class="img-fluid item-img w-100">
                        </a>
                    </div>
                    <div class="p-3 position-relative">
                        <div class="list-card-body">
                            <h6 class="mb-1"><a href="restaurant.html" class="text-black">Famous Dave's Bar-B-Que
                                </a>
                            </h6>
                            <p class="text-gray mb-3">Vegetarian • Indian • Pure veg</p>
                            <p class="text-gray mb-3 time"><span class="bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2"><i class="feather-clock"></i> 15–30 min</span> <span class="float-right text-black-50"> $350 FOR TWO</span></p>
                        </div>
                        <div class="list-card-badge">
                            <span class="badge badge-danger">OFFER</span> <small> Use Coupon OSAHAN50</small>
                        </div>
                    </div>
                </div>
            </div>`;
        $("#trending-list").slick('slickAdd', template);
    })
}
