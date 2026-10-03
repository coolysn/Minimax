# DODG'EM – 3×3 retromäng tehisaru vastu

Klassikalise Dodg'emi (Dodgem) 3×3 versioon, mis on tehtud puhta HTML-i, CSS-i ja JavaScriptiga. Mängija juhib alati **siniseid** autosid, vastane on tehisaru (CPU) ja juhib **punaseid** autosid. Liides on 1979. aasta arkaadmasina stiilis (CRT-skaneerimisjooned, pikslikunsti autod, piiksuv heli).

Mäng on loodud tehisaru (Claude, tasuta versioon) abiga neljas etapis (viibas). Selles failis on kirjas iga viiba ülesanne, tulemus, ressursikasutus, tegevuste logi ja muljed.

---

## 1. Mängu lõplikud reeglid ja juhtimine

Reeglid pärinevad lehelt <https://gamescrafters.berkeley.edu/games.php?game=dodgem>

- Laud on 3×3, kummalgi mängijal on kaks autot. Alumine vasak nurk on alguses tühi.
- **Sinine** (mängija) alustab vasakust servast ja sõidab **itta**, **põhja** või **lõunasse**, mitte kunagi läände. Laualt saab ta lahkuda ainult ida servast.
- **Punane** (CPU) alustab alumisest servast ja sõidab **põhja**, **läände** või **itta**, mitte kunagi lõunasse. Laualt saab ta lahkuda ainult põhja servast.
- Iga käiguga liigutatakse üht oma autot ühe ruudu võrra tühjale ruudule. Hüppamist ja löömist pole.
- **Võit:** mõlemad omad autod on laualt väljas esimesena.
- **Kaotus:** kui sinu käigu ajal pole sul ühtegi lubatud käiku.
- **Majareegel (lisatud tehisaru poolt viibas 1):** kui sama seis tekib kolm korda, on mäng viik.
- Alguses valid, kes käib esimesena (sina või CPU). Mängija on alati sinine.
- **Raskusastmed:**
  - **Driver:** CPU teeb parima käigu 10 käigust 7 korral ja suvalise lubatud käigu 3 korral (30 % juhuslikke käike). Juhuslik käik võib kogemata ühtida parimaga.
  - **Champ:** CPU teeb alati parima käigu (0 % juhuslikke käike).
- **Juhtimine:** Vajuta autole hiirega. Valitud autot saab liigutada, kas hiireklõpsuga või nooleklahvidega. Nupud: HINT, RESTART, RULES, SOUND, MENU.

---

## 4. Arendusetapid (viibad)

Viibad on tehtud inglise keeles, tulemused on kirjeldatud eesti keeles.

### Viip 1 – mängu loomine

**Viip:**

> Create a 3x3 two player "Dodgem" game. Create a pure HTML, CSS, JS interface, that matches with the retro style of the game. Game description: Dodg'em (or Dodgem) is a classic driving-themed maze game originally released as a 1979 arcade game by Zaccaria and famously ported by Carla Meninsky for the Atari 2600 in 1980.
>
> 1. It has to follow the original game rules, which can be found here: https://gamescrafters.berkeley.edu/games.php?game=dodgem (do not follow this visual design, only the rules of the game)
> 2. Has to be responsive and work for desktops and phones
> 3. It has to be directly startable through index.html
> 4. UX/UI part has to follow the retro style of the game
> 5. The players opponent is AI (no second player option)

**Tulemus:**
- Valmis üks fail `index.html` ilma teekide, fontide ja võrgupäringuteta.
- Reeglid võeti Berkeley lehelt. Sinine liigub itta/põhja/lõunasse ja punane põhja/läände/itta, väljuda saab ainult edasi sõites. Võidab see, kes saab oma autod esimesena laualt välja, ja kaotab see, kellel pole käiku.
- Tehisaru on **täielik lahendaja**: ta analüüsib kõik 1873 saavutatavat seisu ette ja valib selle põhjal parima käigu. Lahendaja kinnitas, et esimesena käija võidab täiusliku mängu korral.
- Raskusastmeid oli kolm (Rookie, Driver, Champ). Rookie ja Driver tegid vahel juhuslikke käike.
- Liides: must CRT-ekraan skaneerimisjoonte ja vinjetiga, pikslikunsti autod, ruudulised väljumisalad, vilkuv START-nupp, piiksuv heli, HINT/RESTART/RULES/SOUND/MENU nupud.
- Kohanduv paigutus (ruudu suurus sõltub ekraani laiusest ja kõrgusest) ning vähendatud liikumine, kui seade seda küsib.
- **Tehisaru lisas ise ühe reegli:** kolm korda korduv seis on viik. Seda ei olnud Berkeley reeglites.
- Reeglite mootor ja lahendaja on Node'is kontrollitud.
- 
### Viip 2 – raskusastmed, kasutaja värv ja failide jagamine

**Viip:**

> Remove Rookie and leave in driver mode, please include how the driver mode difficulty is defined and how many random moves are there as well as for the champ mode. The player always has to be "blue" even if they choose to not start first, the computer will always be red.
> Make 3 separate files of HTML, CSS AND JS from that one index.html file.
> DO not add anymore new rules by yourself or change any layout or rules.
> Name out all the changes you made

**Tulemus:**
- Kolm eraldi faili: `index.html`, `style.css`, `script.js`.
- Rookie eemaldati. Järele jäid Driver ja Champ, vaikimisi Champ.
- Raskusastme all on nüüd kirjeldus: Driver = 70 % parim käik ja 30 % juhuslik, Champ = 0 % juhuslikke käike.
- Mängija on alati sinine, CPU on alati punane. Küsimus "Blue, move first / Red, move second" asendati valikuga **WHO MOVES FIRST**: "YOU (BLUE)" või "CPU (RED)".
- Lahendaja analüüsib nüüd mõlemad algseisud (sinine esimesena ja punane esimesena), nii et CPU ja HINT töötavad ka siis, kui CPU alustab.
- Reeglite tekst uuendati vastavalt.
- Uusi reegleid ega muudatusi paigutuses ei tehtud.

### Viip 3 – reeglite aken, majareegel ja vihje

**Viip:**

> The "How to play" when clicking to open it should start from the top, not from the bottom.
> House rule should be defined like the other rules for better visibility.
> When using hint and showing the best move in white, remove the other option that isn't "the best option" and leave only the white one.
> Restrictions:
> 1. Do not change anything else other than what i told you
> 2. keep using 3 separate files for HTML, JS, CSS
> 3. List out all the changes you made and if you have any suggestions

**Tulemus:**
- Reeglite aken avaneb nüüd ülalt (fookus `GOT IT` nupul on säilinud, aga ilma kerimiseta, ja aken lähtestatakse alati algusesse).
- Majareegel on nüüd tavaline reeglite punkt, "House rule:" rasvases kirjas. Tekst on sama.
- HINT näitab ainult parimat käiku (valge ruut või väljumisala), teised valitud auto käigud peidetakse.
- Kaks lisamuudatust:
  - klõpsata saab ainult esile tõstetud ruute ja väljumisalasid;
  - vihjega auto uuesti puudutamine (valiku tühistamine) lülitab vihje välja, et auto teisi käike saaks siiski valida.
- Tehisaru pakkus ettepanekuid (silt "BEST MOVE", reeglite otsetee mängu lõpus, märge Champ-režiimi kohta). Neid **ei tehtud**.

### Viip 4 – nooleklahvide viga

**Viip:**

> When choosing and clicking on a car and then using arrow keys to move it can move the other car that wasn't selected, if the first car isn't able to move in that direction. Fix that error. Only the currently selected car can be moved with arrow keys.
> Restrictions:
> 1. Only change what i asked you to change. You can write suggestions if you find another bug but do not fix it unless i tell you to. Write everything that you changed

**Tulemus:**
- Viga oli selles, et kui valitud auto ei saanud antud suunas liikuda, sõitis nooleklahviga hoopis teine auto (kui just tema oli ainus, kes sinna suunda sai).
- Muudetud on ainult `script.js`. Nooleklahvid liigutavad **ainult valitud autot**. Kui valitud auto ei saa sinna minna, ei juhtu midagi ja kostub piiks.
- Kui autot pole valitud, ei liigu nooleklahvidega ükski auto. Tuleb teade "SELECT A CAR FIRST". (Varasem otsetee, mis liigutas ainsa sobiva auto, eemaldati, sest nõue oli "ainult valitud auto".)
- Vana teade "MORE THAN ONE CAR CAN GO THAT WAY" eemaldati.
- Tehisaru pakkus kaks ettepanekut (nooleklahvid ja vihje, otsetee tagasi toomine). Neid **ei tehtud**.

---
### Viip 5 – lahendaja asendamine minimax-algoritmiga

Enne seda esitati kaks eestikeelset küsimust ilma koodimuudatuseta: mida tuleks teha, et CPU kasutaks minimaxi, ja kas praegune lahendus on minimaxist parem. Tehisaru ei muutnud sel ajal midagi.

**Viip:**

> Change the algorithm to a minimax algorithm without changing the existing game logic, rules and layout. List out all the changes and the effects of it.

**Tulemus:**
- Muudetud on ainult `script.js`. Mängu loogika, reeglid ja paigutus (`index.html`, `style.css`) jäid samaks.
- Vana lahendaja (tagurpidi analüüs, mis arvutas kõik seisud lehe laadimisel ette) eemaldati.
- Asemele tuli **minimax negamaxi kujul** järgmiste osadega:
  - **alfa-beeta lõikamine**;
  - **iteratiivne süvendamine** (otsib 1, 2, 3… käiku ette ja lõpetab, kui leiab sundvõidu või sundkaotuse, nii et lühim võit leitakse esimesena);
  - **transpositsioonitabel**, mis jätab meelde juba analüüsitud seisud;
  - **lihtne hindamisfunktsioon** otsingu piiril (mitu ruutu on vastasel väljumiseni rohkem minust);
  - **käikude järjestus** (väljumine, siis edasi, siis külgsuunas), et lõikamine töötaks paremini.
- `bestMoves` ja `aiChoose` jäid samade nimedega, seega CPU käik ja HINT-nupp töötavad endiselt. Parimate käikude tulemus salvestatakse iga seisu jaoks.
- Raskusastmed jäid samaks: Driver 30 % juhuslikke käike, Champ 0 %.
- **Mõju:**
  - CPU valib samad parimad käigud nagu vana lahendaja. Ta võidab nii kiiresti kui võimalik ja kaotab nii aeglaselt kui võimalik.
  - Lehe laadimisel ei arvutata enam midagi. Otsing tehakse alles siis, kui CPU või HINT vajab käiku.
  - Otsing on piiratud sügavusega, seega edasi-tagasi külgsuunas sõitmine ei tekita otsingus lõputut tsüklit.
  - Kolm korda korduva seisu viigi reegel jäi mängu loogikasse. Otsing sellest ei tea.
  
## 5. Ressursikasutus ja tehisaru optimeerimised

### Mida tehisaru optimeeris

| Valik | Mõju |
|---|---|
| **Alfa-beeta lõikamine.** | Jätab vahele harud, mis ei saa tulemust muuta, nii et analüüsitavaid seise on vähem. |
| **Iteratiivne süvendamine.** | Otsing lõpeb kohe, kui sundvõit või sundkaotus on leitud. Leiab lühima võidu. |
| **Transpositsioonitabel (`Map`).** | Sama seisu, milleni jõuti eri käikudega, ei analüüsita uuesti. |
| **Käikude järjestus** (väljumine, edasi, külgsuunas). | Parem lõikamine, vähem seise. |
| **Võidu ja kaotuse skoor ei sõltu käigu numbrist** (`adj` ja `unadj`). | Tabelit saab kasutada eri harudes ja CPU võidab ikkagi kiiremini ning kaotab aeglasemalt. |
| **Parimate käikude vahemälu (`bestCache`).** | HINT-i korduv vajutamine ei käivita otsingut uuesti. |
| **Lehe laadimisel ei arvutata enam midagi.** | Töö tehakse alles käigu ajal, mitte enne mängu algust. |
| **Kompaktne seisu kuju** (ruudu numbrid, string `B|R|käija`), CSS `transform` ja `steps()`, `prefers-reduced-motion`, `gameId` ja taimerite tühistamine, ei kasutata teeke. | Samad kui varem (viibad 1–2). |

### Mida mõõdeti ja mida mitte

Mõõdetud (Node'is, tehisaru poolt):
- Uut minimaxi võrreldi vana lahendajaga kõigis **2600 seisus** (2608 seisust need, kus on vähemalt üks lubatud käik). Parimate käikude hulgad olid **kõigis täpselt samad, erinevusi 0**.
- Ühe käigu otsing võttis keskmiselt **3,5 ms** ja halvimal juhul **171 ms**. Mängu esimene käik võttis umbes 130–170 ms.
- Pikim sundliin selles mängus on **21 käiku** (vana lahendaja järgi), sügavuspiir on 40.
- Champ vs Champ lõppes mõlemast algseisust esimesena käija võiduga **19 käiguga**.
- Champ vs juhuslik mängija: Champ võitis **400 mängust 400**, mõlema värviga.
- Transpositsioonitabelis oli pärast esimese käigu otsingut umbes 1300 kirjet.

**Ei mõõdetud:** otsingu aega brauseris ja telefonis, mälukasutust brauseris ja seda, kas otsing võib liidese hetkeks külmutada.

### Piirangud (mida tehisaru ei optimeerinud)

- Otsing jookseb lehe põhilõimes (pole Web Workerit), nii et nõrgemal seadmel võib liides käigu ajal hetkeks kinni jääda.
- Iga uus mäng ehitab laua DOM-i otsast peale.
- Ühtegi profiilimist (nt brauseri *Performance*-tööriist) ei tehtud.

### Märkus algoritmi kohta

CPU kasutab nüüd **minimaxi** (negamaxi kujul). Dodgemis on **tsüklid** (auto saab külgsuunas edasi-tagasi liikuda), seetõttu on otsing piiratud sügavusega ja seisu hinnatakse piiril lihtsa hindamisfunktsiooniga. Varasem tagurpidi analüüs (retrograde analysis) jäi arenduse ajal ainult kontrollmeetodiks: sellega võrreldi, et minimax annab samad vastused.

---

## 6. Tegevuste logi ja muljed

### Ajajoon

1. **Viip 1:** tehisaru luges Berkeley reeglid, valis sinisele ja punasele algasukohad, kirjutas reeglimootori, lahendaja ja liidese ühte faili. Kontrollis Node'is, et lahendaja annab esimesena käijale võidu (1873 seisu, 19 käiku).
2. **Viip 1 (parandus enne esitamist):** reeglite tekstis oli ühes punktis kogemata segane lause ("…wait, it is yours to avoid!"). Tehisaru märkas seda ise ja parandas enne esitamist.
3. **Viip 2:** Rookie eemaldati, raskusastme kirjeldus lisati, valik "mängija värv" asendati valikuga "kes käib esimesena", failid jaotati kolmeks. Lahendaja laiendati mõlemale algseisule ja kontrolliti uuesti Node'is (2608 seisu, kumbki algseis annab 19 käiguga võidu).
4. **Viip 3:** reeglite akna kerimine, majareegel eraldi punktiks, vihje näitab ainult parimat käiku.
5. **Viip 4:** nooleklahvide viga parandatud (ainult valitud auto liigub).
6. **Viip 5:** vana lahendaja asendati minimaxiga. Tehisaru kontrollis tulemust vana lahendaja vastu kõigis 2600 seisus ja jõudis lõpuks 0 erinevuseni.

### Õnnestumised

- Reeglid tulid täpselt Berkeley lehelt ja täielik lahendaja annab CPU-le vääramatu Champ-režiimi.
- Kõik viis viipa täideti etappide kaupa ilma, et varasem töö lagunenuks. Failid jagati kolmeks ilma koodi sisu muutmata.
- Minimaxi õigsust kontrolliti automaatselt vana lahendaja vastu kõigis mängu seisudes, mitte ainult mõne näite peal.
- Mängu loogika, reeglid ja paigutus jäid minimaxile üleminekul samaks.
- Muudatused kirjeldati igal korral nimeliselt ja täpselt.

### Ebaõnnestumised ja puudujäägid

- **Minimaxi esimesed variandid olid valed.** Esimene variant, mis kontrollis korduvaid seise otsingu käigus, andis 691 kuni 871 erinevust vana lahendajaga. Teine variant (ilma sellise kontrollita, aga transpositsioonitabeliga) andis ikkagi 6 erinevust. Viga oli selles, et alfa-beeta aken ei arvestanud skoori muutust "üks käik kaugemal". See parandati funktsiooniga `unadj` ja alles siis tuli 0 erinevust.
- Minimaxi kiirust brauseris ja telefonis ei mõõdetud.
- **Tehisaru lisas viibas 1 omavolilise reegli** (kolm korda korduv seis = viik), kuigi viip ütles "follow the original game rules". Selle kohta tehtud märge oli küll ausalt esitatud, aga reegel jäi sisse.
- **Viibas 1 tekkis reeglitekstis segane lause**, mille tehisaru siiski ise parandas.
- **Nooleklahvide viga (viip 4)** oli olemas juba esimesest versioonist alates ja jäi märkamata kuni sinu teatamiseni. See näitab, et kasutajaliidese sisendit ei olnud testitud.
- **Viip 3 tegi kaks lisamuudatust**, mida sa ei küsinud. Tehisaru ütles seda ette, aga see oli ikkagi vastu piirangule "do not change anything else".
- **Viip 3 vihje jättis augu:** nooleklahvidega sai vihje ajal ikkagi teisi käike teha. Tehisaru märkis selle viibas 4 ettepanekuna.
- Viimase viibaga vahetati kogu algoritmi loogika minimaxi vastu, sest algselt tegi tehisaru teise algoritmiga.

### Muljed

Tehisaru täitis kitsaid, selgelt piiratud viipasid hästi, eriti kui nõuded olid nummerdatud. Kõige nõrgem oli **kontroll**: ta kirjutas loogika, mida sai Node'is kontrollida, aga liidest ei saanud ta ise proovida. Seetõttu leidis vea hoopis kasutaja. Piiravad märkused ("do not change anything else") töötasid suures osas, aga ettevaatlikkus ei olnud täiuslik. Viibas 5 aitas kõige rohkem see, et vana lahendaja jäi kontrollmeetodiks: see tegi minimaxi vead nähtavaks. Soovitus tulevaseks: lisa viipadesse selgesõnaline testimise samm või kasuta brauseri automaattesti.

---

## 7. Teadaolevad piirangud ja ettepanekud

Need on tehisaru ettepanekud ja neid **ei ole teostatud**.

- **Vihje ja nooleklahvid:** vihje ajal saab nooleklahvidega valitud autoga ikkagi teha muid lubatud käike. Võib piirata ainult vihjega käiguga.
- **Nooleklahvide otsetee:** kui autot pole valitud, võiks nooleklahv liigutada ainsa sobiva auto (nagu enne viipa 4).
- **"BEST MOVE" silt** olekureale, kui vihje on aktiivne.
- **"SHOW RULES" otsetee** mängu lõpu ekraanile.
- **Märge menüüsse:** kui CPU alustab Champ-režiimis, võidab ta täiusliku mängu korral, nii et mängija vajab tema viga.
- **Brauseritestid:** liidest tuleks kontrollida telefonis ja arvutis ning vajadusel lisada automaattestid.
- **Minimaxi viimine Web Workerisse** ja otsingu aja mõõtmine telefonis, et liides ei külmuks.
  
## 8. Kasutatud tehisaru

Claude (Anthropic), tasuta versioon. 
