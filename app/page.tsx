"use client"; // To jest dyrektywa, która mówi Next.js, że ten komponent powinien być renderowany po stronie klienta (w przeglądarce), a nie na serwerze. Jest to ważne, ponieważ używamy tutaj stanu (useState) i innych funkcji, które działają tylko po stronie klienta.
import { useState } from "react";
import Search from "@/components/Search"; // 1. IMPORTUJESZ SWÓJ KOMPONENT z pliku search
import ReactMarkdown from 'react-markdown'; // 2. IMPORTUJESZ BIBLIOTEKĘ DO RENDEROWANIA MARKDOWN, jeśli chcesz wyświetlać przepisy w formacie Markdown
export default function Home() { // Tworzysz główną funkcję (komponent) dla swojej strony. export pozwala użyć go w innych częściach strony, ale tu jest to główny komponent, więc będzie wyświetlany jako strona główna.
  const [recipe, setRecipe] = useState(""); // 3. TWORZYSZ STAN, który będzie przechowywał wygenerowany przepis. Na początku jest pusty.
  return ( // To jest JSX, czyli specjalny język, który pozwala Ci pisać kod interfejsu użytkownika w JavaScript. Wszystko, co jest pod tym słowem, zostanie narysowane na ekranie.
    <main className="font-sans text-left p-6"> {/* 4. TWORZYSZ GŁÓWNY KONTEKST STRONY, z klasami CSS dla stylizacji */}
      <h1>Co masz w lodówce  🍎</h1> 

      <Search /> 
      {recipe && (
        <div className="prose prose-slate mt-6 p-4 bg-[#f8f9fa] border-l-[5px] border-[#28a745]">{/* 6. JEŚLI PRZEPIS JEST DOSTĘPNY (recipe jest niepuste), TO WYŚWIETLA sie W DIVIE, z odpowiednimi klasami CSS dla stylizacji */}
        <article className="prose prose-slate max-w-none text-black font-sans"> {/**/} */
          <ReactMarkdown 
          components={{ // 7. USTAWIASZ KOMPONENTY, które będą używane do renderowania różnych elementów Markdown. Tutaj mówisz, że nagłówki (h1, h2, h3) mają być renderowane jako <h2> z określonymi klasami CSS.}}
          p: ({node, ...props}) => <p className="m-0 mb-4 text-left" {...props} />, //
        ul: ({node, ...props}) => <ul className="m-0 mb-4 pl-4 text-left" {...props} />, //
        li: ({node, ...props}) => <li className="m-0 text-left" {...props} />, //
        h1: ({node, ...props}) => <h1 className="m-0 mb-2 text-left text-xl font-bold" {...props} />, //
        h2: ({node, ...props}) => <h2 className="m-0 mb-2 text-left text-lg font-bold" {...props} />, //
        h3: ({node, ...props}) => <h3 className="m-0 mb-2 text-left text-md font-bold" {...props} />, //
          }}
          >
            {recipe} 
          </ReactMarkdown>
          </article>
        </div>
        )}
    </main>
  );
}