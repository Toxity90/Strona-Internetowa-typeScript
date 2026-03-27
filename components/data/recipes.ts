// Tworzymy schemat przepisu (co musi mieć każde danie)
export interface Recipe {
  id: number;           // Unikalny numer (ID) potrawy
  title: string;        // Nazwa potrawy, która wyświetli się użytkownikowi
  ingredients: string[]; // Lista składników (zapisana w nawiasach kwadratowych)
  image: string;        // Ścieżka do zdjęcia, które wrzucisz do folderu public/images
  tags: string[]; // Lista kategorii np. ["szybki"]
}

// To jest Twoja "książka kucharska" - tutaj dopisujesz nowe dania
export const recipesDatabase: Recipe[] = [
  {
    id: 1,
    title: "Szybka Jajecznica",
    ingredients: ["jajka", "masło", "sól"],
    image: "/images/jajecznica.png",
    tags: ["szybki", "wysokobiałkowy"]
  },
  {
    id: 2,
    title: "Sałatka z ciecierzycy",
    ingredients: ["ciecierzyca", "pomidor", "ogórek"],
    image: "/images/salatka.png",
    tags: ["wege", "szybki", "tani"]
  },
  {
    id: 3,
    title: "Kurczak z ryżem",
    ingredients: ["kurczak", "ryż", "brokuły"],
    image: "/images/kurczak.png",
    tags: ["wysokobiałkowy", "obiad"]
  },
  {
    id: 4,
    title: "Makaron z sosem pomidorowym",
    ingredients: ["makaron", "pomidory", "bazylia"],
    image: "/images/makaron.png",
    tags: ["wege", "tani", "obiad"]
  }
];
// Eksportuje stałą funkcję, która przyjmuje nazwę składnika (string) i zwraca tablicę obiektów typu Recipe.
export const getRecipesByIngredient = (name: string): Recipe[] => { 
  // Przeszukuje tablicę recipesDatabase, tworząc nową listę tylko z pasującymi elementami.
  return recipesDatabase.filter((recipe) => {
    // Sprawdza, czy przynajmniej jeden składnik w danym przepisie spełnia poniższy warunek.
    return recipe.ingredients.some((ing) =>
      // Sprawdza, czy składnik zawiera szukaną frazę, ignorując wielkość liter.
      ing.toLowerCase().includes(name.toLowerCase())
    );
  }); 
};
// Eksportuje funkcję filtrującą przepisy na podstawie konkretnego tagu (kategorii).
export const getRecipesByTag = (tag: string): Recipe[] => {
  // Zwraca przepisy, których tablica tagów zawiera dokładnie taki sam ciąg znaków jak podany tag.
  return recipesDatabase.filter(recipe => recipe.tags.includes(tag));
};

// Eksportuje zaawansowaną funkcję filtrującą jednocześnie po liście składników oraz tagu.
export const getFilteredRecipes = (ingredients: string[], tag: string): Recipe[] => {
  // Rozpoczyna proces filtrowania bazy danych przepisów.
  return recipesDatabase.filter(recipe => {
    // Sprawdza, czy lista szukanych składników jest pusta LUB czy przepis zawiera choć jeden z nich.
    const matchesIngredients =
      ingredients.length === 0 ||
      ingredients.some(ing =>
        // Głębokie przeszukiwanie: czy którykolwiek składnik przepisu zawiera szukaną frazę (bez względu na wielkość liter).
        recipe.ingredients.some(recipeIng =>
          recipeIng.toLowerCase().includes(ing.toLowerCase())
        )
      );

    // Sprawdza, czy parametr tag jest pusty LUB czy dany przepis posiada ten konkretny tag.
    const matchesTag = tag === "" || recipe.tags.includes(tag);

    // Zwraca przepis tylko wtedy, gdy spełnia on jednocześnie warunek składników i warunek tagu.
    return matchesIngredients && matchesTag;
  });
};
