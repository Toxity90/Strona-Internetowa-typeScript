export default function Home() {        // główny komponent strony
  return (
    <main>                             {/* główny kontener strony */}
      <h1>Co masz www lodówce</h1> 
      <h2> test</h2>      {/* tytuł strony */}
      <h3> test2 </h3>

      <input 
        type="text"                     // pole tekstowe
        placeholder="np. jajka, ser"   // tekst podpowiedzi
      />

      <button>Znajdź przepis</button>   {/* przycisk */}
    </main>
  );
}