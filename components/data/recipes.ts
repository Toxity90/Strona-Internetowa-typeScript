// Tworzymy schemat przepisu (co musi mieć każde danie)
export interface Recipe {
  id: number;           // Unikalny numer (ID) potrawy
  title: string;        // Nazwa potrawy, która wyświetli się użytkownikowi
  ingredients: string[]; // Lista składników (zapisana w nawiasach kwadratowych)
  image: string;        // Ścieżka do zdjęcia, które wrzucisz do folderu public/images
}

// To jest Twoja "książka kucharska" - tutaj dopisujesz nowe dania
export const recipesDatabase: Recipe[] = [
  {
    id: 1,
    title: "Szybka Jajecznica", // Nazwa dania
    ingredients: ["jajka", "masło", "sól"], // Składniki, po których można szukać
    image: "/images/jajecznica.png" // Nazwa pliku ze zdjęciem (wrzuć go do public/images)
  }
];

// Funkcja, która przeszukuje bazę po wpisanym słowie
export const getRecipesByIngredient = (name: string): Recipe[] => {
  // Filtrujemy bazę przepisów
  return recipesDatabase.filter(recipe => 
    // Sprawdzamy, czy którykolwiek składnik (ing) zawiera wpisany tekst (name)
    recipe.ingredients.some(ing => ing.toLowerCase().includes(name.toLowerCase()))
  );
};