import OpenAI from "openai"; // Importujemy oficjalną bibliotekę OpenAI do obsługi modeli

// Tworzymy nową instancję klienta OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Pobieramy klucz API bezpiecznie z Twojego pliku .env
});

// Główna funkcja, którą wywołasz, by dostać przepisy
export async function generateRecipes(ingredients: string[]) {
  // Wywołujemy nowe Responses API (standard od 2025/2026)
  const response = await openai.responses.create({
    model: "gpt-4o-mini", 
    // Przekazujemy instrukcję dla AI jako 'input' (w Responses API to główny punkt wejścia)
    input: `Jesteś kucharzem zero-waste. Mam: ${ingredients.join(", ")}. Wygeneruj kilka przepisów z polami 'nazwa przepisu', 'składniki', 'czas przygotowania', 'instrukcje przygotowania krok po kroku' WAŻNE: Jak jest lista składników to gdy podajesz jednostki np. gramy to w nawiasie pisz to samo tylko że w szklankach lub łyżkach.`,
    // Opcjonalnie: formatowanie pod agentów (Responses API świetnie radzi sobie z JSONem)
  });

  // Zwracamy czysty tekst wygenerowany przez AI (output_text to wygodny skrót w nowym SDK)
  return response.output_text;
}