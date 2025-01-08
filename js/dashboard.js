// script.js
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const sliderContainer = document.querySelector(".slider-container");

  // Function to load recipes dynamically
  async function loadRecipes(searchQuery = "") {
    try {
      const response = await fetch(`/recipes?search=${searchQuery}`);
      const data = await response.json();
  
      sliderContainer.innerHTML = ""; // Clear existing recipes
  
      if (data.length > 0) {
        data.forEach((recipe) => {
          const foodItem = document.createElement("div");
        
          // Ensure the correct category class is applied to each food item
          foodItem.className = `food-item ${recipe.category.toLowerCase().replace(/\s+/g, '-')}`;
        
          foodItem.dataset.title = recipe.name;
          foodItem.dataset.description = recipe.description;
          foodItem.dataset.image = recipe.image_url;
          foodItem.dataset.food_recipe = recipe.recipe;
          foodItem.dataset.good_for = recipe.good_for;
          foodItem.dataset.ingredients = recipe.ingredients;
          foodItem.dataset.procedure = recipe.procedure;
          foodItem.dataset.food_id = recipe.id;  // Ensure foodId is set here
        
          foodItem.innerHTML = `
            <img src="${recipe.image_url}" alt="${recipe.name}">
            <div class="dish-name">${recipe.name}</div>
          `;
          sliderContainer.appendChild(foodItem);
        });
        
  
        // Attach autocomplete logic here after food items are rendered
        attachAutocomplete();
      } else {
        sliderContainer.innerHTML = "<p>No recipes found.</p>";
      }
    } catch (error) {
      console.error("Error loading recipes:", error);
    }
  }
  

  // Search functionality
  searchButton.addEventListener("click", () => {
    const searchQuery = searchInput.value.trim();
    loadRecipes(searchQuery);
  });

  // Initial load
  loadRecipes();
});

document.addEventListener("DOMContentLoaded", function () {
  const sliderContainer = document.querySelector(".slider-container");
  const modal = document.getElementById("food-modal");
  const modalContent = document.querySelector(".modal-content");
  const closeButton = document.querySelector(".close-button");
  const saveButton = document.getElementById("save-button");

  // Function to open the modal
  function openModal(foodItem) {
      const title = foodItem.getAttribute("data-title");
      const description = foodItem.getAttribute("data-description");
      const imageSrc = foodItem.getAttribute("data-image");
      const recipe = foodItem.getAttribute("data-food_recipe");
      const goodFor = foodItem.getAttribute("data-good_for");
      const ingredients = foodItem.getAttribute("data-ingredients").split(",");
      const procedure = foodItem.getAttribute("data-procedure").split(/\d+\.\s/).filter(Boolean);
      const foodId = foodItem.getAttribute("data-food_id");

      // Populate modal content
    modal.querySelector("#modal-title").textContent = title;
    modal.querySelector("#modal-image").src = imageSrc;
    modal.querySelector("#modal-image").alt = title;
    modal.querySelector("#modal-description").textContent = description;
    modal.querySelector("#modal-recipe").textContent = recipe;

    const modalIngredients = modal.querySelector("#modal-ingredients");
    modalIngredients.innerHTML = "";
    ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = ingredient.trim();
        modalIngredients.appendChild(li);
    });

    const modalProcedure = modal.querySelector("#modal-procedure-list");
modalProcedure.innerHTML = "";
procedure.forEach((step, index) => {
    const li = document.createElement("li");
    li.textContent = step.trim();
    modalProcedure.appendChild(li);
});


    modal.querySelector("#modal-good-for").textContent = goodFor;

    // Set the data-food-id attribute on the save button
    saveButton.dataset.foodId = foodId;

    // Show the modal
    modal.style.display = "block";
}

  // Event delegation for dynamically loaded food items
  sliderContainer.addEventListener("click", function (event) {
      const foodItem = event.target.closest(".food-item");
      if (foodItem) {
          openModal(foodItem);
      }
  });

  // Function to close the modal
  function closeModal() {
      modal.style.display = "none";
  }

  // Close modal on close button click
  closeButton?.addEventListener("click", closeModal);

  // Close modal when clicking outside modal content
  window.addEventListener("click", function (event) {
      if (event.target === modal) {
          closeModal();
      }
  });

  // Prevent modal from closing when clicking inside modal content
  modalContent.addEventListener("click", function (event) {
      event.stopPropagation();
  });

  // Save button click event listener
  saveButton.addEventListener("click", function () {
      const foodItem = document.querySelector(".modal-content");  // Assuming the modal content is used for saving
      const foodId = this.dataset.foodId;

      if (!foodId) {
          alert("Food ID is missing!");
          return;
      }

      // Send foodId to backend to save it
      fetch('/save-food', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              foodId, // only foodId is needed for saving
          }),
      })
      .then((response) => response.json())
      .then((data) => {
          console.log('Food item saved:', data);
          alert('Food item saved!');
      })
      .catch((error) => {
          console.error('Error saving food item:', error);
          alert('Failed to save food item.');
      });
  });
});





function attachAutocomplete() {
  const searchInput = document.getElementById("search-input");
  const autocompleteContainer = document.getElementById("autocomplete-list");
  const allFoodItems = document.querySelectorAll(".food-item");

  searchInput.addEventListener("input", function () {
      const searchQuery = searchInput.value.toLowerCase();
      autocompleteContainer.innerHTML = ""; // Clear previous suggestions

      if (searchQuery.trim() === "") return;

      allFoodItems.forEach((item) => {
          const title = item.getAttribute("data-title").toLowerCase();
          const imageSrc = item.querySelector("img").src;

          if (title.includes(searchQuery)) {
              // Create suggestion item
              const suggestion = document.createElement("div");
              suggestion.classList.add("autocomplete-item");

              // Optional: Include image in suggestions
              const img = document.createElement("img");
              img.src = imageSrc;
              img.alt = title;

              const text = document.createElement("span");
              text.textContent = item.getAttribute("data-title");

              suggestion.appendChild(img); // Add image
              suggestion.appendChild(text); // Add text

              // Add click event to show the food item
              suggestion.addEventListener("click", function () {
                  searchInput.value = item.getAttribute("data-title");
                  autocompleteContainer.innerHTML = "";

                  // Show only the selected food item
                  allFoodItems.forEach((food) => {
                      food.style.display = "none";
                  });
                  item.style.display = "block";
                  item.scrollIntoView({ behavior: "smooth" });
              });

              autocompleteContainer.appendChild(suggestion);
          }
      });
  });

  // Close suggestions when clicking outside
  document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-section")) {
          autocompleteContainer.innerHTML = "";
      }
  });
}

function showCategory(category) {
  const allFoodItems = document.querySelectorAll('.food-item');
  allFoodItems.forEach(function (item) {
    item.style.display = 'none'; // Hide all items initially
  });

  if (category === 'All') {
    // Show all food items
    allFoodItems.forEach(function (item) {
      item.style.display = 'block';
    });
  } else {
    // Format category for matching class format
    const formattedCategory = category.toLowerCase().replace(/\s+/g, '-');

    // Show food items that match the selected category
    const selectedCategoryItems = document.querySelectorAll(`.food-item.${formattedCategory}`);
    selectedCategoryItems.forEach(function (item) {
      item.style.display = 'block';
    });
  }
}



function logout() {
  window.location.href = '/';
}

function saved() {
  window.location.href = '/saved';
}

