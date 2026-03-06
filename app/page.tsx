export default function Home() {        // główny komponent strony
  return (
    <main>                             {/* główny kontener strony */}
      <h1>Co masz wwww lodówce</h1>       {/* tytuł strony */}

      <input 
        type="text"                     // pole tekstowe
        placeholder="np. jajka, ser"   // tekst podpowiedzi
      />

      <button>Znajdź przepis</button>   {/* przycisk */}
    </main>
  );
}