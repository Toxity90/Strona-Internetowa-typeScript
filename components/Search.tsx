"use client"

// Mówisz Next.js: "Ten plik ma reagować na kliknięcia i wpisywanie tekstu w przeglądarce użytkownika". Bez tego strona byłaby statyczna jak gazeta.
import { Camera, X } from "lucide-react"; // Import ikonki aparatu oraz X
import { useRef, useState } from "react"; // useRef to narzędzie, które pozwala Ci "zapamiętać" coś... useState to „inteligentna szufladka”...
import ReactMarkdown from 'react-markdown'; // Import biblioteki do renderowania Markdown, jeśli chcesz wyświetlać przepisy w formacie Markdown

export default function Search() { //Tworzysz główną funkcję (komponent), która buduje Twój element wyszukiwarki.

  // --- TWOJE SZUFLADKI I PILOTY ---
  const fileInputRef = useRef<HTMLInputElement>(null); // Tworzysz "pilot" do obsługi aparatu, który pozwoli Ci otworzyć menu wyboru zdjęcia...
  const [ingredient, setIngredient] = useState(""); //Tworzysz zmienną ingredient (tu trafia tekst) i funkcję setIngredient (narzędzie do zmiany tego tekstu).
  const [ingredientsList, setIngredientsList] = useState<string[]>([]); // Stan dla CAŁEJ LISTY (string[] oznacza tablicę napisów, [] to pusta lista na start)
  const [aiRecipe, setAiRecipe] = useState(""); // NOWE: Pudełko na tekst przepisu, który przyjdzie z GPT-4.1-mini
  const [isLoading, setIsLoading] = useState(false); // NOWE: Stan, który mówi czy AI teraz pracuje (true) czy odpoczywa (false)

  const availableTags = ["szybki", "wysokobiałkowy", "wege", "tani", "obiad"]; // Lista dostępnych filtrów do wyboru
  const [selectedTag, setSelectedTag] = useState<string>(""); // Szufladka na wybrany przez Ciebie filtr

  // --- FUNKCJA DODAWANIA (Uproszczony zapis) ---
  function handleAdd() { //To jest Twoja własna funkcja. Możesz o niej myśleć jak o "przepisie na akcję".
    if (ingredient.trim() !== "") { //Sprawdza czy nie dodajesz "powietrza" (pustego pola)
      setIngredientsList([...ingredientsList, ingredient.trim()]); //Tworzy nową listę, która zawiera wszystko co było wcześniej (...ingredientsList) plus nowy składnik (ingredient.trim())
      setIngredient(""); //Czyli po dodaniu składnika, czyści pole tekstowe, żebyś mógł wpisać kolejny składnik bez ręcznego kasowania.
    }
  }

  // --- FUNKCJA USUWANIA (Nowa, łatwiejsza do zrozumienia) ---
  function handleRemove(indexDoUsuniecia: number) {
    // Tworzymy nową listę bez elementu o danym numerze
    const nowaLista = ingredientsList.filter((_, i) => i !== indexDoUsuniecia); // Filtruje listę składników, usuwając element o podanym indeksie
    setIngredientsList(nowaLista); // Aktualizuje stan aplikacji nową, krótszą listą
  }

  const [recipeImageUrl, setRecipeImageUrl] = useState("");  //const mowi komputerowi, że tworzysz stałe narzędzie do obsługi danych, recipeImageUrl: To nazwa Twojej szufladki. Tu będzie przechowywany adres URL (link) do zdjęcia potrawy, które wygeneruje AI. Na początku jest pusta.setRecipeImageUrl: To „pilot”, którym będziesz wkładać link do tej szufladki. Jak tylko AI stworzy zdjęcie, użyjesz tego pilota, żeby strona „zauważyła” zmianę i wyświetliła obrazek.useState: To funkcja z Reacta, która sprawia, że ta szufladka jest „inteligentna” – gdy tylko jej zawartość się zmieni, strona automatycznie się przebuduje, żeby pokazać zdjęcie.(""): To oznacza, że na samym początku (gdy wchodzisz na stronę) szufladka jest pusta (pusty tekst), bo żadne zdjęcie nie zostało jeszcze wygenerowane.

  const handleCameraClick = () => {
    fileInputRef.current?.click(); // Po kliknięciu w ikonkę, "klika" w ukryty aparat...
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) { // Ta funkcja jest wywoływana, kiedy użytkownik wybierze zdjęcie. event to informacja o tym, co się stało (w tym przypadku, jakie zdjęcie zostało wybrane).
    const file = event.target.files?.[0]; // Pobierasz pierwsze zdjęcie, które użytkownik wybrał (jeśli wybrał). event.target.files to lista wszystkich wybranych plików, a [0] to pierwszy z nich.
    if (!file) return; // Jeśli użytkownik nie wybrał zdjęcia, to nic nie rób

    setIsLoading(true); // Włączamy kręciołek/napis "AI myśli", żeby użytkownik wiedział, że coś się dzieje

    try {
      const formData = new FormData(); // Tworzymy "paczka danych", która potrafi przechować plik zdjęcia
      formData.append("file", file); // Dodajemy wybrane zdjęcie do paczki danych, żeby wysłać je do serwera

      const response = await fetch("/api/vision", { // const response to "koperta", w której przyjdzie odpowiedź z serwera. fetch to narzędzie do wysyłania zapytań do serwera.
        method: "POST",
        body: formData,
      });

      const data = await response.json(); // Czekamy na odpowiedź z serwera i zamieniamy na JSON

      if (data.ingredients) { // Jeśli serwer odpowiedział, że rozpoznał składniki, to...
        setIngredientsList([...ingredientsList, ...data.ingredients]);
        alert("AI rozpoznało: " + data.ingredients.join(", "));
      }
    } catch (error) { // Jeśli coś poszło nie tak (np. serwer nie odpowiedział, albo zdjęcie było złej jakości), to...
      console.error("Błąd przy analizie zdjęcia:", error);
      alert("Nie udało się odczytać zdjęcia.");
    } finally { // Bez względu na to, czy wszystko poszło dobrze, czy źle, zawsze wyłączamy kręciołek
      setIsLoading(false);
    }
  }

  async function handleGenerateAI() { // Funkcja wysyłająca listę do API
    if (ingredientsList.length === 0) { // Sprawdza, czy lista składników nie jest pusta
      alert("Dodaj składniki!");
      return;
    }

    setIsLoading(true); // Włącza wskaźnik ładowania, informując użytkownika, że AI pracuje
    try {
      const response = await fetch("/api/chat", { // Wysyła zapytanie do API czatu z listą składników i wybranym tagiem w formacie JSON
        method: "POST",
        body: JSON.stringify({ ingredients: ingredientsList, tag: selectedTag }),
      });

      const data = await response.json(); // Oczekuje na odpowiedź z serwera i konwertuje ją na obiekt JSON
      if (data.success) { // Sprawdza, czy odpowiedź zawiera sukces
        setAiRecipe(data.recipe); // Ustawia otrzymany przepis w stanie aplikacji
      }
    } catch (e) {
      console.error(e); // Wypisuje błąd do konsoli, jeśli coś poszło nie tak
    } finally {
      setIsLoading(false); // Wyłącza wskaźnik ładowania, niezależnie od wyniku
    }
  }

  return ( // zwracany JSX czyli kod interfejsu
    <div
      style={{ 
        width: '100%',
        margin: '20px 0',
        padding: '0 20px' // Ustawia wewnętrzny odstęp kontenera: 0 pikseli na górze i dole, 20 pikseli po lewej i prawej stronie
      }}
    >
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}> {/*Tworzy kontener flexbox z odstępem 10px między elementami i marginesem dolnym 20px*/}

        {/*  APARAT */}
        <input  // To jest pole do wybierania zdjęć, ale jest ukryte, bo chcemy używać własnego przycisku z ikonką. Ma kilka ważnych atrybutów:

          type="file"  // Mówisz, że to jest pole do wybierania plików
          accept="image/*" // pozwala wybrać tylko zdjęcia
          capture="environment"   // na telefonach otwiera od razu aparat
          ref={fileInputRef} // podłączamy ten input do naszego "pilota"
          onChange={handleFileChange}  // Kiedy użytkownik wybierze zdjęcie, ta funkcja jest wywoływana i zajmuje się wysłaniem go do serwera
          style={{ display: 'none' }} // Ukrywa brzydki systemowy przycisk

        />

        {/* --- PRZYCISK Z IKONKĄ --- */}
        <button
          type="button"
          onClick={handleCameraClick}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Camera size={28} color="#555" />
        </button>

        <input
          type="text" // Pole tekstowe do wpisywania składnika
          placeholder="Wpisz składnik"
          value={ingredient} //
          onChange={(e) => setIngredient(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { handleAdd(); } // Po naciśnięciu Enter dodaje składnik
          }}
          style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button
          onClick={handleAdd} // Przycisk do dodania składnika do listy
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Dodaj
        </button>
      </div>

      <h3 style={{ marginBottom: '10px' }}>Twoje składniki:</h3>

      {ingredientsList.length === 0 && <p style={{ color: '#888' }}>Brak składników. Dodaj coś do listy!</p>} {/*Wyświetla komunikat, jeśli lista składników jest pusta*/}

      <ul style={{ listStyle: 'none', padding: 0 }}> {/*Lista nieuporządkowana bez punktów i paddingu*/}
        {ingredientsList.map((item, index) => (
          <li key={index} style={{ background: '#f0f0f0', margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
            {item} {/*Wyświetla nazwę składnika*/}
            <button
              onClick={() => handleRemove(index)} // Przycisk do usunięcia składnika z listy
              title="Usuń składnik"
              style={{
                color: '#ff4d4f',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px'
              }}
            >
              <X size={20} />
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px', marginBottom: '10px' }}> 
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Wybierz styl dania:</p> {/*Nagłówek dla wyboru tagu*/}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}> {/*Kontener flex dla przycisków tagów z zawijaniem*/}
          {availableTags.map((tag) => ( // Mapuje dostępne tagi na przyciski
            <button
              key={tag} // Unikalny klucz dla każdego przycisku
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)} // Przełącza wybór tagu
              style={{
                padding: '6px 12px',
                borderRadius: '15px',
                border: '1px solid #28a745',
                cursor: 'pointer',
                backgroundColor: selectedTag === tag ? '#28a745' : 'white',
                color: selectedTag === tag ? 'white' : '#28a745',
                fontSize: '0.9rem',
                transition: '0.2s'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerateAI} // Główny przycisk do generowania przepisu przez AI
        disabled={isLoading} // Wyłącza przycisk podczas ładowania
        style={{
          width: '100%',
          padding: '15px',
          marginTop: '20px',
          backgroundColor: isLoading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? "AI generuje przepis..." : "Generuj przepis przez AI"}
      </button>

      {aiRecipe && (
        <div style={{
          display: 'flex',
          gap: '40px',
          marginTop: '40px',
          alignItems: 'flex-start',
          width: '100%',
        }}> 

          {/* LEWA STRONA: PRZEPIS */}
          <div style={{
            width: '48%',
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            textAlign: 'left',
            minWidth: '0',
            boxSizing: 'border-box',
          }}> {/*Lewa strona: kontener na przepis z białym tłem i cieniem*/}
            <div style={{ lineHeight: '1.7', fontSize: '18px' }}> {/*Stylizacja tekstu przepisu z większym odstępem linii*/}
              <ReactMarkdown>{aiRecipe}</ReactMarkdown> {/*Renderuje treść przepisu w formacie Markdown*/}
            </div>
          </div> 
          {/* PRAWA STRONA: ZDJĘCIE */}
          <div style={{
            width: '48%',
            position: 'sticky',
            top: '20px',
            alignSelf: 'flex-start',
            boxSizing: 'border-box',
          }}> {/* Prawa strona: przyklejony kontener na zdjęcie*/}
            
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              backgroundColor: '#f0f0f0',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed #ccc'
            }}>
              {/*recipeImageUrl to stan (zmienna Reacta) przechowujący tekstowy adres URL do obrazka, który ma zostać wyświetlony w <img src=...>. ,  koemnda Sprawdza czy recipeImageUrl istnieje i jeśli tak to wyświetla obrazek, a jeśli nie to pokazuje tekst zastępczy.*/} 
              {recipeImageUrl ? (
                <img
                  src={recipeImageUrl} 
                  alt="Danie"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                />
              ) : (
                <p style={{ color: '#888', textAlign: 'right', padding: '10px' }}>
                  📸 Tu AI wygeneruje zdjęcie potrawy
                </p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}