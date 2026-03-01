# Memory Color Game

Memory Color Game er et to-spillers memory-spill basert på farger. Spillet går ut på at spillerne annenhver gang bygger på en fargesekvens som må gjentas i riktig rekkefølge. Spillet utvikles som et full-stack semesterprosjekt.

## Prosjektidé
To spillere spiller mot hverandre i et turbasert memory-spill. Spillet starter med en tom fargesekvens. Når det er en spillers tur, vises hele fargesekvensen én gang. Spilleren må deretter trykke fargene i riktig rekkefølge før én ny farge legges til sekvensen. Den oppdaterte sekvensen sendes videre til den andre spilleren.

Hvis en spiller trykker feil farge eller feil rekkefølge, avsluttes spillet og den andre spilleren vinner.

## Feature Map

### Brukere
- Brukere kan opprette konto og logge inn
- Spill er knyttet til brukerkontoer
- Kun innloggede brukere kan delta i spill

### Spillopprettelse
- En spiller kan opprette et nytt spill
- Et spill kobles til to spillere
- Spillet starter med en tom fargesekvens

### Spillflyt
- Spillet er turbasert
- Når det er en spillers tur, vises hele fargesekvensen én gang
- Spilleren må gjenta sekvensen i riktig rekkefølge
- Hvis sekvensen er riktig, kan spilleren legge til én ny farge
- Den oppdaterte sekvensen lagres og sendes til den andre spilleren

### Spillavslutning
- Spillet avsluttes dersom en spiller trykker feil farge eller rekkefølge
- Vinner og taper bestemmes av server
- Resultatet lagres

### Klient (Frontend)
- Viser fargeknapper spilleren kan trykke på
- Viser hvem sin tur det er
- Viser fargesekvensen automatisk når det er spillerens tur
- Sender brukerens valg til server

### Server (Backend)
- Holder oversikt over spillstatus
- Lagrer og oppdaterer fargesekvens
- Validerer spillerens input
- Bytter tur mellom spillere

### Lagring
- Brukere lagres i database
- Spill lagres med spillere, sekvens og status
- Spill kan fortsette etter refresh av siden

## Teknologi (planlagt)
- Frontend: Web-klient
- Backend: Node.js med Express
- Database: PostgreSQL
- Kommunikasjon via REST-lignende API
- Applikasjonen utvikles som en PWA med grunnleggende offline-støtte

## Status
Prosjektet er i oppstartsfasen. Repository inneholder foreløpig dokumentasjon og grunnoppsett.

## API-oversikt

Dette prosjektet inneholder et REST-lignende API for Memory Color Game.
API-et brukes av klienten til å opprette spill og lagre gjeldende spilltilstand.

API-et er ment å brukes av en klientapplikasjon.

Endepunkter som er planlagt (scaffold):

- Opprette et nytt spill
- Hente spillstatus
- Sende trekk i et spill

API-et er dokumentert og kan testes ved hjelp av Bruno.
Bruno-samlingen ligger i mappen `api-tests/`.

Merk: API-et er foreløpig bare scaffold (planlagt struktur) og er ikke fullt implementert enda.

## Brukere og samtykke

Applikasjonen støtter enkel håndtering av brukere gjennom API-et.

- Brukere opprettes via `POST /users`
- Aktivt samtykke til brukervilkår (Terms of Service) og personvernerklæring (Privacy Policy) er påkrevd ved opprettelse
- Brukere kan trekke tilbake samtykke og slette kontoen sin via `DELETE /users/:id`
- Brukerdata lagres i PostgreSQL i tråd med prinsippet om dataminimering

Se `PRIVACY.md` og `TERMS.md` for mer informasjon.

## Kjøre serveren lokalt

Backend-serveren ligger i mappen `server/`.

For å starte serveren lokalt:

(Første gang)

```bash

cd server
npm install
node src/app.js

```
(Alle andre ganger)

```bash

cd server
node src/app.js

```
## Klient (UI)

Klienten er bygget som et enkelt statisk frontend-grensesnitt servert via Express.
Arkitekturen er delt i tre lag:

- Data: Én felles `api()`-funksjon for all kommunikasjon med backend
- Logikk: `UserService` håndterer brukerrelaterte operasjoner
- UI: Et custom web component (`<user-panel>`) for brukerhåndtering

Klienten bruker kun relative URL-er og har ett sentralt fetch-punkt.

## Prosjektoversikt

En oversikt over prosjektets mål, status og videre plan finnes i  
`docs/PROJECT.md`.

## Klientstruktur (UI/Logic/Data)
Klienten er delt i `ui/`, `logic/` og `data/` for å holde ansvar separat.
All nettverkskommunikasjon går gjennom én funksjon i `client/data/api.mjs`.
Klienten bruker kun relative URL-er (f.eks. `/users/:id`).
Web componentet `user-panel` håndterer oppretting, henting, oppdatering og sletting av brukere.

## Backend-struktur

Backend er delt i tre lag:

- **routes/** – håndterer HTTP (req/res)
- **services/** – inneholder domene-logikk og validering
- **data/** – database-tilgang (PostgreSQL via Render)

Routes er tynne og kaller service-layer for all forretningslogikk.

# Huskeregel – hvordan prosjektet henger sammen (for meg selv)

Prosjektet er delt i klient, server og tester, med tydelige roller.

Overordnet flyt
	1.	Brukeren åpner nettsiden i nettleseren (localhost:3000)
	2.	Serveren sender klient-filene (HTML, CSS, JS)
	3.	Klienten kommuniserer med API-et via fetch
	4.	Serveren håndterer logikk og data i minnet
	5.	Bruno brukes til å teste API-et direkte

## Klient (client/)

Klienten er delt i tre lag for oversikt og enkel videreutvikling:

client/
├─ ui/        → Web Components (UI og brukerinteraksjon)
├─ logic/     → Applikasjonslogikk (hva som skal skje)
├─ data/      → API-klient (én felles fetch-funksjon)

	•	ui/

Inneholder userPanel.mjs, som definerer et custom HTML-element
(<user-panel>). Dette håndterer knapper, input og visning.
	
    •	logic/

Inneholder userService.mjs, som beskriver hva som kan gjøres
(opprette, hente, oppdatere og slette bruker).
	
    •	data/

Inneholder api.mjs, som er den eneste plassen fetch() brukes.
All kommunikasjon med API-et går via denne filen.

## Server (server/)

Serveren er bygget med Express og er også delt i lag:

server/
├─ src/
│  ├─ app.js      → Starter serveren og kobler alt sammen
│  ├─ routes/     → API-endepunkter (users, games)
│  └─ data/       → Database-tilgang (PostgreSQL)

	•	Serveren håndterer både:
	        API-endepunkter (/users, /games)
	        Servering av klient-filer
			Data lagres i PostgreSQL via Render


## API-tester (api-tests/)

Bruno brukes til å teste API-et uavhengig av klienten:
	•	Opprette bruker
	•	Hente bruker
	•	Oppdatere bruker
	•	Slette bruker

Dette gjør det enkelt å verifisere at API-et fungerer korrekt.

## Dokumentasjon

	•	README.md – Kort oversikt og hvordan kjøre prosjektet
	•	docs/PROJECT.md – Milepæler og prosjektstatus
	•	PRIVACY.md og TERMS.md – Samtykke og vilkår

## Database (PostgreSQL – Render)

Prosjektet bruker en eksternt hostet PostgreSQL-database via Render (free tier).

Oppretting av bruker (Client → API → DB) resulterer i en ny rad i databasen.

Data overlever server-restart.