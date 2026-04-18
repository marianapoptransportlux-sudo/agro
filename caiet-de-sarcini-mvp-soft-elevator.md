# Caiet de Sarcini MVP - Soft Elevator

## 1. Scop

Scopul sistemului este digitalizarea operarii zilnice a elevatorului printr-un soft operational care sa acopere receptia, cantarirea, controlul calitatii, stocurile, procesarea, livrarile, platile, incasarile si raportarea, fara a inlocui in etapa initiala contabilitatea completa din 1C.

Sistemul trebuie sa permita:
- evidenta clara a fluxului fizic de marfa
- controlul stocurilor pe locatii si cilindri
- evidenta procesarii si a deseurilor
- evidenta platilor si incasarilor simple
- raportare operationala si manageriala
- trasabilitate completa pentru modificari si ajustari
- extindere ulterioara spre integrari si analiza financiara

## 2. Obiective MVP

MVP-ul trebuie sa permita lucru real zilnic in elevator, fara dependenta de sisteme externe obligatorii.

Obiectivele principale:
- inregistrarea receptiei si a cantaririi
- calcul preliminar de plata catre furnizor
- evidenta stocului pe locatii
- evidenta procesarii: curatire, uscare, deseuri
- inregistrarea livrarii si a iesirii din stoc
- evidenta platilor si incasarilor
- rapoarte zilnice
- control pe roluri si jurnal de modificari

## 3. Domeniul MVP

In MVP intra:
- receptie si intrare in stoc
- procesare
- stocuri si locatii
- livrare si iesire din stoc
- plati si incasari
- reclamatii / neajunsuri
- rapoarte
- roluri si drepturi
- nomenclatoare si setari de baza
- notificari de baza prin Telegram bot

Nu intra in MVP:
- integrare directa cu programul cantarului
- integrare cu senzori de inventariere
- contracte ca modul separat
- repartizare avansata a cheltuielilor indirecte
- analiza financiara avansata
- integrare contabila complexa cu 1C

## 4. Utilizatori si roluri

### 4.1. Operator receptie / depozitar

Poate:
- introduce receptia
- introduce cantarirea
- introduce produsul, cantitatea si locatia
- introduce procesarea
- introduce deseul confirmat
- introduce umiditatea finala dupa uscare

Nu poate:
- modifica liber documente inchise
- face ajustari majore de stoc fara drept special

### 4.2. Manager / sef depozit

Poate:
- vedea stocurile
- vedea raportul zilnic
- vedea documentele modificate
- introduce incasarea primara de la client
- valida operational anumite pozitii

Nu poate implicit:
- modifica liber orice operatie istorica fara audit

### 4.3. Contabil

Poate:
- introduce plati si incasari
- introduce facturi ca referinta comerciala
- introduce reclamatii / pierderi semnalate de cumparator
- confirma inregistrarile financiare

Nu poate:
- modifica liber stocul fizic

### 4.4. Administrator de sistem

Poate:
- crea utilizatori
- asigna roluri
- gestiona nomenclatoare si setari
- configura rapoarte si destinatari
- face modificari speciale doar cu audit complet

### 4.5. Utilizator conducere / control

Poate:
- vedea toate rapoartele
- primi raportare automata
- vedea alertele de control in Telegram bot

## 5. Principii de business obligatorii

### 5.1. Intrare in stoc

- Intrarea in stoc se face la cantarire.
- Sistemul inregistreaza:
  - cantitatea bruta
  - cantitatea neta provizorie calculata dupa umiditate si impuritati estimate
  - cantitatea neta finala dupa procesare / ajustare confirmata

### 5.2. Iesire din stoc

- Iesirea din stoc se face la cantitatea reala cantarita la incarcare.
- Factura nu modifica regula fizica de scadere din stoc.

### 5.3. Procesare

- Sistemul tine evidenta doar a datelor reale disponibile operational.
- Nu se modeleaza micro-miscarile tehnologice continue care nu sunt masurate exact.

### 5.4. Deseuri si ajustari

- Deseul tehnologic curent se trateaza in mod normal doar cantitativ.
- Diferentele constatate la final sau la verificare se trateaza prin ajustari distincte.
- Ajustarile pot afecta cantitatea si, daca este cazul, valoarea.

### 5.5. Stoc amestecat

- Dupa intrarea in cilindrul mare, marfa se considera amestecata.
- La iesire se scade din cantitatea totala disponibila.

### 5.6. Cost mediu

- Marfa neprocesata si marfa procesata trebuie sa aiba cost mediu separat.
- Cilindrii pot avea categorie implicita de cost:
  - neprocesat
  - procesat

### 5.7. Audit obligatoriu

- La orice modificare relevanta, ajustare, redeschidere sau corectie:
  - motivul este obligatoriu
  - se salveaza utilizatorul
  - se salveaza data si ora
  - se salveaza valorile vechi si noi

## 6. Module functionale MVP

### 6.1. Modul parteneri

Gestioneaza furnizori si cumparatori.

Date minime:
- denumire / nume
- IDNO
- adresa
- telefon
- rol partener: furnizor / cumparator / ambele
- statut fiscal:
  - persoana fizica
  - persoana juridica platitor TVA
  - persoana juridica neplatitor TVA

### 6.2. Modul produse

Date minime:
- denumire
- cod intern
- unitate de masura
- norma de umiditate
- norma de impuritati
- activ / inactiv

### 6.3. Modul locatii de stoc

Acopera:
- groapa de primire
- cilindri tampon
- cilindri mari
- depozit separat

Date minime:
- denumire / numar
- tip locatie
- capacitate maxima
- categorie implicita de cost
- activ / inactiv

### 6.4. Modul receptie

Functii:
- inregistrare lot / receptie
- asociere cu partener si produs
- introducere date de calitate
- inregistrare cantarire
- calcul cantitate neta provizorie
- selectie locatie initiala
- generare pozitie de plata / achizitie

Date minime:
- data
- partener
- produs
- cantitate cantarita
- umiditate
- impuritati
- locatie
- referinta lot

### 6.5. Modul procesare

Functii:
- inregistrare curatire
- inregistrare uscare
- inregistrare deseu confirmat
- inregistrare umiditate finala
- ajustare la cantitate neta finala

Date minime:
- data
- produs
- sursa / locatie
- tip procesare
- referinta lot / cantitate procesata
- deseu confirmat
- umiditate finala, daca exista

### 6.6. Modul stocuri

Functii:
- vizualizare stoc pe locatie
- vizualizare stoc pe cilindru
- vizualizare stoc total pe produs
- evidenta miscari interne
- transfer intern intre locatii
- ajustari de stoc controlate

### 6.7. Modul livrari

Functii:
- inregistrare livrare
- selectie cumparator
- selectie produs
- inregistrare cantitate real incarcata
- scadere automata din stoc
- legare la factura / invoice ca referinta comerciala

Date minime:
- data
- cumparator
- produs
- cantitate reala
- pret
- suma
- numar contract, optional
- data contract, optional

### 6.8. Modul plati

Functii:
- jurnal de loturi / documente neachitate
- actiune rapida Achitare
- evidenta plati partiale
- calcul automat sold ramas

Date minime pentru plata:
- partener
- lot / document
- data
- suma
- tip plata: numerar / transfer
- observatie, optional

### 6.9. Modul incasari

Functii:
- jurnal de loturi / documente neincasate
- actiune rapida Incasare
- evidenta incasari partiale
- calcul automat sold ramas

Date minime pentru incasare:
- partener
- lot / document
- data
- suma
- tip plata
- observatie, optional

### 6.10. Modul reclamatii

Functii:
- inregistrare reclamatii de la cumparator
- legare la livrare / factura
- urmarire status
- aplicare rezultat comercial

Date minime:
- cumparator
- document / lot / livrare
- data
- cantitate contestata
- motiv
- status
- mod solutionare

### 6.11. Modul rapoarte

Va genera:
- raport zilnic detaliat
- raport zilnic de procesare
- raport scurt pentru conducere
- rapoarte de plati si incasari
- raport de modificari / audit

### 6.12. Modul administrare

Functii:
- utilizatori si roluri
- nomenclatoare
- tarife
- reguli fiscale
- configurare rapoarte automate

## 7. Fluxuri principale

### 7.1. Flux receptie

1. Se face analiza de umiditate si impuritati.
2. Se calculeaza preliminar suma de plata si costurile de procesare.
3. Daca furnizorul accepta, se face cantarirea.
4. Se inregistreaza receptia.
5. Lotul intra in stoc brut cu net provizoriu.
6. Lotul merge in tampon / procesare / depozitare conform fluxului real.

### 7.2. Flux procesare

1. Lotul din tampon merge la curatire.
2. Daca este necesar, merge la uscare.
3. La final se introduce deseul confirmat.
4. Se introduce umiditatea finala, daca exista.
5. Sistemul ajusteaza cantitatea neta finala.

### 7.3. Flux livrare

1. Se selecteaza cumparatorul si produsul.
2. Se incarca masina.
3. Se cantareste cantitatea reala.
4. Sistemul scade automat din stoc.
5. Se asociaza factura / invoice conform regulii comerciale.

### 7.4. Flux plata / incasare

1. Utilizatorul lucreaza din jurnalul de pozitii deschise.
2. Filtreaza dupa partener, perioada, produs sau stare.
3. Introduce plata / incasarea dintr-un formular simplu.
4. Sistemul actualizeaza automat soldul si starea pozitiei.

### 7.5. Flux reclamatie

1. Se inregistreaza reclamatia.
2. Se marcheaza statusul.
3. Se aplica solutionarea:
  - ajustare factura
  - scadere din ultima factura
  - invoice cu minus
4. Pozitia se poate inchide doar dupa inchiderea reclamatiei.

## 8. Nomenclatoare obligatorii pentru MVP

- parteneri
- produse
- locatii de stoc
- tipuri de procesare
- tipuri de plata
- tarife servicii
- reguli fiscale
- motive de ajustare
- tipuri de reclamatii
- roluri si drepturi
- setari de raportare

## 9. Tarife si reguli de calcul

Tarifele trebuie sa permita:
- serviciu
- produs
- partener, optional
- statut fiscal
- perioada de valabilitate
- valoare
- mod de calcul

Prioritate:
1. partener + produs + serviciu
2. produs + serviciu
3. serviciu general

Servicii de baza:
- pastrare
- curatare
- uscare

## 10. Costuri si cheltuieli

### 10.1. Costuri resurse

Gaz si motorina:
- pot fi urmarite cantitativ
- au intrari, consum si sold

Energie electrica:
- se trateaza in MVP ca cheltuiala indirecta a perioadei

### 10.2. Cheltuieli

Cheltuieli directe:
- legate direct de lot, tranzactie sau operatie

Cheltuieli indirecte:
- tinute separat
- fara repartizare avansata in MVP

## 11. Rapoarte obligatorii MVP

### 11.1. Raport zilnic detaliat

Contine:
- fiecare cantarire
- furnizor
- cantitate receptionata
- impuritati
- umiditate
- pierderi estimate
- stoc inceput zi
- stoc sfarsit zi
- mentiuni privind achitarea
- total intrari
- total procesat

### 11.2. Raport zilnic de procesare

Contine:
- cantitati procesate
- tipuri de procesari
- deseuri / pierderi rezultate
- referinta loturilor procesate

### 11.3. Raport scurt conducere

Contine:
- stoc in cilindri
- stoc tampon
- stoc separat in depozit
- stoc total
- cantitate neprocesata
- pierderi reale constatate
- stoc pe fiecare cilindru
- valoare totala stoc
- cheltuieli directe
- cheltuieli indirecte
- datorii totale
- creante totale
- suma achitata
- suma incasata

### 11.4. Raport audit / modificari

Contine:
- utilizator
- data
- document
- campuri modificate
- valori vechi / noi
- motiv

## 12. Filtre obligatorii

Toate jurnalele trebuie sa permita minim:
- zi / perioada
- partener
- produs
- stare
- tip document

Unde este relevant:
- cilindru
- tip procesare
- facturat / nefacturat
- deschis / inchis

## 13. Stari documente

Stari minime:
- proiect
- confirmat
- inchis
- anulat
- redeschis, unde este necesar

Reguli:
- documentele inchise nu se modifica liber
- redeschiderea cere motiv obligatoriu
- orice schimbare se auditeaza

## 14. Telegram bot - MVP

In MVP, Telegram bot-ul va fi folosit pentru manager si administrator / control.

Functii minime:
- raport zilnic scurt
- lista documente neinchise
- lista loturi neachitate / partial achitate
- lista reclamatii deschise
- lista modificari / redeschideri importante

Botul nu inlocuieste aplicatia principala.

## 15. Cerinte nefunctionale

- interfata simpla pentru utilizatori ne-tehnici
- operatii rapide pentru datele primare
- trasabilitate completa pentru modificari
- posibilitate de extindere cu integrari
- separare clara intre operare si control financiar
- acces pe roluri
- date istorice pastrate fara stergere abuziva

## 16. Criterii de acceptanta MVP

MVP-ul este considerat gata pentru folosire cand:
- se poate inregistra complet o receptie
- se poate inregistra procesarea si ajustarea rezultatului
- se poate vedea stocul pe locatii si cilindri
- se poate inregistra o livrare si iesire din stoc
- se pot introduce plati si incasari partiale / totale
- se pot inregistra reclamatii si solutionari
- se pot genera rapoartele zilnice obligatorii
- sistemul cere motiv la modificari relevante
- utilizatorii au acces conform rolului
- managerul / controlul pot vedea raportarea prin Telegram bot

## 17. Backlog etapa 2

- integrare directa cu programul cantarului
- integrare cu senzori pentru inventariere
- integrare cu sistemul tehnologic
- modul separat pentru contracte
- analiza financiara extinsa
- repartizare avansata a cheltuielilor indirecte
- export avansat si sabloane de documente
- automatizari suplimentare si aprobari mobile extinse

## 18. Concluzie de proiectare

MVP-ul trebuie construit ca un sistem operational stabil, simplu si auditat. El trebuie sa rezolve intai fluxul real de lucru din elevator si abia ulterior sa fie extins cu automatizari, integrari si analiza financiara mai complexa.
