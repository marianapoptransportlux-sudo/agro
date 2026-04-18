# Interviu Soft Elevator - Notite de lucru

## Limba si context

- Discutia continua in romana.
- Scopul este formularea unei solutii bune pentru un soft de tip elevator.
- Accentul principal: operare, stoc, servicii, facturare, raportare, cu contabilitate minima la inceput si posibilitate de extindere ulterioara.

## Viziune generala

- Softul trebuie sa fie in primul rand operational, nu contabil.
- In sistem se tin:
  - intrari
  - iesiri
  - stocuri
  - servicii prestate
  - reguli de calcul
  - raportare
- Contabilitatea completa nu trebuie mutata din start in acest soft.
- Trebuie sa existe posibilitatea de:
  - export in 1C
  - emitere si verificare facturare
  - analiza financiara ulterioara

## Parteneri

- Acelasi partener poate avea mai multe roluri:
  - furnizor
  - client
  - cumparator
  - vanzator
- Elevatorul poate:
  - presta servicii
  - cumpara cereale
  - vinde cereale

## Servicii

### Logica generala

- Serviciile trebuie calculate automat pe baza parametrilor configurati.
- In cazuri particulare, managerul poate ajusta suma sau aplica discount.
- Dupa inchiderea documentului, modificarile sunt permise doar administratorului.

### Tipuri de servicii discutate

- pastrare
- curatare
- uscare

### Formule de calcul

- Pastrare:
  - pe tona pe luna
- Curatare:
  - pe tona
  - cu influenta procentului de murdarie/impuritati
- Uscare:
  - pe tona procesata
  - inmultit cu procentul de umiditate
  - tariful este setat in parametri

## Tarife si reguli comerciale

- Tarifele se seteaza la inceputul zilei sau la inceputul sezonului.
- Daca nu se introduce un tarif nou, ramane activ tariful anterior.
- Tarifele trebuie sa poata fi definite cu prioritate pe:
  - tip de serviciu
  - produs
  - client/furnizor
  - regim fiscal
- Regula fiscala/comerciala:
  - pretul poate fi acelasi
  - dar plata finala difera in functie de TVA, impozit pe venit, retineri etc.
- Este necesara separarea intre:
  - tarif comercial de baza
  - tip de contraparte
  - regim fiscal
  - retineri
  - suma neta de plata

## Discount

- Discountul depinde de cazul concret si de partener.
- Exista un tarif activ standard.
- Managerul sau seful de depozit poate aplica discount punctual.
- Discountul trebuie sa fie reflectat in raportul zilnic.

## Drepturi si roluri

- Administratorul poate seta si modifica tarifele si regulile.
- Managerul sau utilizatorul cu drept de manager poate:
  - aplica discounturi
  - modifica anumite valori operative, in functie de drepturi

## Rapoarte pentru servicii si facturare

- Sunt dorite doua forme de raport:
  - raport scurt
  - raport detaliat

### Raport scurt

- util pentru operare si facturare
- contine:
  - client/furnizor
  - produs
  - servicii
  - suma bruta
  - discount
  - suma finala

### Raport detaliat

- util pentru verificare si control
- poate contine:
  - cantitate
  - luni de pastrare
  - tonaj procesat
  - procent de umiditate
  - procent de murdarie
  - tarif activ
  - discount
  - TVA
  - retineri
  - suma neta/finala

### Perioada de raportare

- pe zi
- pe interval/perioada aleasa

## Facturare si 1C

### Principiu general

- 1C ramane zona de perfectare contabila.
- Softul operational nu trebuie sa fie incarcat de la inceput cu toata logica contabila.
- Factura din 1C are rol informativ si de control in acest soft.

### Asociere cu factura 1C

- In soft se pot introduce:
  - seria facturii
  - numarul facturii
  - data facturii
- Asocierea cu factura din 1C se face manual, prin selectarea pozitiilor nefacturate.
- Trebuie sa existe posibilitatea de:
  - vizualizare pozitii nefacturate
  - selectare manuala
  - marcarea ca facturate
  - anulare/corectare a marcarii

### Nivel de marcaj facturare

- trebuie sa fie flexibil:
  - pe total raport
  - pe fiecare pozitie
  - pe grup de pozitii selectate manual

### Filtre si grupare in rapoarte

- filtre:
  - facturat
  - nefacturat
  - partial facturat
- grupare:
  - dupa client/furnizor
  - dupa produs
  - dupa serviciu

## Stocuri

### Niveluri de evidenta

- stoc global pe produs
- stoc pe produs + proprietar
- stoc pe produs + proprietar + lot/recepție
- urmarire flexibila pe toate nivelurile, in functie de nevoie

### Focus operational

- In principiu intereseaza cantitatea finala reala.
- Evidenta trebuie sa permita atat vedere pe loturi, cat si pe proprietari.

## Loturi, umiditate, impuritati

- La receptia lotului se introduc:
  - cantitatea
  - umiditatea
  - procentul de impuritati/murdarie
- Aceste valori permit evidenta pe:
  - loturi
  - proprietari

## Pierderi, deseuri si ajustari de stoc

### Principiu

- Trebuie separata:
  - impuritatea estimata la receptie
  - cantitatea reala de deseu confirmata ulterior

### Logica propusa

- La receptie se poate estima impuritatea si se calculeaza stocul provizoriu.
- Ulterior, deseul trebuie tratat ca operatie reala, similara cu primirea si eliberarea produsului.
- Deseul se evidentiaza pe baza tichetului de cantar.
- In baza tichetului de cantar se face ajustarea de stoc cu plus sau minus.

### Exemplu discutat

- intrare: 100 tone
- impuritati estimate: 2%
- stoc provizoriu: 98 tone
- daca deseul real este 1.5 tone:
  - stocul real devine 98.5 tone
- daca deseul real este 3 tone:
  - stocul real devine 97 tone

### Evidenta deseului

- doar cantitativ
- nu valoric, cel putin in etapa initiala

## Uscare si rezultate calitative

- Dupa uscare se verifica procentul de umiditate.
- Este util sa se introduca in sistem umiditatea finala ca rezultat al procesului.
- Valorile se introduc manual in etapa initiala.
- Structura trebuie pregatita pentru integrare ulterioara cu echipamente/sistem tehnologic.

### Influenta umiditatii finale

- nu influenteaza calculul serviciului
- influenteaza stocul/cantitatea rezultata
- ajustarea de stoc trebuie sa fie sustinuta de document operational confirmat, nu doar de un camp introdus manual

## Documente si inchidere

### Calcul si modificare

- calcul automat al serviciilor
- posibilitate de modificare manuala a sumei in cazuri particulare
- dupa ce documentul este inchis/finisat, nu se mai poate modifica decat de administrator

### Inchidere de zi

- inchiderea documentelor trebuie sa fie manuala
- la sfarsitul zilei, de exemplu la ora 17:00, sistemul trebuie sa trimita notificare
- documentele neinchise trebuie sa apara intr-o lista/raport de control
- modificarea dupa inchidere sau redeschiderea trebuie sa fie controlata strict

### Redeschidere

- doar administratorul poate redeschide
- motiv obligatoriu
- istoric complet:
  - cine
  - cand
  - de ce
  - ce valori s-au schimbat

## Silozuri / cilindri

- Exista 4 depozite cilindrice legate intr-un sistem comun.
- La nevoie se muta cantitate dintr-un cilindru in altul.
- In fiecare cilindru poate fi produs diferit.

### Transfer intern

- transferul este operatie fizica interna
- se urmareste simplu:
  - produsul
  - cantitatea
  - cilindrul sursa
  - cilindrul destinatie
- nu se urmareste la acest nivel:
  - proprietarul
  - lotul

### Reguli de transfer

- daca produsul este acelasi:
  - cantitatea se cumuleaza automat
- daca produsele sunt diferite:
  - sistemul da avertizare
- nu este necesara blocare, pentru ca softul este de evidenta, nu softul tehnic de functionare a elevatorului

### Evidenta simpla pe cilindru

- produs curent
- cantitate curenta
- capacitate maxima
- spatiu liber
- istoric simplu de miscari:
  - data
  - tip operatie
  - produs
  - cantitate
  - sold dupa miscare

## Intrari si iesiri

### Intrare

- se bazeaza pe receptie si datele lotului

### Iesire

- nu se lucreaza cu cantitate planificata
- se ia in calcul cantitatea real incarcata si cantarita
- in baza cantitatii reale se face iesirea din stoc
- apoi se emite factura/documentul necesar

### Date dorite la iesire

- client/proprietar
- produs
- cantitate reala
- pret de vanzare
- suma

### Motiv pentru client la iesire

- verificare cantitate facturata
- statistica ulterioara

## Vanzare si preturi

- Preturile de vanzare sunt pe:
  - cumparator
  - produs
  - perioada de valabilitate
  - valuta
- Acest lucru este necesar si pentru export.
- La alegerea cumparatorului si a produsului, sistemul trebuie sa poata lua automat pretul activ.

## Export

### Date necesare

- valuta
- pret in valuta
- curs de schimb
- echivalent in lei
- cheltuieli de transport

### Documente vamale

- Va exista un model de fisier/template care va fi atasat ulterior.
- Sistemul trebuie sa poata completa automat acel model cu datele necesare in campurile respective.
- Documentele sunt necesare pentru fiecare masina/cursa.

### Raportare export si administratie

- raport zilnic total
- posibilitate de filtrare pe perioada
- util pentru contabilitate si administratie

## Raportare generala dorita

- situatie cantitativa
- situatie cantitativa si valorica
- situatie:
  - ce s-a platit
  - ce cheltuieli aditionale s-au suportat
  - cu ce suma s-a vandut
- baza pentru analiza financiara ulterioara

## Analiza financiara viitoare

- Se doreste ulterior analiza profitabilitatii.
- Analiza trebuie sa poata fi facuta pe:
  - produs
  - client/partener
  - lot/tranzactie
  - perioada

## Cheltuieli

- Cheltuielile trebuie impartite in:
  - directe
  - indirecte
- Cheltuielile directe:
  - se leaga direct de lot, tranzactie, transport, operatie sau client
- Cheltuielile indirecte:
  - se tin separat
  - ulterior pot fi repartizate dupa produs sau dupa alte reguli de analiza

## Plati si incasari

### Etapa initiala

- Se doreste evidenta simpla a:
  - datei
  - sumei achitate/incasate
- Pe baza acestor date se vor face rapoarte despre:
  - datorii la zi
  - debitori/creante

### Rapoarte dorite

- sumar pe partener
- detaliat pe partener + document

### Restante

- Deocamdata nu se introduce un mecanism complex de termen de plata.
- Dar in raport trebuie sa existe posibilitatea de avertizare pentru pozitiile care au depasit un termen-limita.

## Raspuns-sinteza formulat in discutie

„Eu as vedea solutia in asa fel incat softul sa fie in primul rand operational, nu contabil. In el trebuie sa tinem intrarile, iesirile, stocul, serviciile prestate si regulile de calcul. Serviciile, cum sunt pastrarea, uscarea sau curatarea, trebuie calculate automat pe baza parametrilor setati la inceput de zi sau de sezon: tarif pe produs, pe tip de client, pe regim fiscal si pe particularitati comerciale. De exemplu, pastrarea se calculeaza pe tona pe luna, curatarea pe tona si procent de murdarie, iar uscarea pe tona procesata si procent de umiditate. Daca exista cazuri speciale, managerul trebuie sa poata aplica discount sau corectie manuala.

Raportarea as face-o in doua forme: scurta, pentru operare si facturare, si detaliata, pentru control. In raportul detaliat trebuie sa vad baza de calcul, tariful aplicat, discountul, TVA sau retinerile si suma finala. Pentru 1C nu as muta toata logica contabila in soft, ci as transmite informatia pregatita pentru perfectare. Mai exact, dupa ce in 1C se emite factura, in soft se introduce seria, numarul si data, iar pozitiile se marcheaza manual ca facturate. Astfel putem vedea clar ce este facturat, nefacturat sau partial facturat, fara sa afectam stocurile.

Ca control intern, documentele trebuie sa se calculeze automat, sa se inchida manual la sfarsitul zilei, iar dupa inchidere sa poata fi redeschise doar de administrator, cu motiv obligatoriu si istoric complet al modificarilor. Asta ofera trasabilitate, flexibilitate pentru business si posibilitatea ca ulterior sa extindem solutia si spre analiza financiara.” 
## Decizie acceptata - varianta optimizata

- Varianta optimizata propusa in discutie este acceptata ca baza de lucru.
- Directia ramane: soft operational in primul rand, cu separare clara intre fluxul operational, fluxul tehnologic, actele comerciale si evidenta financiara.

### Reguli optimizate acceptate

- La receptie se separa:
  - cantitatea bruta cantarita
  - cantitatea neta provizorie calculata dupa umiditate si impuritati
  - cantitatea neta finala confirmata dupa procesare
- In sistem, dupa cantarire, lotul intra in evidenta ca stoc brut cu rezultat net provizoriu, iar dupa curatire/uscare se face ajustarea la cantitatea reala.
- Inainte de receptia finala, sistemul trebuie sa permita un calcul preliminar/comercial:
  - estimare suma de plata catre furnizor
  - estimare cost servicii, inclusiv uscare
  - confirmare a conditiilor de catre furnizor
- Fluxul operational de receptie ramane acelasi pentru toti furnizorii; diferentele dintre persoana fizica si persoana juridica se reflecta in:
  - setul de documente
  - modul de plata
- La livrare se separa:
  - iesirea fizica de marfa
  - documentul de livrare
  - factura comerciala
- Scaderea din stoc se face la cantitatea reala cantarita la incarcare, iar facturarea poate fi:
  - pe fiecare masina
  - cumulata pe zi
  - cumulata pe saptamana
  - cumulata pe perioada/contract, dupa regula comerciala agreata
- Lipsurile sau neajunsurile semnalate de cumparator trebuie tratate printr-un proces distinct de reclamatie/ajustare, cu posibilitate de:
  - acceptare sau respingere
  - factura corectata
  - factura cu minus / storno / ajustare pe ultima factura, dupa caz

### Formula de lucru pentru raspunsurile urmatoare

- Pentru fiecare raspuns nou din interviu se pastreaza abordarea:
  - varianta exprimata operational
  - observatii de optimizare, daca este cazul
  - formulare finala, clara si profesionala, potrivita pentru interviu

## Completari acceptate - etapa 1, rapoarte, operare si control

### Raportare

- Raportarea zilnica se imparte in:
  - raport zilnic detaliat pe loturi/cantariri
  - raport zilnic de procesare
  - raport zilnic scurt pentru conducere
- Raportul zilnic detaliat trebuie sa includa:
  - fiecare cantarire
  - furnizorul
  - cantitatea receptionata
  - procentul de impuritati
  - procentul de umiditate
  - cantitatea estimata de pierderi
  - stoc la inceput de zi
  - stoc la sfarsit de zi
  - mentiuni privind achitarea
- La finalul raportului zilnic detaliat trebuie sa existe si o sinteza privind:
  - total intrari
  - total procesat pe zi / din total intrari
- Raportul de procesare trebuie sa arate:
  - ce cantitati au trecut prin curatire / uscare
  - ce deseuri / pierderi au rezultat
  - pentru ce loturi / cantitati s-au facut procesarile
- Raportul scurt pentru conducere trebuie sa includa:
  - stoc in cilindrii elevatorului
  - stoc preventiv / tampon
  - stoc separat in depozit, daca exista
  - stoc total
  - cantitate neprocesata
  - pierderi reale constatate
  - vedere pe fiecare cilindru
  - valoarea totala a stocului
  - total cheltuieli directe
  - total cheltuieli indirecte
  - total datorii catre furnizori
  - total creante / de incasat
  - suma achitata pe perioada
  - suma incasata pe perioada

### Reguli valorice pentru deseuri si pierderi

- Deseurile tehnologice curente:
  - se trateaza in mod normal cantitativ
  - nu se evidentiaza valoric separat
- Daca la finalul produsului / la verificare se constata deseuri sau marfa deteriorata cu valoare economica proprie:
  - se face ajustare distincta
  - ajustarea poate afecta atat cantitatea, cat si valoarea
  - momentul trebuie sa fie vizibil distinct in raport

### Plati si incasari

- Pentru contabil trebuie sa existe un jurnal simplu de loturi / documente, cu reper principal pe partener.
- In jurnal trebuie sa fie vizibil:
  - furnizorul / cumparatorul
  - lotul / documentul
  - cantitatea
  - suma totala
  - suma achitata / incasata
  - soldul ramas
  - starea: neachitat / partial achitat / achitat
- Pentru fiecare pozitie trebuie sa existe actiune rapida de tip:
  - Achitare
  - Incasare
- La introducerea unei plati / incasari se completeaza simplu:
  - suma
  - data
  - tipul platii: numerar / transfer
  - optional observatie
- Lotul nu se considera inchis doar prin achitare; starea de achitare ramane indicator separat.
- Managerul poate introduce incasarea primara atunci cand el se achita direct cu clientul.
- Contabilul verifica, confirma si leaga inregistrarea de documentele corespunzatoare.

### Filtre

- Jurnalele si rapoartele trebuie sa poata fi filtrate cel putin dupa:
  - zi / perioada
  - partener
  - produs
  - stare de achitare
  - tip document
- Unde este relevant, trebuie sa existe si filtre suplimentare dupa:
  - cilindru
  - tip procesare
  - facturat / nefacturat
  - deschis / inchis

### Nomenclatoare si setari

- La partener se pastreaza in MVP:
  - denumire / nume
  - IDNO
  - adresa
  - telefon
  - rol partener: furnizor / cumparator / ambele
  - statut fiscal: persoana fizica / persoana juridica platitor TVA / persoana juridica neplatitor TVA
- Pentru persoana fizica nu este necesara in MVP pastrarea datelor detaliate de buletin.
- La produs se pastreaza in MVP:
  - denumire
  - cod intern
  - unitate de masura
  - norma de umiditate
  - norma de impuritati
  - activ / inactiv
- La cilindru / depozit se pastreaza:
  - denumire / numar
  - tip locatie
  - capacitate maxima
  - categorie implicita de cost: procesat / neprocesat
  - activ / inactiv
- La tipuri de procesare se pastreaza:
  - denumire proces
  - norma de consum
  - regula de calcul
  - activ / inactiv
- Tarifele trebuie definite dupa:
  - serviciu
  - produs
  - optional partener / statut fiscal
  - perioada de valabilitate
  - valoare tarif
  - mod de calcul
- Prioritatea tarifelor:
  - partener + produs + serviciu
  - produs + serviciu
  - serviciu general
- Costurile de resurse:
  - gaz si motorina pot fi urmarite cantitativ, cu intrari, consum si sold
  - energia electrica se trateaza in prima etapa ca cheltuiala indirecta a perioadei
  - repartizarea avansata a cheltuielilor indirecte ramane pentru etapa 2

### Documente si stari

- Documentele principale din sistem:
  - receptie / intrare
  - procesare
  - transfer intern
  - livrare / iesire
  - ajustare de stoc
  - plata
  - incasare
  - reclamatie / neajuns
- Stari minime recomandate pentru documente:
  - proiect
  - confirmat
  - inchis
  - anulat
  - redeschis, unde este necesar

### Etape de implementare

- Etapa 1 - obligatoriu pentru lansare:
  - receptie si cantarire
  - umiditate si impuritati
  - calcul preliminar de plata
  - stoc pe locatii / cilindri
  - procesare
  - livrare
  - plati si incasari simple
  - rapoarte zilnice
  - roluri si drepturi
  - ajustari controlate
  - marfa deteriorata / declasata
  - nomenclatoare de baza
  - notificari de baza
- Etapa 2 - extindere:
  - inventariere cu senzori
  - integrare cu sistem tehnologic / cantar
  - repartizare avansata a cheltuielilor indirecte
  - analiza financiara extinsa
  - contracte ca modul separat
  - export detaliat si sabloane de documente
  - notificari avansate
  - reguli comerciale extinse

## Decizii finale pe obiectiile ramase

- Intrarea in stoc se face la cantarire.
- Sistemul inregistreaza:
  - cantitatea bruta
  - cantitatea neta provizorie dupa umiditate si impuritati estimate
  - cantitatea neta finala dupa procesare / ajustare confirmata
- Iesirea din stoc se face la cantitatea reala cantarita la incarcare, independent de momentul facturarii.
- Deseul tehnologic curent se inregistreaza separat si, in mod normal, doar cantitativ.
- Diferentele constatate la finalul produsului sau la verificare se trateaza prin ajustari distincte de inventar, cu impact cantitativ si, daca este cazul, valoric.
- Lotul se considera inchis doar cand:
  - documentele operative sunt complete
  - cantitatile sunt confirmate
  - nu mai exista situatii deschise
- Starea de achitare ramane indicator separat:
  - neachitat
  - partial achitat
  - achitat
- Deseurile tehnologice curente nu se evidentiaza valoric separat.
- Cazurile speciale constatate la final pot avea tratament valoric distinct, fara a incalca regula generala a costului mediu.
- Pentru etapa 1, raportarea automata si notificarile pot fi facute prin Telegram bot, cu interfata pentru manager si administrator / utilizator de control.
- Aplicatia principala ramane nucleul sistemului.
- Rolul separat de contabil-sef se amana pentru etapa 2.
- In etapa 1, modificarile speciale pot fi facute de administratorul de sistem, dar numai cu:
  - mentiune obligatorie
  - jurnal complet
  - reflectare in raport
- La orice modificare relevanta, ajustare, redeschidere sau corectie, softul trebuie sa ceara obligatoriu mentiune explicativa si sa pastreze automat:
  - utilizatorul
  - data
  - valorile schimbate
  - motivul
