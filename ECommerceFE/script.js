document.addEventListener('DOMContentLoaded', function() {
    let navbar = document.querySelector(".navbar");
    if(navbar){
      if (document.querySelector("#bars-btn")) {
        document.querySelector("#bars-btn").onclick = () => {
            navbar.classList.toggle("active");
            searchFrom.classList.remove("active");
            cartItem.classList.remove("active");
        };
    }
    }
  
    let searchFrom = document.querySelector(".search-form");
    if(searchFrom){
      document.querySelector("#search-btn").onclick = () => {
        searchFrom.classList.toggle("active");
        navbar.classList.remove("active");
        cartItem.classList.remove("active");
      };
    }

    let cartItem = document.querySelector(".cart-item-container");
    if(cartItem){
      document.querySelector("#cart-btn").onclick = () => {
        cartItem.classList.toggle("active");
        navbar.classList.remove("active");
        searchFrom.classList.remove("active");
      };
    }

    window.onscroll = () => {
        if(navbar){
          navbar.classList.remove("active");
        }
        if(searchFrom){
          searchFrom.classList.remove("active");
        }
        if(cartItem){
          cartItem.classList.remove("active");
        }
    };
});
