import OpenAI from "openai"; // Importujemy oficjalną bibliotekę OpenAI do obsługi modeli

// Tworzymy nową instancję klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Pobieramy klucz API bezpiecznie z Twojego pliku .env
});

// Główna funkcja, którą wywołasz, by dostać przepisy
export async function generateRecipes(ingredients: string[]) {
  // Wywołujemy nowe Responses API (standard od 2025/2026)
  const response = await openai.responses.create({
    model: "gpt-4.1-mini", // Używamy najnowszego modelu o dużej wydajności i niskim koszcie
    // Przekazujemy instrukcję dla AI jako 'input' (w Responses API to główny punkt wejścia)
    input: `Jesteś kucharzem zero-waste. Mam: ${ingredients.join(", ")}. Wygeneruj 3 przepisy w formacie JSON z polami 'name' oraz 'ingredients'.`,
    // Opcjonalnie: formatowanie pod agentów (Responses API świetnie radzi sobie z JSONem)
  });

  // Zwracamy czysty tekst wygenerowany przez AI (output_text to wygodny skrót w nowym SDK)
  return response.output_text;
}