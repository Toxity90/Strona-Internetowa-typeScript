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

// Funkcja, która przeszukuje bazę po wpisanym słowie
export const getRecipesByIngredient = (name: string): Recipe[] => {
  // Filtrujemy bazę przepisów
  return recipesDatabase.filter(recipe => 
    // Sprawdzamy, czy którykolwiek składnik (ing) zawiera wpisany tekst (name)
    recipe.ingredients.some(ing => ing.toLowerCase().includes(name.toLowerCase())))
  };

//  funkcja do filtrowania po kategoriach (tagach)
export const getRecipesByTag = (tag: string): Recipe[] => {
  // Przeszukujemy bazę i sprawdzamy czy przepis ma w swojej liście dany tag
  return recipesDatabase.filter(recipe => recipe.tags.includes(tag));
};

// Linia 50: Twoja obecna funkcja
export const getRecipesByTags = (tag: string): Recipe[] => {
  return recipesDatabase.filter(recipe => recipe.tags.includes(tag));
}; // Linia 54: Tutaj kończy się stara funkcja


// FUNKCJA: Łączy szukanie po składnikach i tagach jednocześnie
export const getFilteredRecipes = (ingredients: string[], tag: string): Recipe[] => {
  return recipesDatabase.filter(recipe => {
    // Sprawdzamy, czy przepis zawiera którykolwiek z wpisanych składników (z Twojej listy)
    const matchesIngredients = ingredients.length === 0 || ingredients.some(ing => 
      recipe.ingredients.some(recipeIng => recipeIng.toLowerCase().includes(ing.toLowerCase()))
    );

    // Sprawdzamy, czy przepis ma wybrany przez Ciebie filtr (np. "wege")
    const matchesTag = tag === "" || recipe.tags.includes(tag);

    // Przepis zostaje wyświetlony tylko jeśli pasuje do składników I do tagu
    return matchesIngredients && matchesTag;
  });
};