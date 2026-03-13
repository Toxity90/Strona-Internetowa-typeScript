"use client" // Mówisz Next.js: "Ten plik ma reagować na kliknięcia i wpisywanie tekstu w przeglądarce użytkownika". Bez tego strona byłaby statyczna jak gazeta.
import { Camera } from "lucide-react"; // Import ikonki aparatu
import { useRef } from "react"; // useRef to narzędzie, które pozwala Ci "zapamiętać" coś między renderami. Tutaj użyjemy go do przechowywania odniesienia do elementu input, który jest niewidoczny, ale służy do wybierania zdjęć z telefonu.
import { useState } from "react" //Wyciągasz z bibliotekę React "pudełko na dane", które pozwoli stronie pamiętać, co wpisał użytkownik.

import { getRecipesByIngredient, Recipe } from './data/recipes'; // Importujesz funkcję, która potrafi znaleźć przepisy na podstawie składników, oraz typ danych "Recipe", który opisuje jak wygląda przepis (np. ma tytuł, zdjęcie, itd.). Ten import jest potrzebny do późniejszego wyszukiwania przepisów.

export default function Search() { //Tworzysz główną funkcję (komponent), która buduje Twój element wyszukiwarki. export pozwala użyć go w innych częściach strony.

const fileInputRef = useRef<HTMLInputElement>(null); // Tworzysz "pilot" do obsługi aparatu, który pozwoli Ci otworzyć menu wyboru zdjęcia, gdy użytkownik kliknie ikonę aparatu. useRef(null) oznacza, że na początku nie ma żadnego elementu przypisanego do tego pilota.

  const [ingredient, setIngredient] = useState("") 
 //Tworzysz zmienną ingredient (tu trafia tekst) i funkcję setIngredient (narzędzie do zmiany tego tekstu).
  // useState to „inteligentna szufladka”, która pozwala Reactowi zapamiętać wpisane dane i automatycznie odświeżyć to, co widzisz na ekranie, gdy ich zawartość się zmieni.
  // "" oznacza że początkowo pole jest puste
  const [ingredientsList, setIngredientsList] = useState<string[]>([]) //// Stan dla CAŁEJ LISTY (string[] oznacza tablicę napisów, [] to pusta lista na start)

const [foundRecipes, setFoundRecipes] = useState<Recipe[]>([]); // Tworzymy miejsce na znalezione przepisy

// --- NOWE RZECZY DLA AI ---
const [aiRecipe, setAiRecipe] = useState(""); // NOWE: Pudełko na tekst przepisu, który przyjdzie z GPT-4.1-mini
const [isLoading, setIsLoading] = useState(false); // NOWE: Stan, który mówi czy AI teraz pracuje (true) czy odpoczywa (false)

const handleCameraClick = () => {
  fileInputRef.current?.click(); // Po kliknięciu w ikonkę, "klika" w ukryty aparat. File inputt onazwa zmiennej pudełka którą wczesniej stworzyliśmy. current to sposób na dostęp do tego, co jest w środku pudełka. ?. to taki bezpiecznik, który mówi: "jeśli jest coś w środku, kliknij, ale jeśli nie ma, to nie rób nic i nie pokazuj błędu".
};

const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]; //  Wyciągamy plik zdjęcia
  if (!file) return; // Jeśli użytkownik nie wybrał zdjęcia, to nic nie rób (zwróć pustkę i zakończ funkcję)

  setIsLoading(true); //  Włączamy kręciołek/napis "AI myśli", żeby użytkownik wiedział, że coś się dzieje

  try {
    //  Zamieniamy zdjęcie na format, który rozumie internet (FormData)
    const formData = new FormData(); // Tworzymy "paczka danych", która potrafi przechować plik zdjęcia i wysłać go do serwera
    formData.append("file", file); // Dodajemy zdjęcie do tego "paczka danych", którą wyślemy do serwera

    // WYSYŁAMY zdjęcie do Twojego API (musimy zaraz stworzyć ten endpoint)
    const response = await fetch("/api/vision", {
      method: "POST", // Wysyłamy dane
      body: formData, // Pakujemy zdjęcie w formę, którą serwer potrafi odczytać
    });

    const data = await response.json(); // Czekamy na odpowiedź z serwera i zamieniamy ją z formatu internetowego na coś, co możemy używać w JavaScript (JSON)

    if (data.ingredients) { //  Jeśli serwer odpowiedział, że rozpoznał składniki, to...
      //  Jeśli AI rozpoznało składniki, dodajemy je do Twojej listy!
      setIngredientsList([...ingredientsList, ...data.ingredients]);
      alert("AI rozpoznało: " + data.ingredients.join(", "));
    }
  } catch (error) {
    console.error("Błąd przy analizie zdjęcia:", error); // Jeśli coś poszło nie tak (np. zdjęcie było niewyraźne, albo serwer miał problem), pokaż alert z informacją o błędzie.
    alert("Nie udało się odczytać zdjęcia.");
  } finally { // Ten blok wykona się zawsze, niezależnie od tego, czy wszystko poszło dobrze, czy był błąd. To idealne miejsce, żeby wyłączyć kręciołek/napis "AI myśli", bo w obu przypadkach AI już skończyło swoją pracę.
    setIsLoading(false); //  Wyłączamy ładowanie
  }
};
  const handleAdd = () => { //To jest Twoja własna funkcja. Możesz o niej myśleć jak o "przepisie na akcję". Mówisz komputerowi: "Gdy wywołam handleAdd, wykonaj wszystkie kroki wewnątrz tych nawiasów {}
 if  (ingredient.trim() !== ""){ //Sprawdza czy nie dodajesz "powietrza" (pustego pola)
setIngredientsList([...ingredientsList, ingredient.trim()])
setIngredient("")
 }
  };

// --- NOWA FUNKCJA DO GADANIA Z AI ---
const handleGenerateAI = async () => { // NOWE: Funkcja wysyłająca Twoją listę do pliku route.ts
  if (ingredientsList.length === 0) return alert("Dodaj składniki!"); // Nie wysyłaj, jeśli lista jest pusta
  setIsLoading(true); // Włączamy ładowanie
  try {
    const response = await fetch("/api/chat", { // Łączymy się z Twoim API
      method: "POST", // Wysyłamy dane
      body: JSON.stringify({ ingredients: ingredientsList }), // Pakujemy listę składników
    });
    const data = await response.json(); // Czekamy na odpowiedź
    if (data.success) setAiRecipe(data.recipe); // Jeśli sukces, zapisujemy przepis
  } catch (e) { console.error(e); } // Jeśli błąd, wypisz w konsoli
  setIsLoading(false); // Wyłączamy ładowanie
};

  return ( // zwracany JSX czyli kod interfejsu, Wszystko, co jest pod tym słowem, zostanie narysowane na ekranie.

    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif'}}> {/*Zwykły kontener (taki niewidzialny karton), który trzyma wszystko w kupie. To już jest JSX.*/}


<div style={{ display: 'flex', gap: '10px'}}>

{/* --- UKRYTY APARAT --- */}
<input 
  type="file" 
  accept="image/*" // pozwala wybrać tylko zdjęcia
  capture="environment" // na telefonach otwiera od razu aparat, a nie galerię
  ref={fileInputRef} // podłączamy ten input do naszego "pilota" (fileInputRef), żebyśmy mogli go otworzyć klikając w ikonę aparatu
  onChange={handleFileChange} 
  style={{ display: 'none' }} // Ukrywamy brzydki systemowy przycisk
/>

{/* --- PRZYCISK Z IKONKĄ --- */}
<button 
  type="button" // standardowy znacznik przycisku
  onClick={handleCameraClick} // Po kliknięciu w ten przycisk, otworzy się menu wyboru zdjęcia (dzięki handleCameraClick)
  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
>
  <Camera size={28} color="#555" />
</button>

      <input //To jest właśnie kod interfejsu (JSX). To, co tu napiszesz, użytkownik zobaczy jako pole do pisania.
        type="text" // typ pola - tekst
        placeholder="Wpisz składnik" // tekst podpowiedzi w polu
        value={ingredient} // wartość pola jest powiązana ze stanem "ingredient"
        onKeyDown={(e) =>{ // funkcja uruchamiana gdy użytkownik naciśnie klawisz}
          if (e.key === "Enter") { // sprawdza czy to był klawisz Enter
            handleAdd(); // Jeśli naciśnie Enter, wywołaj funkcję dodawania składnika
          }
        }}
        onChange={(e) => setIngredient(e.target.value)} 
        // funkcja uruchamiana gdy użytkownik coś wpisze
        // gdy użytkownik naciśnie klawisz, bierze nową literkę (e.target.value) i natychmiast wrzuca ją do szufladki przez setIngredient.
        style={{ padding: '8px',flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} 
      />
<button //Standardowy znacznik przycisku. Tekst pomiędzy nimi to to, co napisane jest na przycisku na ekranie.
onClick={handleAdd} // funkcja handleAdd uruchamiana po kliknięciu przycisku
style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
>
  Dodaj składnik
</button>

  </div> {/* zamknięcie kontenera i koniec funckji */}

  <div style={{ marginTop: '30px' }}>
    <h3>Twoje składniki:</h3>
    <ul style={{ listStyleType: 'none', padding: 0 }}> {/* ul to znacznik listy punktowej */}
    
    {/* map to metoda, która bierze każdy element z ingredientsList i tworzy z niego coś nowego. */}
  {ingredientsList.map((item, index) => (
    <li 
      key={index} // klucz to specjalna rzecz, która pomaga Reactowi śledzić elementy listy.
      style={{ 
        display: 'flex',              // Włącza elastyczny układ (pozwala ustawić elementy obok siebie)
        flexDirection: 'row',         // Wymusza, by tekst i przycisk były w jednej linii (poziomo)
        alignItems: 'center',         // Centruje tekst i przycisk pionowo względem siebie
        justifyContent: 'space-between', // Wypycha tekst na lewo, a przycisk X maksymalnie na prawo
        background: '#f9f9f9',        // Twoje tło ramki
        padding: '10px',              // Odstęp wewnątrz ramki
        marginBottom: '5px',          // Odstęp między ramkami składników
        borderRadius: '5px',          // Zaokrąglenie rogów ramki
        borderLeft: '5px solid #28a745', 
        width: '100%',                // Sprawia, że ramka zajmuje całą dostępną szerokość
        boxSizing: 'border-box'       // Pilnuje, by padding nie "rozpychał" ramki poza ekran
      }}
    >
      {/* <span> trzyma tekst składnika, flex: 1 sprawia, że zajmuje on całą wolną przestrzeń po lewej */}
      <span style={{ flex: 1 }}>{item}</span>
      
      {/* Przycisk usuwania (X) */}
      <button 
        onClick={() => {
          // filter tworzy nową listę, pomijając ten jeden konkretny element (po jego numerze index)
          const nowaLista = ingredientsList.filter((_, i) => i !== index);
          setIngredientsList(nowaLista); // Aktualizuje stan aplikacji nową, krótszą listą
        }}
        style={{ 
          color: 'red',               // Kolor iksa
          border: 'none',             // Usuwa domyślną ramkę przycisku
          background: 'none',         // Usuwa tło przycisku
          cursor: 'pointer',          // Zmienia kursor na "łapkę" po najechaniu
          fontWeight: 'bold',         // Pogrubia iksa
          fontSize: '18px',           // Wielkość iksa
          marginLeft: '10px',         // Odstęp iksa od tekstu składnika
          lineHeight: '1'             // Zapobiega sztucznemu zwiększaniu wysokości ramki przez przycisk
        }}
        title="Usuń ten składnik"      // Tekst, który pojawi się po najechaniu myszką
      >
        ✕
      </button>
    </li>
  ))}
</ul>

    {ingredientsList.length === 0 && <p>Brak składników. Dodaj coś do listy!</p>} {/* To jest warunkowe renderowanie. Jeśli lista jest pusta, pokaż ten tekst. */}
  </div>

  {/* --- NOWY PRZYCISK AI POD LISTĄ --- */}
  <button 
    onClick={handleGenerateAI} // Funkcja, która wyśle składniki do AI i poczeka na przepis
    style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  >
    {isLoading ? "AI myśli..." : "Generuj przepis przez AI"} {/* Zmienia tekst podczas ładowania */}
  </button>

  {/* --- NOWA SEKCJA WYŚWIETLANIA PRZEPISU --- */}
  {aiRecipe && ( // NOWE: Pokazuje ten blok tylko jeśli AI zwróciło przepis
    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '10px', border: '1px solid #ccc' }}>
      <h3 style={{ color: '#28a745' }}>Przepis AI:</h3>
      <p style={{ whiteSpace: 'pre-wrap' }}>{aiRecipe}</p> {/* pre-wrap zachowuje entery w tekście */}
    </div>
  )}

  <div style={{ marginTop: '20px' }}>
  {/* Pętla, która bierze znalezione przepisy i robi z nich małe kafelki na ekranie */}
  {foundRecipes.map(recipe => (
    <div key={recipe.id} style={{ padding: '10px', border: '1px solid blue', borderRadius: '10px' }}>
      <h3>{recipe.title}</h3> {/* Wyświetla nazwę dania */}
      <img src={recipe.image} alt={recipe.title} width="150" /> {/* Wyświetla zdjęcie */}
    </div>
  ))}
  </div>

  </div>
  )
}