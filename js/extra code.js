document.addEventListener("DOMContentLoaded", function () {
    const foodItems = document.querySelectorAll(".food-item");
    const modal = document.getElementById("food-modal");
    const modalContent = document.querySelector(".modal-content"); // Modal content wrapper
    const closeButton = document.querySelector(".close-button");
    const saveButton = document.getElementById("save-button");
  
    // Function to open the modal with food details
    function openModal(foodItem) {
      const title = foodItem.getAttribute("data-title");
      const description = foodItem.getAttribute("data-description");
      const imageSrc = foodItem.getAttribute("data-image");
      const recipe = foodItem.getAttribute("data-food_recipe");
      const goodFor = foodItem.getAttribute("data-good_for"); // Fetch 'good for' data
      const ingredients = foodItem
        .getAttribute("data-ingredients")
        .split(","); // Split ingredients into an array
  
      // Populate modal content
      modal.querySelector("#modal-title").textContent = title;
      modal.querySelector("#modal-image").src = imageSrc;
      modal.querySelector("#modal-image").alt = title;
      modal.querySelector("#modal-description").textContent = description;
      modal.querySelector("#modal-recipe").textContent = recipe;
  
      // Populate ingredients list
      const modalIngredients = modal.querySelector("#modal-ingredients");
      modalIngredients.innerHTML = "";
      ingredients.forEach((ingredient) => {
        const li = document.createElement("li");
        li.textContent = ingredient.trim();
        modalIngredients.appendChild(li);
      });
  
      // Add "Good For" section below the ingredients
      const modalGoodFor = modal.querySelector("#modal-good-for");
      modalGoodFor.textContent = goodFor;
  
      // Show the modal
      modal.style.display = "block";
    }
  
    // Function to close the modal
    function closeModal() {
      modal.style.display = "none";
    }
  
    // Attach click event to each food item
    foodItems.forEach((item) => {
      item.addEventListener("click", function () {
        openModal(item);
      });
    });
  
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
  
    // Save button logic
    saveButton?.addEventListener("click", function () {
      const currentTitle = modal.querySelector("#modal-title").textContent;
      alert(`Saved: ${currentTitle}`);
      closeModal();
    });
  });
  