import { NextResponse } from "next/server"; // To jest Twój endpoint API, który będzie odbierał zdjęcie, wysyłał je do OpenAI i zwracał rozpoznane składniki.
import OpenAI from "openai"; //  IMPORTUJESZ BIBLIOTEKĘ OPENAI, która pozwala Ci łatwo komunikować się z API OpenAI. Dzięki temu możesz wysyłać zdjęcia i otrzymywać odpowiedzi od AI bez konieczności ręcznego tworzenia zapytań HTTP.

const openai = new OpenAI({ //  TWORZYSZ INSTANCJĘ KLIENTA OPENAI, czyli coś, co pozwoli Ci rozmawiać z API. Musisz podać swój klucz API, który trzymasz w zmiennych środowiskowych (process.env.OPENAI_API_KEY). Dzięki
  apiKey: process.env.OPENAI_API_KEY, //  PODAJESZ KLUCZ API, który pozwala Ci korzystać z usług OpenAI. Ten klucz jest jak hasło, które mówi OpenAI, że masz prawo korzystać z ich usług. Pamiętaj, żeby nigdy nie udostępniać tego klucza publicznie!
});

export async function POST(req: Request) { //  TWORZYSZ FUNKCJĘ, która będzie obsługiwać żądania POST (czyli te, które wysyłają dane, w tym przypadku zdjęcie). Ta funkcja zostanie wywołana, gdy ktoś wyśle zdjęcie do tego endpointu.
  try { //  ODCZYTANIE ZDJĘCIA Z ŻĄDANIA
    const formData = await req.formData(); //  ODCZYTUJESZ DANE, które zostały wysłane do tego endpointu. Ponieważ wysyłasz zdjęcie jako "FormData", musisz użyć tej metody, żeby je odczytać.
    const file = formData.get("file") as File; //  WYCIĄGASZ Z TEJ "Paczki danych" konkretny plik, który został wysłany. Zakładamy, że ten plik jest pod kluczem "file", bo tak go nazwałeś w komponencie Search.tsx. Teraz masz dostęp do tego pliku jako obiektu File, który możesz dalej przetwarzać.

    if (!file) { //  Jeśli nie ma pliku (użytkownik nie wysłał zdjęcia), to zwróć błąd do klienta.
      return NextResponse.json({ error: "Brak pliku" }, { status: 400 }); //  Zwracasz odpowiedź JSON z informacją o błędzie i ustawiasz status HTTP na 400 (co oznacza "Złe żądanie", czyli coś poszło nie tak z tym, co klient wysłał).
    }

    //  Zamiana pliku na format tekstowy Base64 (AI nie czyta plików bezpośrednio)
    const bytes = await file.arrayBuffer(); //  ODCZYTUJESZ ZAWARTOŚĆ ZDJĘCIA jako tablicę bajtów (arrayBuffer), co jest formatem, który można łatwo przekształcić na Base64.
    const buffer = Buffer.from(bytes); //  TWORZYSZ BUFFER, czyli specjalny obiekt, który pozwala na manipulację danymi binarnymi (takimi jak zdjęcia) w Node.js. Dzięki temu możesz łatwo konwertować te dane na inne formaty.
    const base64Image = buffer.toString("base64"); //  KONWERTUJESZ TE DANE NA STRING W FORMACIE BASE64, który jest tekstową reprezentacją danych binarnych. AI potrafi czytać obrazy, jeśli są one zakodowane w ten sposób, więc musisz to zrobić, zanim wyślesz zdjęcie do OpenAI.

    //  Wysyłka do OpenAI z modelem gpt-4o-mini
    const response = await openai.chat.completions.create({ //  TWORZYSZ ZAPYTANIE DO OPENAI, które mówi AI, co ma zrobić z tym zdjęciem. W tym przypadku mówisz: "Wymień tylko nazwy składników spożywczych widocznych na zdjęciu. Odpowiedz tylko listą słów po przecinku, bez zbędnych zdań." oraz dołączasz zdjęcie w formacie Base64.
      model: "gpt-4o-mini", 
      messages: [ //  TWORZYSZ WIADOMOŚĆ, którą wysyłasz do AI. To jest instrukcja dla AI, co ma zrobić z tym zdjęciem. W tym przypadku mówisz: "Wymień tylko nazwy składników spożywczych widocznych na zdjęciu. Odpowiedz tylko listą słów po przecinku, bez zbędnych zdań." oraz dołączasz zdjęcie w formacie Base64.
        {
          role: "user", //  Określasz, że ta wiadomość pochodzi od użytkownika (czyli od Ciebie, a nie od AI).
          content: [ //  To jest treść wiadomości, którą wysyłasz do AI. Składa się z dwóch części: instrukcji tekstowej i samego zdjęcia.
            { type: "text", text: "Wymień tylko nazwy składników spożywczych widocznych na zdjęciu. Odpowiedz tylko listą słów po przecinku, bez zbędnych zdań." }, //  To jest instrukcja dla AI, która mówi mu, co ma zrobić z tym zdjęciem. Mówisz: "Wymień tylko nazwy składników spożywczych widocznych na zdjęciu. Odpowiedz tylko listą słów po przecinku, bez zbędnych zdań."
            {
              type: "image_url", //  To jest część wiadomości, która zawiera zdjęcie. Mówisz AI: "Oto zdjęcie, które chcę, żebyś przeanalizował. Znajdziesz je pod tym adresem URL." W tym przypadku używasz specjalnego formatu "data:image/jpeg;base64," + base64Image, który pozwala AI odczytać obraz bez konieczności hostowania go gdzieś w internecie.
              image_url: { //  To jest adres URL do zdjęcia, które chcesz, żeby AI przeanalizował. Ponieważ nie masz gdzie hostować tego zdjęcia, używasz formatu "data:image/jpeg;base64," + base64Image, który pozwala AI odczytać obraz bez konieczności hostowania go gdzieś w internecie.
                url: `data:image/jpeg;base64,${base64Image}`, //  Tutaj dołączasz zdjęcie w formacie Base64, mówiąc AI: "Oto zdjęcie, które chcę, żebyś przeanalizował. Znajdziesz je pod tym adresem URL." W tym przypadku używasz specjalnego formatu "data:image/jpeg;base64," + base64Image, który pozwala AI odczytać obraz bez konieczności hostowania go gdzieś w internecie.
              },
            },
          ],
        },
      ],
    });

    const result = response.choices[0].message.content; //  ODCZYTUJESZ ODPOWIEDŹ OD AI, która znajduje się w response.choices[0].message.content. To jest tekst, który AI wygenerowało na podstawie Twojego zdjęcia i instrukcji. W tym przypadku powinno to być coś w stylu "mleko, jajka, mąka", czyli lista składników oddzielonych przecinkami.
    
    //  Zamiana tekstu od AI na tablicę (żeby dodać ją do listy w Search.tsx)
    const ingredients = result ? result.split(",").map(i => i.trim()) : [];

    return NextResponse.json({ ingredients }); //  Zwracasz odpowiedź JSON do klienta, która zawiera rozpoznane składniki w formie tablicy. Teraz w komponencie Search.tsx możesz łatwo dodać te składniki do swojej listy, bo masz je już w formie tablicy.
  } catch (error) { //  Jeśli coś poszło nie tak (np. problem z odczytaniem zdjęcia, problem z API OpenAI, itp.), to złap ten błąd i pokaż go w konsoli, żebyś mógł go zobaczyć podczas testowania.
    console.error("Błąd Vision:", error); //  Jeśli coś poszło nie tak (np. problem z odczytaniem zdjęcia, problem z API OpenAI, itp.), to złap ten błąd i pokaż go w konsoli, żebyś mógł go zobaczyć podczas testowania.
    return NextResponse.json({ error: "Błąd serwera" }, { status: 500 }); //  Zwracasz odpowiedź JSON z informacją o błędzie i ustawiasz status HTTP na 500 (co oznacza "Błąd serwera", czyli coś poszło nie tak po stronie serwera).
  }
}