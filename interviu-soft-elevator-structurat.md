# Interviu Soft Elevator - Varianta structurata

## 1. Viziune generala

- Softul este in primul rand operational, nu contabil.
- Sistemul trebuie sa acopere:
  - receptie
  - cantarire
  - calitate
  - stocuri
  - procesare
  - livrare
  - plati si incasari
  - raportare
- 1C ramane zona de perfectare contabila.
- Softul trebuie sa permita extindere ulterioara spre analiza financiara, integrari si automatizari.

## 2. Principii de baza

- Intrarea in stoc se face la cantarire.
- Sistemul tine:
  - cantitate bruta
  - cantitate neta provizorie
  - cantitate neta finala
- Iesirea din stoc se face la cantitatea reala cantarita la incarcare.
- Factura este document comercial si nu inlocuieste miscarea fizica de stoc.
- Marfa transferata in cilindrii mari se considera amestecata.
- Costul trebuie separat intre:
  - marfa neprocesata
  - marfa procesata

## 3. Flux operational - receptie

- La sosire se face analiza de:
  - umiditate
  - impuritati
- Se calculeaza preliminar:
  - suma estimata de plata catre furnizor
  - costurile serviciilor, inclusiv uscare daca este cazul
- Daca furnizorul accepta conditiile, se face cantarirea.
- Dupa cantarire:
  - marfa intra in evidenta ca stoc brut
  - sistemul calculeaza cantitatea neta provizorie
- Apoi lotul este directionat in fluxul tehnologic.

### 3.1. Flux documentar la receptie

- Pentru persoana fizica:
  - se perfecteaza actul de achizitie
  - se perfecteaza contractul de vanzare-cumparare
  - se solicita actele necesare
  - se face achitarea
- Pentru persoana juridica:
  - se asteapta factura furnizorului
  - se pregateste contractul
  - se solicita documentele de provenienta
  - se face achitarea prin transfer

## 4. Flux tehnologic si procesare

- Elevatorul are:
  - 4 cilindri mari a cate 2000 tone
  - 2 cilindri tampon a cate 100 tone
- Cilindrii tampon permit receptia concomitenta a doua tipuri de produse.
- Din tampon exista doua scenarii:
  - produsul merge la curatire si, daca este necesar, la uscare, apoi in cilindru de depozitare
  - produsul merge direct la vanzare, fara procesare
- Curatirea este tratata ca pas tehnologic obligatoriu in fluxul normal.
- Uscarea este pas conditionat de necesitate.

### 4.1. Reguli de evidenta pentru procesare

- Sistemul nu trebuie sa simuleze fiecare miscare interna automata.
- In jurnalul de procesare se introduc doar datele reale disponibile:
  - data
  - produs
  - sursa / locatie
  - tip procesare
  - referinta lot / cantitate procesata
  - deseu confirmat
  - umiditate finala dupa uscare, daca exista
- Operatorul nu trebuie obligat sa introduca valori intermediare care nu sunt masurate real.

### 4.2. Deseuri si pierderi

- Deseul tehnologic curent:
  - se inregistreaza separat
  - se trateaza in mod normal doar cantitativ
  - nu se evidentiaza valoric separat
- Diferentele constatate la finalul produsului sau la verificare:
  - se trateaza ca ajustari distincte de inventar
  - pot afecta cantitatea
  - pot afecta valoarea, daca este cazul

## 5. Stocuri si depozitare

- Evidenta trebuie sa permita:
  - stoc pe locatie
  - stoc pe cilindru
  - stoc pe produs
  - istoric pe lot la intrare
- Dupa intrarea in cilindrul mare, marfa se considera amestecata.
- La iesire se scade din cantitatea totala disponibila.
- Valoric se aplica cost mediu ponderat, separat pe categorii economice.

### 5.1. Categorii economice de cost

- Marfa neprocesata:
  - loturi din tampon care merg direct la vanzare
  - fara costuri suplimentare de procesare
- Marfa procesata:
  - loturi care au trecut prin curatire si/sau uscare
  - includ costuri de procesare
- Cilindrii pot avea categorie implicita de cost:
  - neprocesat
  - procesat

## 6. Livrare si vanzare

- Livrarea se face pe baza contractului si a cumparatorului cunoscut.
- La incarcare:
  - marfa se incarca
  - masina se cantareste
  - sistemul scade cantitatea reala din stoc
- Pentru export:
  - se poate emite invoice pentru fiecare masina
- Pentru piata interna:
  - facturarea poate fi pe masina
  - zilnic
  - saptamanal
  - cumulat pe contract / perioada

### 6.1. Reclamații si neajunsuri

- Cumparatorul poate semnala lipsuri sau neajunsuri.
- In sistem trebuie sa existe proces separat de reclamatie.
- Pentru fiecare reclamatie se inregistreaza:
  - cumparatorul
  - lotul / livrarea / documentul
  - cantitatea contestata
  - motivul
  - data
  - statusul
  - modul de solutionare
- Statusuri recomandate:
  - deschis
  - acceptat
  - respins
  - inchis
- O livrare sau un lot nu se considera complet inchis cat timp exista reclamatie deschisa.

## 7. Plati si incasari

- In sistem trebuie sa existe jurnale simple de plati si incasari.
- Reperul principal trebuie sa fie partenerul.
- In jurnal trebuie sa se vada:
  - partenerul
  - lotul / documentul
  - cantitatea
  - suma totala
  - suma achitata / incasata
  - soldul ramas
  - starea platii
- Stari recomandate:
  - neachitat / neincasat
  - partial achitat / partial incasat
  - achitat / incasat
- Pentru fiecare pozitie trebuie sa existe actiune rapida:
  - Achitare
  - Incasare
- La introducere se completeaza simplu:
  - suma
  - data
  - tip plata: numerar / transfer
  - observatie, optional

### 7.1. Reguli de control

- Managerul poate introduce incasarea primara atunci cand el se achita direct cu clientul.
- Contabilul verifica si confirma inregistrarea financiara.
- Starea de achitare este separata de starea lotului.
- Lotul se inchide doar cand:
  - documentele operative sunt complete
  - cantitatile sunt confirmate
  - nu exista situatii deschise

## 8. Servicii, tarife si calcule

- Servicii de baza:
  - pastrare
  - curatare
  - uscare
- Reguli de calcul:
  - pastrare: pe tona pe luna
  - curatare: pe tona, cu influenta impuritatilor
  - uscare: pe tona procesata si procent de umiditate
- Tarifele trebuie sa poata fi definite dupa:
  - serviciu
  - produs
  - partener, optional
  - statut fiscal
  - perioada
- Prioritatea tarifelor:
  - partener + produs + serviciu
  - produs + serviciu
  - serviciu general
- Managerul poate aplica discount punctual in cazuri speciale.

## 9. Roluri si drepturi

### 9.1. Operator receptie / depozitar

- introduce receptia
- introduce cantarirea
- introduce procesarea
- introduce deseuri
- introduce umiditatea finala dupa uscare

### 9.2. Manager / sef depozit

- vede stocurile
- vede raportul zilnic
- vede documentele modificate
- poate introduce incasarea primara de la client

### 9.3. Contabil

- introduce facturile
- introduce platile si incasarile
- introduce pierderile / neajunsurile venite de la cumparatori
- confirma inregistrarile financiare

### 9.4. Administrator de sistem

- creeaza utilizatori
- atribuie roluri
- configureaza rapoarte
- poate face modificari speciale doar controlat

### 9.5. Utilizator de control / conducere

- are acces la toate rapoartele
- primeste raportare automata

## 10. Control, modificari si audit

- La orice modificare relevanta, ajustare, redeschidere sau corectie, sistemul trebuie sa ceara:
  - mentiune obligatorie
  - utilizator
  - data
  - valorile modificate
  - motivul
- Modificarile trebuie sa fie reflectate in rapoartele de control.
- Dupa inchidere, documentele pot fi modificate doar controlat.

## 11. Documente principale

- receptie / intrare
- procesare
- transfer intern
- livrare / iesire
- ajustare de stoc
- plata
- incasare
- reclamatie / neajuns

### 11.1. Stari minime recomandate

- proiect
- confirmat
- inchis
- anulat
- redeschis, unde este necesar

## 12. Nomenclatoare si setari

### 12.1. Parteneri

- denumire / nume
- IDNO
- adresa
- telefon
- rol partener
- statut fiscal

### 12.2. Produse

- denumire
- cod intern
- unitate de masura
- norma de umiditate
- norma de impuritati
- activ / inactiv

### 12.3. Cilindri / depozite / locatii

- denumire / numar
- tip locatie
- capacitate maxima
- categorie implicita de cost
- activ / inactiv

### 12.4. Tipuri de procesare

- denumire proces
- norma de consum
- regula de calcul
- activ / inactiv

### 12.5. Alte nomenclatoare

- tipuri de plata
- tarife servicii
- motive de ajustare
- tipuri de reclamatii
- roluri si drepturi
- setari de raportare

## 13. Costuri si cheltuieli

- Gazul si motorina:
  - pot fi urmarite cantitativ
  - au intrari, consum si sold
- Energia electrica:
  - in etapa 1 se trateaza ca cheltuiala indirecta a perioadei
- Cheltuielile se separa in:
  - directe
  - indirecte
- Repartizarea avansata a cheltuielilor indirecte ramane pentru etapa 2.

## 14. Raportare

### 14.1. Raport zilnic detaliat

- pe loturi / cantariri
- furnizor
- cantitate receptionata
- impuritati
- umiditate
- pierderi estimate
- stoc la inceput de zi
- stoc la sfarsit de zi
- mentiuni privind achitarea
- sinteza finala cu total intrari si total procesat

### 14.2. Raport zilnic de procesare

- cantitati trecute prin curatire / uscare
- deseuri / pierderi rezultate
- referinta loturilor / cantitatilor procesate

### 14.3. Raport scurt pentru conducere

- stoc in cilindrii elevatorului
- stoc preventiv / tampon
- stoc separat in depozit
- stoc total
- cantitate neprocesata
- pierderi reale constatate
- stoc pe fiecare cilindru
- valoarea totala a stocului
- total cheltuieli directe
- total cheltuieli indirecte
- total datorii catre furnizori
- total creante
- suma achitata pe perioada
- suma incasata pe perioada

## 15. Notificari si acces mobil

- In etapa 1 se poate folosi Telegram bot pentru:
  - raport zilnic scurt
  - documente neinchise
  - loturi neachitate / partial achitate
  - reclamatii deschise
  - modificari / redeschideri importante
- Botul este interfata pentru manager si administrator / utilizator de control.
- Aplicatia principala ramane nucleul sistemului.

## 16. Etape de implementare

### 16.1. Etapa 1 - obligatoriu pentru lansare

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

### 16.2. Etapa 2 - extindere

- integrare directa cu programul cantarului
- inventariere cu senzori
- integrare cu sistem tehnologic
- repartizare avansata a cheltuielilor indirecte
- analiza financiara extinsa
- contracte ca modul separat
- export detaliat si sabloane de documente
- notificari si automatizari avansate

## 17. Concluzie

- Varianta aleasa este un soft operational cu evidenta financiara simpla si controlata.
- Este varianta recomandata pentru lansare:
  - suficient de clara pentru lucru zilnic
  - suficient de simpla pentru implementare
  - suficient de flexibila pentru extindere ulterioara
