"use client" // Mówisz Next.js: "Ten plik ma reagować na kliknięcia i wpisywanie tekstu w przeglądarce użytkownika". Bez tego strona byłaby statyczna jak gazeta.

import { useState } from "react" //Wyciągasz z biblioteki React "pudełko na dane", które pozwoli stronie pamiętać, co wpisał użytkownik.

export default function Search() { //Tworzysz główną funkcję (komponent), która buduje Twój element wyszukiwarki. export pozwala użyć go w innych częściach strony.

  const [ingredient, setIngredient] = useState("") 
 //Tworzysz zmienną ingredient (tu trafia tekst) i funkcję setIngredient (narzędzie do zmiany tego tekstu).
  // useState to „inteligentna szufladka”, która pozwala Reactowi zapamiętać wpisane dane i automatycznie odświeżyć to, co widzisz na ekranie, gdy ich zawartość się zmieni.
  // "" oznacza że początkowo pole jest puste
  const [ingredientsList, setIngredientsList] = useState<string[]>([]) //// Stan dla CAŁEJ LISTY (string[] oznacza tablicę napisów, [] to pusta lista na start)

  const handleAdd = () => { //To jest Twoja własna funkcja. Możesz o niej myśleć jak o "przepisie na akcję". Mówisz komputerowi: "Gdy wywołam handleAdd, wykonaj wszystkie kroki wewnątrz tych nawiasów {}
 if  (ingredient.trim() !== ""){ //Sprawdza czy nie dodajesz "powietrza" (pustego pola)
setIngredientsList([...ingredientsList, ingredient.trim()])
setIngredient("")
 }
  };

  return ( // zwracany JSX czyli kod interfejsu, Wszystko, co jest pod tym słowem, zostanie narysowane na ekranie.

    <div style={{ maxWidth: '400px', margin: '20px auto', fontFamily: 'sans-serif'}}> {/*Zwykły kontener (taki niewidzialny karton), który trzyma wszystko w kupie. To już jest JSX.*/}


<div style={{ display: 'flex', gap: '10px'}}>


      <input //To jest właśnie kod interfejsu (JSX). To, co tu napiszesz, użytkownik zobaczy jako pole do pisania.
        type="text" // typ pola - tekst
        placeholder="Wpisz składnik" // tekst podpowiedzi w polu
        value={ingredient} // wartość pola jest powiązana ze stanem "ingredient"
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
    
    {ingredientsList.map((item, index) => ( // map to metoda, która bierze każdy element z ingredientsList i tworzy z niego coś nowego. W tym przypadku, dla każdego składnika (item) tworzy element listy (li).}
    <li
    key={index} // klucz to specjalna rzecz, która pomaga Reactowi śledzić elementy listy. Tutaj używamy indexu, ale w prawdziwej aplikacji lepiej byłoby mieć unikalne ID dla każdego składnika.
    style={{ background: '#f9f9f9', padding: '10px', marginBottom: '5px', borderRadius: '5px', borderLeft: '5px solid #28a745'}}
    >
      {item} {/* Tu wyświetla się nazwa składnika, np. "Jajka" */}
    </li>
    ))}
    </ul>

    {ingredientsList.length === 0 && <p>Brak składników. Dodaj coś do listy!</p>} {/* To jest warunkowe renderowanie. Jeśli lista jest pusta, pokaż ten tekst. */}
  </div>
  </div>


  )
}