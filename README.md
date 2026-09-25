# Recenzní systém — přesný postup

Systém dělá tři věci: zákazník ohodnotí 1-5 hvězdami na stránce
`/r/nazev-firmy`, 4-5 hvězd ho pošle rovnou na Google recenze, méně než
4 zobrazí formulář na zprávu — a jakmile ji zákazník odešle, přijde vám
o tom hned e-mail. Žádné týdenní souhrny, žádné plánování — jednoduše
zpráva dorazí v okamžiku, kdy ji zákazník napíše.

Postupujte přesně v tomhle pořadí. Každý krok potřebuje ten předchozí.

---

## Krok 1 — Supabase (databáze)
1. Jděte na **supabase.com** → New project. Zvolte region Frankfurt.
2. Počkejte, až se projekt vytvoří (cca minuta).
3. V levém menu klikněte na **SQL Editor** → **New query**.
4. Otevřete v tomhle balíčku soubor `supabase/schema.sql`, zkopírujte
   celý jeho obsah, vložte ho do editoru a klikněte **Run**.
5. Jděte na **Project Settings** (ozubené kolo) → **API**.
6. Zkopírujte si na později dvě hodnoty:
   - **Project URL**
   - **service_role** klíč (je pod "Project API keys" — pozor, je jich
     tam víc, chcete `service_role`, ne `anon`)

## Krok 2 — Resend (odesílání e-mailů)
1. Jděte na **resend.com** → založte účet.
2. V menu **API Keys** → **Create API Key**. Zkopírujte si ho, uvidíte
   ho jen jednou.
3. Nejjednodušší start: v Resendu použijte jejich testovací odesílací
   adresu (mají to popsané po přihlášení, obvykle něco jako
   `onboarding@resend.dev`) — na tu si zatím nastavte
   `RESEND_FROM_EMAIL`. Až budete chtít posílat z vlastní domény, přidáte
   si ji tam později (Domains → Add Domain), to není potřeba hned.

## Krok 3 — kód na GitHub
1. Rozbalte si tenhle .zip soubor na počítači.
2. Na github.com založte nové **privátní** repo (prázdné, bez README).
3. Nahrajte do něj obsah rozbalené složky — nejjednodušší je přes
   GitHub Desktop (github.com/apps/desktop): otevřete appku, "Add
   existing repository", vyberte složku, dejte commit a Push.

## Krok 4 — Vercel (kde appka poběží)
1. Jděte na **vercel.com** → přihlaste se přes GitHub účet.
2. **Add New → Project** → vyberte repo z kroku 3.
3. Než kliknete Deploy, rozbalte **Environment Variables** a vyplňte
   přesně tyhle (hodnoty máte z kroků 1 a 2):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NOTIFY_EMAIL` — váš e-mail (nebo sdílenou schránku), kam mají
     chodit zprávy od zákazníků
   - `ADMIN_PASSWORD` — heslo, kterým se přihlásíte do administrace
     (uživatelské jméno bude vždy `admin`)
4. Klikněte **Deploy**. Za 1-2 minuty dostanete adresu typu
   `https://vas-projekt.vercel.app`.

## Krok 5 — přidat prvního klienta
1. Otevřete `https://vas-projekt.vercel.app/admin` — prohlížeč se
   zeptá na jméno (`admin`) a heslo (co jste dali do `ADMIN_PASSWORD`).
2. Klikněte **+ Nový klient**. Vyplňte:
   - Název firmy
   - Slug (krátký odkaz bez mezer a diakritiky, např. `kavarna-modra`)
   - Odkaz na Google recenze té firmy
   - E-mail majitele (zatím se nikde automaticky nepoužívá, jen se
     uloží pro budoucí použití)
3. Uložit.

## Krok 6 — vyzkoušet, že to celé funguje
1. Otevřete `https://vas-projekt.vercel.app/r/kavarna-modra` (vlastní
   slug klienta).
2. Klikněte na 5 hvězd → mělo by vás to přesměrovat na Google recenze.
3. Vraťte se zpátky, otevřete stránku znovu, tentokrát klikněte na
   2 hvězdy → objeví se textové pole. Napište libovolnou zprávu a
   odešlete.
4. Zkontrolujte e-mail na adrese, kterou jste dali do `NOTIFY_EMAIL` —
   měla by tam do pár vteřin dorazit zpráva s názvem firmy a textem.

Pokud e-mail nedorazí: nejčastější příčina je, že v Resendu ještě
nemáte ověřenou žádnou odesílací adresu — zkontrolujte v Resend
dashboardu záložku **Logs**, tam uvidíte přesně, proč se e-mail
nepodařilo odeslat.

## Krok 7 — NFC karta pro klienta
Na Androidu v Chrome otevřete `/admin/nfc`, vyberte klienta ze
seznamu, přiložte prázdnou NFC kartu k zadní straně telefonu a
klikněte na tlačítko pro zápis. Na iPhonu tohle web spustit nemůže —
tam by bylo potřeba URL zapsat ručně přes appku jako NFC Tools.

---

## Krok 8 — logo, sociální sítě a barva podniku
V databázi teď navíc existují sloupce pro logo, Instagram, Facebook, web
a barvu (accent_color). Pokud jste `schema.sql` spouštěl už dřív (před
touhle změnou), spusťte navíc v Supabase SQL Editoru soubor
`supabase/migration_branding.sql` — jen doplní chybějící sloupce, nic
nesmaže.

V adminu pak u konkrétního klienta (`/admin/nazev-firmy`) klikněte na
"Upravit logo, sociální sítě a barvu" a doplňte:
- odkaz na obrázek loga (musí to být přímý odkaz na obrázek, končící
  např. na `.png` nebo `.jpg` — nejjednodušší je nahrát logo někam jako
  imgur.com a zkopírovat si přímý odkaz)
- odkazy na Instagram / Facebook / web
- barvu v HEX formátu (např. `#E63946`), použije se na hvězdičky a
  tlačítko

Po uložení se to hned projeví na `/r/nazev-firmy`.

## Co v systému záměrně (zatím) není
- Týdenní souhrny pro majitele klientů — řekli jste, že to zatím
  neřešíme, takže tahle appka jen posílá zprávy vám v momentě, kdy
  přijdou. Až budete chtít klientům posílat přehledy, dá se to doplnit.
- Stripe platby — databáze má na to připravený sloupec, napojení
  zatím chybí.
- Přihlášení pro majitele klientů — teď do administrace vidíte jen vy
  dva (chránění heslem).
