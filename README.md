# Review systém — verze 2

## Co je nového

**Opravená chyba z verze 1:** Dřív měla celá aplikace jednu sdílenou adresu
(`NOTIFY_EMAIL`), na kterou chodily zprávy úplně od všech klientů. Od teď má
**každý klient svůj vlastní e-mail majitele** — nastavíte ho při vytvoření
klienta nebo kdykoliv později v jeho detailu. Tohle je nutná změna, pokud
chcete prodávat víc než jednomu podniku.

**Nové funkce:**
- **Detail klienta** (`/admin/business/[id]`) — úprava všech údajů, graf
  hodnocení za posledních 7 dní, seznam veškeré zpětné vazby s možností
  označit položku jako „vyřešeno“
- **Export do CSV** — stáhnete si veškerou zpětnou vazbu klienta jako
  tabulku (např. pro účetnictví nebo archiv)
- **Kategorie stížností** — zákazník při nízkém hodnocení vybere štítky
  (Dlouhé čekání, Nepříjemný personál, Špatná kvalita...), takže hned vidíte,
  na čem nejvíc záleží
- **Automatické týdenní/měsíční souhrny e-mailem** — přesně funkce, kterou
  jste chtěl prodávat u dražších balíčků. Běží samo na pozadí (Vercel Cron),
  nemusíte nic ručně spouštět
- **QR kód** — vedle NFC karty se teď automaticky vygeneruje i QR kód k
  vytištění (např. na stůl), pro případ, že zákazník nemá NFC telefon
  nebo chcete kartu doplnit
- **Barva podle klienta** — každá firma může mít vlastní barvu na své
  recenzní stránce
- **Dvojjazyčnost CZ/EN** — přepínač jazyka na recenzní stránce
- **Vyhledávání a přehledové statistiky** v adminu (počet klientů, aktivní
  klienti, hodnocení za týden, celkový průměr)
- **Kompletně nový vizuální design** administrace i zákaznické stránky

## Než nahrajete — DŮLEŽITÉ

Tohle je **kompletní přepis** celé aplikace (všechny stránky, API, styly).
Pokud jste si sám něco přidával do souborů, které se jmenují stejně jako ty
v tomto ZIPu (např. jste upravoval `pages/admin/index.js`), **vaše úpravy se
přepíšou**. Pokud jste přidával úplně nové soubory s jinými názvy, ty
zůstanou nedotčené.

**Doporučení:** pokud jste si něco upravoval, otevřete si to nejdřív a
zkopírujte si tu úpravu bokem (do poznámkového bloku), ať ji pak můžete
znovu doplnit.

## Krok za krokem — GitHub Desktop

1. V GitHub Desktopu klikněte na váš repozitář **review-saas** vlevo nahoře,
   pak **Repository → Show in Explorer** (nebo ikonka složky)
2. Otevře se složka s vaším projektem na disku
3. Rozbalte ZIP, který jsem vám poslal, do jiné složky (např. na Plochu)
4. Otevřete tu rozbalenou složku a označte v ní **všechny soubory a
   podsložky** (Ctrl+A)
5. Přetáhněte je do té složky projektu, kterou vám otevřel GitHub Desktop
6. Windows se zeptá „Chcete nahradit tyto soubory?“ — klikněte **Ano,
   nahradit soubory v cílové složce**
7. Přepněte se zpátky do **GitHub Desktop** — v záložce **Changes** uvidíte
   seznam všech změněných/přidaných souborů
8. Dole vlevo napište krátký popis, např. `Verze 2 - nove funkce`
9. Klikněte na **Commit to main**
10. Nahoře klikněte na **Push origin** (odešle změny na GitHub)
11. Vercel automaticky zachytí změnu na GitHubu a **sám znovu nasadí** web
    (během minuty). Nemusíte dělat nic dalšího ve Vercelu.

## Krok za krokem — databáze (Supabase)

Musíte spustit aktualizované schéma, jinak nové sloupce (e-mail klienta,
barva, balíček...) nebudou v databázi existovat:

1. Otevřete `https://supabase.com/dashboard/project/VÁŠ_PROJEKT/sql/new`
2. Otevřete soubor `supabase/schema.sql` z tohoto ZIPu, zkopírujte celý
   obsah
3. Vložte do SQL Editoru a klikněte **Run**
4. Tenhle skript **nic nemaže** — jen doplní chybějící sloupce a tabulky,
   takže je bezpečné ho spustit i nad vaší současnou databází

## Proměnné prostředí (Vercel)

Beze změny oproti verzi 1, jen `NOTIFY_EMAIL` už není potřeba (viz výše —
teď se nastavuje za každého klienta zvlášť). Zkontrolujte prosím, že
zbylých 5 proměnných je ve Vercelu správně vyplněných (viz `.env.example`
v tomto ZIPu).

## Jedna technická poznámka k automatickým souhrnům

Vercel Cron na bezplatném (Hobby) plánu umožňuje spouštění max. jednou
denně — přesně to tenhle systém využívá (kontroluje jednou denně v 7:00,
jestli je pondělí nebo první den v měsíci, a podle toho pošle týdenní/
měsíční souhrn). Nic dalšího nastavovat nemusíte, funguje to automaticky
po nasazení.
