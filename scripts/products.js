// === PRODUCT DATA WITH REAL IMAGES ===
const products = {
    tshirts: [
        {
            name: "Infinite",
            price: 250,
            img: "acidic 3.jpg",
        },
        {
            name: "Infinite II",
            price: 350,
            img: "acidic 33.jpg",
        },
        {
            name: "Acidic Effect",
            price: 350,
            img: "acidic 4.jpg",
        },
        {
            name: "Lightning",
            price: 300,
            img: "acidic 19.jpg",
        },
        {
            name: "Naruto",
            price: 400,
            img: "acidic 14.jpg",
        },
        {
            name: "Hand Signature",
            price: 300,
            img: "acidic 16.jpg",
        },
        {
            name: "Hand Signature II",
            price: 300,
            img: "acidic 15.jpg",
        },
        {
            name: "Feather rainbow",
            price: 300,
            img: "acidic 26.jpg",
        },
        {
            name: "Angelic",
            price: 300,
            img: "acidic 1.jpg",
        },
        {
            name: "Rainbow",
            price: 350,
            img: "acidic 6.jpg",
        },
        {
            name: "Butterfly effect",
            price: 300,
            img: "acidic 9.jpg",
        },
    ],
    sweaters: [
        {
            name: "Infinite",
            price: 350,
            img: "acidic 2.jpg",
        },
        {
            name: "Infinite II",
            price: 400,
            img: "acidic 7.jpg",
        },
        {
            name: "Acidic Effect",
            price: 450,
            img: "acidic m.jpg",
        },
        {
            name: "Angelic",
            price: 400,
            img: "acidic 1.jpg",
        },
        {
            name: "Rainbow",
            price: 400,
            img: "acidic 34.jpg",
        },
        {
            name: "Butterfly effect",
            price: 400,
            img: "acidic.jpg",
        },
    ],
    hoodies: [
        {
            name: "Infinite II",
            price: 500,
            img: "acidic 8.jpg",
        },
        {
            name: "Feather rainbow",
            price: 450,
            img: "acidic 5.jpg",
        },
        {
            name: "Hand Signature",
            price: 450,
            img: "acidic 24.jpg",
        },
        {
            name: "Hand Signature II",
            price: 450,
            img: "acidic 23.jpg",
        },
        {
            name: "Naruto",
            price: 550,
            img: "acidic 22.jpg",
        },
        {
            name: "Angelic",
            price: 450,
            img: "acidic 25.jpg",
        },
        {
            name: "Rainbow",
            price: 450,
            img: "acidic 27.jpg",
        },
        {
            name: "Lightning",
            price: 450,
            img: "acidic 21.jpg",
        },
        {
            name: "Infinite",
            price: 400,
            img: "acidic 32.jpg",
        },
    ],
    pants: [
        {
            name: "Slim Fit Cargo",
            price: 499,
            img: "acidic 12.jpg",
        },
        {
            name: "Street Joggers",
            price: 459,
            img: "acidic 13.jpg",
        },
    ],
    twopieces: [
        {
            name: "Ladies Set",
            price: 500,
            img: "acidic 28.jpg",
        },
        {
            name: "Infinite Set",
            price: 500,
            img: "acidic 29.jpg",
        },
    ],
    accessories: [
        {
            name: "Infinite Cap",
            price: 300,
            img: "acidic 31.jpg",
        },
        {
            name: "Rainbow Cap",
            price: 250,
            img: "acidic 30.jpg",
        },
    ],
};

// === IMAGE ERROR HANDLING ===
function handleImageError(img) {
    console.log("Image failed to load:", img.src);
    img.src = "acidic 1.jpg";
    img.alt = "ACIDIC Clothing";
}

// Enhanced product display with error handling
function showCategory(category) {
    hideAllSections();
    const section = document.getElementById("product-section");
    const mainContent = document.getElementById("main-content");
    section.style.display = "grid";
    mainContent.style.display = "block";
    section.classList.remove("active");
    section.innerHTML = "";

    if (products[category]) {
        setTimeout(() => {
            products[category].forEach((item) => {
                const div = document.createElement("div");
                div.classList.add("product");
                div.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" onerror="handleImageError(this)">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p>R${item.price}</p>
                    </div>`;
                div.onclick = () => openModal(item);
                section.appendChild(div);
            });
            requestAnimationFrame(() => section.classList.add("active"));
        }, 150);
    }
}

// Product modal functions
let currentItem = null;

function openModal(item) {
    currentItem = item;
    document.getElementById("modal-img").src = item.img;
    document.getElementById("modal-name").textContent = item.name;
    document.getElementById("modal-price").textContent = "R" + item.price;
    document.getElementById("product-modal").classList.add("active");
}

function closeModal() {
    document.getElementById("product-modal").classList.remove("active");
}

// Customization functions
let selectedColor = "#000";

function showCustomizeModal() {
    closeModal();
    document.getElementById("customize-modal").classList.add("active");
}

function closeCustomize() {
    document.getElementById("customize-modal").classList.remove("active");
}

function selectColor(element, color) {
    selectedColor = color;
    document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("active");
    });
    element.classList.add("active");
}

// Size recommender
function showSizeRecommender() {
    const modal = document.getElementById("size-recommender-modal");
    modal.classList.add("active");
}

function closeSizeRecommender() {
    document.getElementById("size-recommender-modal").classList.remove("active");
}

function calculateSize() {
    const height = parseInt(document.getElementById("user-height").value);
    const weight = parseInt(document.getElementById("user-weight").value);
    const fit = document.getElementById("preferred-fit").value;

    if (!height || !weight) {
        alert("Please enter your height and weight.");
        return;
    }

    let size = "Medium"; // Default

    // Simple size calculation logic
    if (height < 165) {
        size = fit === "oversized" ? "Medium" : "Small";
    } else if (height >= 165 && height < 180) {
        if (weight < 70) {
            size = fit === "slim" ? "Small" : fit === "oversized" ? "Large" : "Medium";
        } else {
            size = fit === "slim" ? "Medium" : fit === "oversized" ? "Extra Large" : "Large";
        }
    } else {
        size = fit === "slim" ? "Large" : "Extra Large";
    }

    document.getElementById("size-result").textContent = `Recommended Size: ${size}`;
}