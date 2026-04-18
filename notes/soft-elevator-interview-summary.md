# Rezumat discutii - soft evidenta elevator cereale

Data rezumat: 2026-04-14

## Scop curent

Se doreste construirea unui soft de evidenta si operare pentru elevator, nu partea tehnica de automatizare industriala in aceasta etapa.

Capacitatea elevatorului de aproximativ 8.000 tone ramane un parametru de business util pentru:
- stocuri
- rulaj
- rapoarte
- limite operationale

## Problemele actuale

- Evidenta se tine partial in caiet de catre depozitar.
- Datele ajung ulterior la contabil si uneori se pierd pana la introducere.
- Exista 3 roluri implicate: depozitar, sef depozit/manager, contabil.
- Pot aparea diferente deoarece o cantitate nu este introdusa de unul dintre roluri.
- Vanzatorul poate ajunge in contabilitate inainte ca datele din depozit sa fie primite.
- Documentele, plata si receptia fizica nu se intampla mereu in aceeasi zi.
- Administratorul nu primeste rapoarte operative si eficiente in timp util.

## Directia agreata

Un soft unic care:
- preia datele din cantarul electronic
- urmareste receptia fizica, iesirile, stocurile si procesele tehnologice
- permite contabilului sa lucreze online pe datele deja introduse
- permite emiterea documentelor fara dublare de date
- permite export/integrare ulterioara in 1C
- ofera situatie clara la finalul fiecarei zile, chiar daca actele sau platile nu sunt finalizate

## Principii de baza agreate

- Sursa principala pentru cantitate este cantarul electronic.
- Operatiunea fizica trebuie separata de operatiunea contabila si de plata.
- Contabilul nu trebuie sa reintroduca datele operative, ci sa le completeze documentar/comercial/fiscal.
- Trebuie sa existe rapoarte operative zilnice, indiferent daca plata sau documentele sunt finalizate.
- Sistemul trebuie sa fie usor de folosit pentru depozitar.

## Model recomandat de operare

### Nucleu functional initial

Flux minim recomandat:
- Cantar
- Receptie fizica
- Stoc operational

Peste acest nucleu se adauga ulterior:
- documente
- plati
- servicii
- integrare 1C

### Ticket unic

Fiecare operatie porneste dintr-un ticket unic de cantar.

Ticketul leaga:
- numar masina
- sofer
- furnizor/client
- tip operatie
- prima cantarire
- a doua cantarire
- status

Statusuri propuse:
- Deschis
- In asteptare confirmare
- Finalizat
- Necesita corectie
- Corectie in asteptare aprobare

### Rolul numarului masinii

- Numarul masinii este reper de control, nu identificator unic absolut.
- Alerta de masina similara apare doar daca exista deja un ticket neinchis.
- Daca exista ambiguitate, sistemul cere confirmare/de alegere a ticketului corect.

### Vizibilitate pentru seful de depozit / manager

Managerul trebuie sa vada online:
- toate intrarile si iesirile zilei
- operatiunile deschise
- operatiunile finalizate
- alertele si exceptiile

Scop:
- sa poata verifica in aceeasi zi daca o operatie fizic finalizata nu este finalizata si in soft
- sa poata intreba depozitarul imediat, nu a doua zi dupa raport

## Roluri si responsabilitati recomandate

### Depozitar

- Introduce sau confirma operatiunea fizica:
  - primire marfa
  - eliberare marfa
  - lucrari interne
  - date legate de cantar / confirmarea ticketului
- Verifica asocierea corecta dintre cantariri si masina/ticket.
- Introduce date operative si de calitate.
- Nu gestioneaza preturile sau documentele contabile.

### Sef depozit / manager

- Stabileste preturile standard si exceptionale.
- Aproba exceptiile si corectiile.
- Poate inlocui depozitarul la nevoie.
- Achita persoane cu numerar in modelul actual.
- Urmareste online operatiunile si corectiile.

### Contabil

- Nu reintroduce receptia fizica.
- Completeaza partea fiscala/comerciala/documentara:
  - contracte
  - acte de achizitie
  - facturi
  - documente de export
  - plati
  - retineri
- Genereaza rapoarte financiare si export in 1C.
- La final de luna poate introduce costuri suplimentare/analitice.

### Administrator

- Lucreaza cu rapoartele
- Urmareste stocuri, rulaj, bani platiti, datorii, creante, servicii, alerte

## Date obligatorii la receptie

Datele discutate ca fiind importante:
- masa bruta
- masa tara
- masa neta
- umiditate
- procent de impuritati
- persoana de la care se preiau cerealele
- tip contraparte:
  - persoana fizica
  - persoana juridica platitoare de TVA
  - persoana juridica neplatitoare de TVA

Date suplimentare recomandate:
- numar unic receptie / ticket
- data si ora
- numar auto / remorca
- produs / cultura
- locatie initiala / destinatie
- status operatie

Observatie:
- Receptia fizica trebuie separata de tratamentul fiscal/comercial ulterior.
- Aceeasi cantitate poate fi documentata ulterior diferit fara modificarea receptiei fizice.

## Preturi si decontare

### Cerinte si concluzii

- Pretul poate diferi in functie de:
  - tip vanzator
  - impozitare
  - tonaj
  - intelegeri comerciale
- Managerul seteaza pret standard la inceputul zilei.
- Preturile standard pot fi pe:
  - produs
  - tip vanzator
- Daca nu se seteaza pret nou, se poate folosi ultimul pret activ.
- Managerul poate introduce pret preferential / exceptie.
- Depozitarul nu lucreaza cu preturile.

### Separari recomandate

Softul trebuie sa tina separat:
- pret comercial
- suma platita
- retineri
- costul serviciilor
- valoarea stocului

### Valoare stoc

Recomandare agreata:
- valoarea marfii sa fie separata de veniturile/costurile serviciilor
- serviciile sa nu fie amestecate automat in valoarea stocului

Exemplu conceptual agreat:
- valoare marfa
- plata neta catre furnizor
- venit din servicii
- cost servicii
- marja servicii

## Servicii

Posibile servicii discutate:
- recoltare
- uscare
- curatare
- aerisire
- pastrare/stocare
- transport

Pentru servicii trebuie pastrate separat:
- suma retinuta de la furnizor/client
- costul intern / sinecostul
- marja rezultata

## Stocuri - model agreat

S-au analizat 3 variante:
- stoc pe produs
- stoc pe produs + partida
- stoc pe produs + partida + furnizor + cost complet

Varianta aleasa:
- produs + partida

Conditie importanta:
- proiectarea trebuie facuta astfel incat ulterior sa se poata extinde la varianta 3 fara pierdere de istoric

## Partide - model agreat

Varianta aleasa:
- ticket receptie = o masina / o intrare
- partida comerciala = una sau mai multe receptii grupate ulterior

### Grupare pentru furnizori mari

Decizie:
- grupare automata pe zi pentru acelasi furnizor
- posibilitate ulterioara de contopire pe mai multe zile
- rapoarte separate pe furnizor, filtrabile dupa:
  - produs
  - perioada
  - cantitate
  - valoare
  - plati
  - retineri
  - servicii
  - datorii/creante

Regula recomandata:
- gruparea automata pe zi sa fie pe aceeasi combinatie:
  - furnizor
  - produs
  - tip fiscal

## Calitate - model agreat

### Reguli generale

- Norma de impuritati este aceeasi in mod general.
- Norma de umiditate difera pentru fiecare tip de cereala/produs.
- Exceptiile sa poata fi aplicate doar de manager.

### Tipuri de exceptii agreate

- exceptie de pret
- exceptie de calitate
- corectie de cantitate, cu control mai strict si audit

### Umiditate

Clarificare finala importanta:
- la primire se achita cantitatea fara apa

Model recomandat:
- cantitate bruta receptionata
- umiditate masurata
- umiditate standard
- cantitate apa / scadere din umiditate
- cantitate decontata furnizorului
- stoc principal sa intre cu cantitatea fara apa

Apa peste norma trebuie sa apara separat in receptie si rapoarte.

### Impuritati

- La receptie se introduce procentul de impuritati estimat.
- In raportul zilnic apare ca pierdere potentiala.
- Dupa treierare/curatare, depozitarul introduce cantitatea reala de deseuri cantarita efectiv.
- Atunci se face corectia stocului fizic pentru parametrul impuritati.
- Se pastreaza separat:
  - estimarea initiala
  - cantitatea reala de deseuri

## Miscari si pierderi

S-a discutat necesitatea separarii dintre:
- cantitate receptionata
- cantitate decontata/comerciala
- stoc fizic
- pierderi/scazaminte/deseuri

Tipuri de miscari/pierderi recomandate:
- receptie
- livrare
- transfer intern
- uscare
- curatare
- pierdere tehnologica
- reziduu/dezeu
- corectie inventar

Pentru pierderi trebuie sa existe:
- produs
- cantitate
- data
- depozit/celula
- motiv
- comentariu
- utilizator
- aprobare manager, daca depasesc o limita

Observatii importante:
- nu se rescrie receptia initiala
- se adauga operatiuni ulterioare care explica reducerea stocului

### Cazuri specifice discutate

- Deseuri reale dupa treierare pot diferi de impuritatile estimate.
- La golirea celulei pot rezulta deseuri/reziduuri care trebuie inregistrate separat.
- Pentru umiditate, daca plata se face fara apa, stocul principal intra fara apa; uscarea ulterioara va inregistra doar diferente reale suplimentare, daca exista.

## Raport zilnic pentru administrator

Indicatori ceruti:
- cantitatea intrata pe produse
- cantitatea iesita pe produse
- stocul la finele zilei
- indicatorii de mai sus si in bani
- suma cheltuita
- stocul in bani
- cat s-a platit efectiv pentru stoc

Completari recomandate:
- servicii prestate in ziua respectiva
- datorii/creante la sfarsit de zi
- operatiuni nefinalizate
- diferente/corectii

Structura propusa pentru ecranul administratorului:
- Stocuri
- Valoare
- Plati si datorii
- Servicii
- Alerte

## Costuri suplimentare / analiza lunara

S-a discutat oportunitatea ca, la final de luna, contabilul sa introduca costuri aditionale.

Directii propuse:
- servicii aditionale
- costuri fixe:
  - salarii
  - impozite
- costuri variabile:
  - transport
  - gaz
  - energie
  - alte cheltuieli operationale

Acestea trebuie tratate ca modul separat de costuri si analiza, nu ca parte din operarea zilnica a depozitarului.

Separari recomandate:
- costuri directe pe operatiune
- costuri indirecte / fixe
- costuri variabile generale

## Interfata pentru depozitar

Cerinta esentiala:
- foarte usor de folosit
- sa reduca timpul de operare
- sa reduca omisiunile de introducere a datelor

Structura de ecran recomandata pentru depozitar:
- Masini in curs
- Masini finalizate azi
- Alerte

## Punctul la care s-a oprit discutia

Ultima intrebare deschisa:
- Vrei ca normele de umiditate si impuritati sa fie setate separat pentru fiecare produs?

Raspuns implicit rezultat din discutie:
- da, regulile de calcul sa fie fixe pe produs
- exceptiile sa poata fi aplicate de manager

## Observatie pentru continuare

La urmatoarea discutie se poate continua din acest punct, apoi se poate trece la:
- definirea exacta a modulelor MVP
- structura bazei de date
- fluxuri de ecran pentru depozitar, manager, contabil, administrator
- rapoarte principale
- reguli de aprobare si audit




## Decizii tehnice recente

- Directia tehnica recomandata este web app responsive, utilizabil din desktop, telefon si tableta.
- Este necesar suport offline-first pentru operatiile critice, cu sincronizare automata si vizibila.
- Sistemul trebuie sa afiseze status de sincronizare pentru operatii/documente.
- Numerotarea offline trebuie sa permita numar provizoriu urmat de numar final dupa sincronizare.
- Pentru relatia cu 1C este nevoie de model flexibil: integrare directa si export, in functie de caz.
- Ecranul de pregatire pentru 1C trebuie controlat doar de contabil.
