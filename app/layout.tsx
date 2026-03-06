import "./globals.css";   // Pobiera instrukcje dotyczące wyglądu (kolory, czcionki) z zewnętrznego pliku CSS      

export default function RootLayout({     // Definiuje "szkielet" całej strony, który będzie stały dla każdej zakładki
  children, // Zmienna-pudełko, która przechowuje aktualną treść strony (np. Twoją wyszukiwarkę)
}: {
  children: React.ReactNode;   // TypeScript sprawdza, czy to, co wkładamy do pudełka "children", jest poprawnym elementem Reacta
}) {
  return (
    //* Najbardziej zewnętrzny tag - informuje, że to strona www i jest po polsku*/
    <html lang="pl">                     
      <body>
        {children}     {/* Tu wstrzykiwana jest treść z pliku page.tsx. To "serce" Twojej strony */}                  
      </body>
    </html>
  );
}
