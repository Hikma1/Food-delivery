
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function showCart() {
        let cartContainer = document.getElementById("cart-items");
        let total = 0;
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty</p>";
        } else {
            cart.forEach((item) => {
                cartContainer.innerHTML += `
                    <p><img src="${item.img}" width="40"> ${item.name} - $${item.price}</p>
                `;
                total += Number(item.price);
            });
        }

        document.getElementById("cart-total").textContent = "Total: $" + total.toFixed(2);
    }

    // clear cart after checkout
    document.querySelector("form").onsubmit = function(e) {
        e.preventDefault(); // prevent real submit for now
        alert("✅ Your order has been placed!");
        localStorage.removeItem("cart"); // empty cart
        window.location.href = "index.html"; // redirect back to home
    }

    document.addEventListener("DOMContentLoaded", showCart);

