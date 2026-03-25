"use client" // Mówisz Next.js: "Ten plik ma reagować na kliknięcia i wpisywanie tekstu w przeglądarce użytkownika". Bez tego strona byłaby statyczna jak gazeta.
import { Camera } from "lucide-react"; // Import ikonki aparatu
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
    const nowaLista = ingredientsList.filter((_, i) => i !== indexDoUsuniecia);
    setIngredientsList(nowaLista); // Aktualizuje stan aplikacji nową, krótszą listą
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click(); // Po kliknięciu w ikonkę, "klika" w ukryty aparat...
  };

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) { // Ta funkcja jest wywoływana, kiedy użytkownik wybierze zdjęcie. event to informacja o tym, co się stało (w tym przypadku, jakie zdjęcie zostało wybrane).
    const file = event.target.files?.[0]; // Pobierasz pierwsze zdjęcie, które użytkownik wybrał (jeśli wybrał). event.target.files to lista wszystkich wybranych plików, a [0] to pierwszy z nich.
    if (!file) return; // Jeśli użytkownik nie wybrał zdjęcia, to nic nie rób

    setIsLoading(true); // Włączamy kręciołek/napis "AI myśli", żeby użytkownik wiedział, że coś się dzieje

    try {
      const formData = new FormData(); // Tworzymy "paczka danych", która potrafi przechować plik zdjęcia
      formData.append("file", file); 

      const response = await fetch("/api/vision", { // const response to "koperta", w której przyjdzie odpowiedź z serwera. fetch to narzędzie do wysyłania zapytań do serwera. Wysyłasz je na adres "/api/vision" (to jest Twój własny serwer, który musisz jeszcze stworzyć w folderze /pages/api/vision.ts) i mówisz, że to jest POST (czyli wysyłasz dane) i dołączasz swoją "paczka danych" z plikiem zdjęcia.
        method: "POST", // Mówisz, że to jest POST (czyli wysyłasz dane)
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
    } finally { // Bez względu na to, czy wszystko poszło dobrze, czy źle, zawsze wyłączamy kręciołek/napis "AI myśli", żeby użytkownik wiedział, że proces się zakończył.
      setIsLoading(false); // Wyłączamy ładowanie
    }
  }

  async function handleGenerateAI() { // NOWE: Funkcja wysyłająca Twoją listę do pliku route.ts
    if (ingredientsList.length === 0) {
      alert("Dodaj składniki!");
      return;
    }
    
    setIsLoading(true); // Włączamy ładowanie
    try {
      const response = await fetch("/api/chat", { // Wysyłamy zapytanie do naszego serwera, który będzie miał endpoint /api/chat (to też musisz stworzyć w folderze /pages/api/chat.ts)
        method: "POST", 
        body: JSON.stringify({ ingredients: ingredientsList, tag: selectedTag }), // Wysyłamy listę składników ORAZ wybrany filtr (tag) do serwera
      });
      const data = await response.json(); 
      if (data.success) {
        setAiRecipe(data.recipe); // Jeśli sukces, zapisujemy przepis
      }
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsLoading(false); // Wyłączamy ładowanie
    }
  }

  return ( // zwracany JSX czyli kod interfejsu, Wszystko, co jest pod tym słowem, zostanie narysowane na ekranie.
    <div style={{ maxWidth: '1200px', margin: '20px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>  

      {/* KONTENER dwukolumnowy*/}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        flexWrap: 'nowrap', 
        gap: '40px', 
        marginTop: '30px',
        alignItems: 'flex-start' //mówi elementom, żeby trzymały się samej góry, zamiast rozciągać się na całą wysokość lub ustawiać na środku.
      }}>

        {/*  LEWA STRONA */}
        <div style={{ flexShrink: 0, minWidth: '300px' }}>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {/*  APARAT */}
            <input  // To jest pole do wybierania zdjęć, ale jest ukryte, bo chcemy używać własnego przycisku z ikonką. Ma kilka ważnych atrybutów:
              type="file" // Mówisz, że to jest pole do wybierania plików
              accept="image/*" // pozwala wybrać tylko zdjęcia
              capture="environment" // na telefonach otwiera od razu aparat
              ref={fileInputRef} // podłączamy ten input do naszego "pilota"
              onChange={handleFileChange}  // Kiedy użytkownik wybierze zdjęcie, ta funkcja jest wywoływana i zajmuje się wysłaniem go do serwera
              style={{ display: 'none' }} // Ukrywamy brzydki systemowy przycisk
            />

            {/* --- PRZYCISK Z IKONKĄ --- */}
            <button 
              type="button" 
              onClick={handleCameraClick}  // Kiedy klikniesz ten przycisk, otworzy się menu wyboru zdjęcia (albo aparat na telefonie)
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {/* Camera: To nazwa konkretnego symbolu,size={28}: To wielkość ikonki w pikselach,  */}
              <Camera size={28} color="#555" /> 
            </button>

            <input  // To jest pole tekstowe, gdzie wpisujesz składnik. Ma kilka ważnych atrybutów:
              type="text" // Mówisz, że to jest pole tekstowe
              placeholder="Wpisz składnik" // To jest tekst, który pokazuje się, gdy pole jest puste, żeby podpowiedzieć użytkownikowi co ma wpisać
              value={ingredient} 
              onChange={(e) => setIngredient(e.target.value)}  // Kiedy użytkownik coś wpisuje, ta funkcja jest wywoływana i aktualizuje stan ingredient, żeby zawsze mieć aktualny tekst z pola
              onKeyDown={(e) => {
                if (e.key === "Enter") { handleAdd(); } // To pozwala dodać składnik do listy, kiedy naciśniesz Enter, zamiast klikać przycisk "Dodaj składnik"
              }}
              style={{ padding: '8px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} 
            />
            
            <button  // To jest przycisk, który dodaje wpisany składnik do listy. Ma kilka ważnych atrybutów:
              onClick={handleAdd} // funkcja handleAdd uruchamiana po kliknięciu przycisku, która dodaje wpisany składnik do listy
              style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Dodaj
            </button> 
          </div>

          <h3 style={{ marginBottom: '10px' }}>Twoje składniki:</h3>
          {ingredientsList.length === 0 && <p style={{ color: '#888' }}>Brak składników. Dodaj coś do listy!</p>} 
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {ingredientsList.map((item, index) => (
              <li key={index} style={{ background: '#f0f0f0', margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {item}
                <button 
                  onClick={() => handleRemove(index)} 
                  style={{ color: '#ff4d4f', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Usuń
                </button>
              </li>
            ))}
          </ul>

<div style={{ marginTop: '20px', marginBottom: '10px' }}> {/* Kontener z marginesami, żeby filtry nie dotykały listy ani przycisku */}
  <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Wybierz styl dania:</p> {/* Tekst informacyjny nad filtrami */}
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}> {/* Układ flex, żeby przyciski stały obok siebie i zawijały się do nowej linii */}
    {availableTags.map((tag) => ( // Pętla generująca przycisk dla każdego tagu z Twojej listy
      <button
        key={tag} // Unikalny identyfikator przycisku dla Reacta
        onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)} // Funkcja: jeśli klikniesz już wybrany tag, to go odznaczy (pusty string), a jak inny, to go wybierze
        style={{
          padding: '6px 12px', // Odstępy wewnątrz przycisku (góra/dół, lewo/prawo)
          borderRadius: '15px', // Mocno zaokrąglone brzegi, żeby wyglądały jak "pigułki"
          border: '1px solid #28a745', // Cienka zielona ramka
          cursor: 'pointer', // Zmiana kursora na rączkę po najechaniu
          // Warunek: jeśli ten tag jest wybrany, dajemy zielone tło i biały napis. Jeśli nie, białe tło i zielony napis:
          backgroundColor: selectedTag === tag ? '#28a745' : 'white', 
          color: selectedTag === tag ? 'white' : '#28a745',
          fontSize: '0.9rem', // Trochę mniejszy tekst, żeby przyciski były zgrabne
          transition: '0.2s' // Płynna zmiana kolorów po kliknięciu
        }}
      >
        {tag} {/* Wyświetlenie nazwy filtra na przycisku */}
      </button>
    ))}
  </div>
</div>

          <button 
            onClick={handleGenerateAI}
            disabled={isLoading}
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

          {/* MIEJSCE NA ZDJĘCIE OD AI */}
          {aiRecipe && (
            <div style={{ marginTop: '20px', border: '2px dashed #ccc', borderRadius: '8px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              Tu pojawi się zdjęcie gotowej potrawy
            </div>
          )}
        </div>
        {/* PRAWA STRONA */}
        {aiRecipe && (
          <div style={{ 
            flex: '1', 
            minWidth: '0', 
            backgroundColor: '#ffffff', 
            padding: '25px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #eaeaea'
          }}>
            {/**/}
            <div style={{ color: '#444', fontSize: '1.1rem' }}>
              {/*To narzędzie, które zamienia brzydki tekst od AI na ładną stronę internetową*/}
              <ReactMarkdown>{aiRecipe}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
