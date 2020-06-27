$(document).ready(function () {

    let url = 'http://localhost:8081/';
    let chosenIngredients = [];
    let chosenIngredientsSection = $('#chosen-ingredients-section');
    chosenIngredientsSection.hide();

    $.ajax({
        url: url + 'category',
        success: categories => {
            let categoryHtmlContainer = $('#category-list');

            categories.forEach(function (category) {
                categoryHtmlContainer.append('<li><a href="#" id="' + category.id + '">' + category.name + '</a></li>');

                $('#' + category.id).click(function () {
                    loadCategoryIngredients(category.id);
                });
            });
        }
    });

    function loadCategoryIngredients(categoryId) {
        $(".active-category").removeClass('active-category');

        $('#' + categoryId).addClass("active-category");

        $.ajax({
            url: url + 'ingredient/' + categoryId,
            success: ingredients => {
                let ingredientsHtmlContainer = $('#ingredients-container');
                ingredientsHtmlContainer.html('');

                if (ingredients.length === 0) {
                    ingredientsHtmlContainer.append("Bu kategoride ürün bulunamamaktadır.");
                } else {
                    ingredients.forEach(ingredient => {
                        ingredientsHtmlContainer.append('<button class="non-checked-btn" id="' + ingredient.id + '"> ' + ingredient.name + '</button>');
                        $('#' + ingredient.id).click(function () {

                            $('#' + ingredient.id).addClass("checked-btn");

                            if (!chosenIngredients.includes(ingredient)) {
                                chosenIngredients.push(ingredient);
                                loadRecipes();
                            } else {
                                $('#' + ingredient.id).removeClass("checked-btn");
                                chosenIngredients = chosenIngredients.filter(singleIngredient => {
                                    return singleIngredient !== ingredient
                                });
                                loadRecipes();
                            }

                            renderChosenIngredients();

                        });

                    })
                }
            }
        })
    }

    function loadRecipes() {
        $('#ingredient-count').html(chosenIngredients.length);

        $.ajax({
            url: url + 'search-recipe',
            type: 'post',
            contentType: 'application/json',
            data: JSON.stringify(chosenIngredients),
            success: recipes => {
                renderRecipes(recipes);
            }
        })
    }

    function renderRecipes(recipes) {
        let recipesHtmlContainer = $('#recipe-container');
        recipesHtmlContainer.html('');
        if (recipes.length === 0) {
            recipesHtmlContainer.append("Seçime uygun tarif bulunamadı.");
        } else {
            recipes.forEach(recipe => {
                recipesHtmlContainer.append(prepareRecipeCard(recipe));
            })
        }
    }

    function prepareRecipeCard(recipe) {
        let missingIngredients = findMissingIngredients(recipe);

        return '<div class="col-lg-4 col-md-4 col-sm-6">' +
            '<div class="blog__item">' +
            '<div class="blog__item__pic">' +
            '<img src="' + recipe.imageUrl + '" alt="">' +
            '</div>' +
            '<div class="blog__item__text">' +
            '<ul>' +
            '<li><b>Eksik Malzemeler:</b> <br><i class="fa fa-cutlery" style="margin-right: 5px"></i> ' + missingIngredients + '<a' +
            'href=""></a></li>' +
            '</ul>' +
            '<h5><a href="#">' + recipe.name + ' </a></h5>' +
            '<p>' + recipe.steps + '</p>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    function findMissingIngredients(recipe) {
        let missingIngredients = [];

        recipe.ingredients.forEach(ingredient => {
            let found = false;

            chosenIngredients.forEach(chosenIngredient => {
                if (chosenIngredient.id === ingredient.id) {
                    found = true;
                }
            });

            if (!found) {
                missingIngredients.push(ingredient);
            }
        });

        let differenceString = '';

        if (missingIngredients.length === 0) {
            differenceString = 'Bu tarif için eksik malzemeniz bulunmamaktadır.'
        } else {
            missingIngredients.forEach(d => {
                if (differenceString === '') {
                    differenceString = d.name;
                } else {
                    differenceString = differenceString + ', ' + d.name;
                }
            });
            differenceString = differenceString +
                '<a href="https://www.banabi.com/" target="_blank" style="margin-left: 3px"><img height="30" src="https://lh3.googleusercontent.com/proxy/QGtKSYqRuXnGVTLH09HPAp9wL1XKsSziKjOLap81g9eqw8NLhDIFAmjF-6vxFNjvA7-RFxJTs8Bt94Zq3GVpxPOqWunlpHIDkimNPt5oUCHaFbub-Q-hfYePuPA" /></a>' +
                '<a href="https://getir.com" target="_blank" style="margin-left: 3px"><img height="30" src="https://www.getir.com/img/bimutluluk.png" /></a>'
        }

        return differenceString;
    }

    function renderChosenIngredients() {

        goToByScroll('page-content');

        if (chosenIngredients.length > 0) {
            chosenIngredientsSection.show('fast');
            let chosenIngredientsHtmlContainer = $('#chosen-ingredients-container');
            chosenIngredientsHtmlContainer.html('');

            chosenIngredients.forEach(ingredient => {
                chosenIngredientsHtmlContainer.append('<a href="#" class="checked-btn" id="' + ingredient.id + '"> ' + ingredient.name + '</a>');
            });
        } else {
            chosenIngredientsSection.hide('fast');
        }
    }

    function goToByScroll(id) {
        id = id.replace("link", "");
        $('html,body').animate({
            scrollTop: $("#" + id).offset().top
        }, 'slow');
    }
});