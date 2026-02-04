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
- Brukerdata er minimert i tråd med GDPR-prinsipper og lagres kun midlertidig i minne (ingen database)

Se `PRIVACY.md` og `TERMS.md` for mer informasjon.

## Kjøre serveren lokalt

Backend-serveren ligger i mappen `server/`.

For å starte serveren lokalt:

```bash
cd server
npm install
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
