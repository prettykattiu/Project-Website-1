function logout() {
    window.location.href = '/';
}

function back() {
    window.location.href = '/dashboard';
}

document.addEventListener("DOMContentLoaded", function () {
    const savedRecipesContainer = document.getElementById('saved-reciped-comtainer');
    const modal = document.getElementById("food-modal");
    const closeButton = document.querySelector(".close-button");

    // Function to open the modal
    function openModal(foodItem) {
        const title = foodItem.getAttribute("data-title");
        const description = foodItem.getAttribute("data-description");
        const imageSrc = foodItem.getAttribute("data-image");
        const recipe = foodItem.getAttribute("data-food_recipe");
        const goodFor = foodItem.getAttribute("data-good_for");
        const ingredients = foodItem.getAttribute("data-ingredients").split(",");
        const procedure = foodItem.getAttribute("data-procedure").split(/\d+\.\s/).filter(Boolean);
        const foodId = foodItem.getAttribute("data-food-id");

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

        const modalGoodFor = modal.querySelector("#modal-good-for");
        modalGoodFor.textContent = goodFor;

        // Set up the unsave button with the correct foodId
        const unsaveButton = modal.querySelector("#unsave-button");
        unsaveButton.setAttribute("data-food-id", foodId);

        // Add event listener to the unsave button
        unsaveButton.addEventListener("click", function () {
            unsaveFood(foodId); // Call the unsaveFood function with the correct foodId
        });

        modal.style.display = "block";
    }

    // Function to handle unsave (delete) food item
    function unsaveFood(foodId) {
        fetch(`/unsave-food/${foodId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Food item unsaved successfully') {
                alert('Recipe has been unsaved!');
                closeModal();
                removeFoodItemFromUI(foodId); // Remove the food item from the UI after deletion
            } else {
                alert('Failed to unsave recipe.');
            }
        })
        .catch((error) => {
            console.error('Error unsaving food:', error);
        });
    }

    // Function to remove food item from UI
    function removeFoodItemFromUI(foodId) {
        const foodItem = savedRecipesContainer.querySelector(`[data-food-id="${foodId}"]`);
        if (foodItem) {
            savedRecipesContainer.removeChild(foodItem);
        }
    }

    // Function to close the modal
    function closeModal() {
        modal.style.display = "none";
    }

    // Event listener for the close button (X)
    closeButton.addEventListener("click", closeModal);

    // Event listener for clicking outside the modal (on the background)
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Function to fetch saved foods from the server
    function fetchSavedFoods() {
        fetch('/saved-foods')
            .then((response) => response.json())
            .then((data) => {
                console.log('Fetched saved foods:', data);

                savedRecipesContainer.innerHTML = ''; // Clear existing items

                if (data.length > 0) {
                    data.forEach((savedItem) => {
                        const { food_id, name, description, image_url, recipe, ingredients, good_for, procedure } = savedItem;

                        const foodItem = document.createElement('div');
                        foodItem.classList.add('food-item');
                        foodItem.setAttribute('data-food-id', food_id);
                        foodItem.setAttribute('data-title', name);
                        foodItem.setAttribute('data-description', description);
                        foodItem.setAttribute('data-image', image_url);
                        foodItem.setAttribute('data-food_recipe', recipe);
                        foodItem.setAttribute('data-ingredients', ingredients);
                        foodItem.setAttribute('data-good_for', good_for);
                        foodItem.setAttribute('data-procedure', procedure);

                        foodItem.innerHTML = `
                            <img src="${image_url}" alt="${name}">
                            <div class="dish-name">${name}</div>
                        `;

                        // Add event listener to open modal when clicked
                        foodItem.addEventListener("click", function () {
                            openModal(foodItem);
                        });

                        savedRecipesContainer.appendChild(foodItem);
                    });
                } else {
                    savedRecipesContainer.innerHTML = "<p>No saved recipes found.</p>";
                }
            })
            .catch((error) => {
                console.error('Error fetching saved foods:', error);
            });
    }

    // Initial call to fetch saved foods
    fetchSavedFoods();
});



document.addEventListener("DOMContentLoaded", function () {
    const savedContainer = document.getElementById("saved-recipes-container");
    const hiddenFoods = document.getElementById("hidden-foods");
    const saveButtons = document.querySelectorAll(".save-button");

    // Function to load saved foods
    function loadSavedFoods() {
        fetch('/saved-foods') // Get saved food items from the server
            .then(response => response.json())
            .then(savedFoods => {
                savedContainer.innerHTML = ""; // Clear the container
    
                if (savedFoods.length > 0) {
                    savedFoods.forEach(food => {
                        // Check if food is already in the saved container by its food_id
                        if (!isFoodAlreadySaved(food.food_id)) {
                            const foodItem = document.createElement("div");
                            foodItem.classList.add("food-item");
                            foodItem.setAttribute("data-food-id", food.food_id); // Set the data-food-id attribute
                            foodItem.innerHTML = `
                                <img src="${food.data_image}" alt="${food.data_name}">
                                <div class="dish-name">${food.data_name}</div>
                                <p>${food.data_description}</p>
                            `;
                            savedContainer.appendChild(foodItem);
                        }
                    });
                } else {
                    savedContainer.innerHTML = "<p>No saved food items yet.</p>";
                }
            })
            .catch(error => console.error("Error loading saved foods:", error));
    }
    
    // Check if the food with a specific ID is already saved (in the UI)
    function isFoodAlreadySaved(foodId) {
        const existingFoodItems = savedContainer.querySelectorAll(".food-item");
        for (let foodItem of existingFoodItems) {
            if (foodItem.getAttribute("data-food-id") === foodId) {
                return true; // The food is already saved and displayed
            }
        }
        return false; // The food is not already saved
    }
    

    // Initial load
    loadSavedFoods();
});



// Function to view a recipe in a modal or separate page
function viewRecipe(recipeId) {
    // Implement functionality to view the full recipe details
    alert('Viewing recipe with ID: ' + recipeId);
}
