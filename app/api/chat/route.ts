import { NextResponse } from "next/server"; // Importujemy narzędzie do wysyłania odpowiedzi do przeglądarki
import { generateRecipes } from "@/lib/ai"; // Importujemy Twoją funkcję AI, którą napisałeś w lib/ai.ts

// Tworzymy funkcję POST - obsługuje wysyłanie danych (składników) ze strony
export async function POST(req: Request) {
  try {
    // 1. Wyciągamy dane (składniki), które użytkownik wysłał w formularzu
    const body = await req.json(); // Zamieniamy surowe dane z zapytania na obiekt JavaScript
    const { ingredients } = body; // Wyciągamy samą listę składników (np. ["jajka", "mleko"])

    // 2. Sprawdzamy, czy użytkownik w ogóle coś wysłał
    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: "Nie podano składników" }, { status: 400 }); // Zwracamy błąd, jeśli puste
    }

    // 3. Wywołujemy Twój model GPT-4.1-mini z pliku lib/ai.ts
    const recipeOutput = await generateRecipes(ingredients); // Czekamy na wygenerowanie przepisu

    // 4. Wysyłamy gotowy przepis z powrotem do użytkownika
    return NextResponse.json({ success: true, recipe: recipeOutput }); // Zwracamy JSON z sukcesem i tekstem

  } catch (error) {
    // 5. Jeśli coś wybuchnie (np. brak klucza API lub brak neta), łapiemy błąd tutaj
    console.error("Błąd w API Route:", error); // Logujemy błąd w konsoli serwera (w VS Code)
    return NextResponse.json({ error: "Błąd podczas generowania przepisu" }, { status: 500 }); // Informujemy użytkownika o błędzie
  }
}