# Prosjektoversikt – Memory Color Game

## Kort om prosjektet
Memory Color Game er et turbasert 2-spillers memory-spill basert på farger.
Spillerne må gjenta en fargesekvens i riktig rekkefølge. Sekvensen blir lengre
for hver runde. Prosjektet utvikles som et semesterprosjekt i Apputvikling 2.

## Status
- API scaffold er laget og dokumentert
- Testoppsett er satt opp med Bruno
- Brukere er lagt til uten database
- Aktivt samtykke og sletting av konto er implementert
- Privacy Policy og Terms of Service er inkludert

## Mål (MVP)
- Opprette spill via API
- Knytte spill til brukere
- Håndtere turer og trekk i spillet
- Avslutte spill og avgjøre vinner/taper

## Milepæler
### Milepæl 1: API scaffold (ferdig)
- Definere API-endepunkter
- Dokumentere API-et
- Sette opp testing med Bruno

### Milepæl 2: Brukere og samtykke (ferdig)
- Opprette og slette brukere via API
- Kreve aktivt samtykke til ToS og Privacy Policy

### Milepæl 2.5: Klientgrunnlag (ferdig)
- Klient scaffold med index.html, app.mjs og app.css
- Custom web component for brukerhåndtering
- Klienten kommuniserer med API via én sentral fetch-funksjon
- Grunnleggende arkitektur med skille mellom UI, logikk og data

### Milepæl 3: Spillflyt (neste)
- Opprette spill
- Oppdatere spillstatus
- Validere trekk og turer

### Milepæl 4: Videreutvikling (senere)
- Lagring i database
- Autentisering
- Mer avansert spilllogikk

## Arbeidsmetode
- Små commits som viser progresjon
- Fokus på enkel struktur først
- Utvide funksjonalitet gradvis
- Bruke Bruno til testing av API

