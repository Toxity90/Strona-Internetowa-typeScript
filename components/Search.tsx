"use client" // Mówisz Next.js: "Ten plik ma reagować na kliknięcia i wpisywanie tekstu w przeglądarce użytkownika". Bez tego strona byłaby statyczna jak gazeta.
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
const [recipeImageUrl, setRecipeImageUrl] = useState("");  //const mowi komputerowi, że tworzysz stałe narzędzie do obsługi danych, recipeImageUrl: To nazwa Twojej szufladki. Tu będzie przechowywany adres URL (link) do zdjęcia potrawy, które wygeneruje AI. Na początku jest pusta.setRecipeImageUrl: To „pilot”, którym będziesz wkładać link do tej szufladki. Jak tylko AI stworzy zdjęcie, użyjesz tego pilota, żeby strona „zauważyła” zmianę i wyświetliła obrazek.useState: To funkcja z Reacta, która sprawia, że ta szufladka jest „inteligentna” – gdy tylko jej zawartość się zmieni, strona automatycznie się odświeży (przebuduje), żeby pokazać zdjęcie.(""): To oznacza, że na samym początku (gdy wchodzisz na stronę) szufladka jest pusta (pusty tekst), bo żadne zdjęcie nie zostało jeszcze wygenerowane.


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

  async function handleGenerateAI() { //  Funkcja wysyłająca  listę do pliku route.ts
    if (ingredientsList.length === 0) {
      alert("Dodaj składniki!");
      return;
    }
    
    setIsLoading(true); // Włączamy ładowanie
    try {
      const response = await fetch("/api/chat", { // Wysyłamy zapytanie do naszego serwera, który będzie miał endpoint /api/chat (to też musisz stworzyć w folderze /pages/api/chat.ts)
        method: "POST", 
        body: JSON.stringify({ ingredients: ingredientsList }), // Wysyłamy listę składników jako JSON do serwera, który będzie miał endpoint /api/chat (to też musisz stworzyć w folderze /pages/api/chat.ts)
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
    <div style={{ maxWidth: '1300px', margin: '20px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>  {/* Główny kontener strony z maksymalną szerokością i centrowaniem */}

      {/* KONTENER dwukolumnowy*/}
      <div style={{ 
        margin: '0 auto 30px auto',
        maxWidth: '1500px',
      }}>  

        {/*  LEWA STRONA */}
        <div style={{ flexShrink: 0, minWidth: '300px' }}>  {/* Lewa kolumna z formularzem wyszukiwania */}
          
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
          {ingredientsList.length === 0 && <p style={{ color: '#888' }}>Brak składników. Dodaj coś do listy!</p>}  {/*} Wyświetla komunikat, jeśli lista jest pusta */}
          
          <ul style={{ listStyle: 'none', padding: 0 }}>  
            {ingredientsList.map((item, index) => (  // Renderuje każdy składnik jako element listy
              <li key={index} style={{ background: '#f0f0f0', margin: '5px 0', padding: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>  
                {item}  {/* Wyświetla nazwę składnika */}
                <button 
        onClick={() => handleRemove(index)} 
        title="Usuń składnik" // Tekst, który pokaże się po najechaniu myszką
        style={{ 
          color: '#ff4d4f', // Czerwony kolor ikonki
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

          <button 
            onClick={handleGenerateAI}
            disabled={isLoading}  // Przycisk generujący przepis, wyłączony podczas ładowania
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
            {isLoading ? "AI generuje przepis..." : "Generuj przepis przez AI"}  {/* Tekst przycisku zmieniający się w zależności od stanu ładowania*/}
          </button>
          </div>

         {/*  KONTENER DLA WYNIKÓW (TYLKO DLA PRZEPISU I ZDJĘCIA) */}
         {/* --- ZMIENIAMY TYLKO TĘ SEKCJĘ PONIŻEJ --- */}
   {/* --- SEKCJA WYNIKÓW: TO TA CZĘŚĆ MA SIĘ ROZJECHAĆ NA BOKI --- */}
      {aiRecipe && (
        <div style={{ 
          display: 'flex',          // display: flex -> TO JEST KLUCZ, stawia elementy obok siebie
          flexDirection: 'row',     // flexDirection: row -> wymusza układ lewo-prawo
          gap: '40px',              // gap -> robi 40px przerwy między kartami
          marginTop: '40px',        // marginTop -> odsuwa sekcję od przycisku
          alignItems: 'flex-start', // alignItems: flex-start -> obie karty zaczynają się równo od góry
          width: '100%',            // width: 100% -> rozciąga całą sekcję na szerokość strony
          justifyContent: 'center'  // Środkuje ten szeroki zestaw na ekranie
        }}>  
          
          {/* LEWA STRONA: PRZEPIS (BARDZO SZEROKI) */}
          <div style={{ 
            flex: '3',              // flex: 3 -> mówi: "zabierz 3 razy więcej miejsca niż zdjęcie". To rozciąga przepis w lewo.
            backgroundColor: '#fff', 
            padding: '40px',        // padding: 40px -> daje dużo oddechu wewnątrz białej karty
            borderRadius: '20px',   // Zaokrąglone rogi
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Cień pod przepisem
            textAlign: 'left',      // Tekst od lewej strony
            minWidth: '0'           // minWidth: 0 -> techniczna sprawa, żeby tekst nie wypychał zdjęcia
          }}>  
            <div style={{ lineHeight: '1.7', fontSize: '18px' }}>  
              {/* ReactMarkdown: renderuje Twój tekst od AI w tej szerokiej karcie */}
              <ReactMarkdown>{aiRecipe}</ReactMarkdown>  
            </div>
          </div>

          {/* PRAWA STRONA: ZDJĘCIE (WĘŻSZE I PRZYKLEJONE) */}
          <div style={{ 
            flex: '1',               // flex: 1 -> zdjęcie zajmuje tylko 1 część miejsca
            minWidth: '350px',       // minWidth: 350px -> pilnuje, żeby zdjęcie nie zrobiło się za małe
            position: 'sticky',      // position: sticky -> zdjęcie "jedzie" za Tobą przy przewijaniu
            top: '20px'              // top: 20px -> zatrzymuje się 20px od góry ekranu
          }}>  
            <div style={{ 
              width: '100%', 
              aspectRatio: '1/1',    // aspectRatio: 1/1 -> wymusza idealny kwadrat
              backgroundColor: '#f0f0f0', 
              borderRadius: '20px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              border: '2px dashed #ccc' 
            }}>
              {recipeImageUrl ? (
                <img src={recipeImageUrl} alt="Danie" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
              ) : (
                <p style={{ color: '#888', textAlign: 'center', padding: '10px' }}>
                  📸 Tu AI wygeneruje zdjęcie potrawy
                </p>
              )}
            </div>
          </div>

        </div>
      )}
</div>
    </div> 
  ); 
} 