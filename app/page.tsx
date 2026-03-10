import Search from "@/components/Search"; // 1. IMPORTUJESZ SWÓJ KOMPONENT z pliku search

export default function Home() { // Tworzysz główną funkcję (komponent) dla swojej strony. export pozwala użyć go w innych częściach strony, ale tu jest to główny komponent, więc będzie wyświetlany jako strona główna.
  return ( // To jest JSX, czyli specjalny język, który pozwala Ci pisać kod interfejsu użytkownika w JavaScript. Wszystko, co jest pod tym słowem, zostanie narysowane na ekranie.
    <main>
      <h1>Co masz w lodówce  🍎</h1> 

      <Search /> 
      
    </main>
  );
}