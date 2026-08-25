# ServiceCheck – digitale Werkstattanfrage

> Eine geführte Web-App, die aus einer unsortierten Kundenanfrage eine vollständige und verständliche Werkstattanfrage macht.

## Problem

Werkstätten erhalten häufig unvollständige Anfragen: Fahrzeugdaten fehlen, die Dringlichkeit ist unklar und Terminwünsche werden nur im Freitext genannt. Dadurch entstehen Rückfragen und zusätzlicher Telefonaufwand.

## Lösung

ServiceCheck führt Kundinnen und Kunden in sechs kurzen Schritten durch Fahrzeug, Anliegen, Dringlichkeit, Terminwunsch und Kontaktdaten. Am Ende steht eine überprüfbare, ausdrücklich unverbindliche Zusammenfassung.

## Geplanter Nutzerfluss

`Fahrzeug → Anliegen → Dringlichkeit → Termin → Kontakt → Zusammenfassung`

## MVP-Kernfunktionen

- sechs klar getrennte Formularschritte mit Fortschrittsanzeige
- verständliche Auswahlfelder und Validierung direkt am jeweiligen Schritt
- automatische Speicherung des Entwurfs im Browser
- Zurück- und Weiter-Navigation ohne Datenverlust
- bearbeitbare Zusammenfassung vor dem Absenden
- klare Bestätigungsansicht mit Vorgangsnummer und gewähltem Kontaktweg
- sichtbarer, wegklickbarer Hinweis auf die Demo-Umgebung
- responsive Bedienung auf Desktop und Mobilgeräten

## Tech-Stack

- HTML
- CSS
- JavaScript
- `localStorage` für den lokalen Formularentwurf

## Bewusste Einschränkungen

- keine echte Terminverfügbarkeit
- kein Versand und keine Speicherung auf einem Server
- keine Diagnose oder verbindliche Preiseinschätzung
- ausschließlich fiktive Beispieldaten

## Geplante Systemintegration

ServiceCheck ist der Kundeneingang für den zusammenhängenden Portfolio-Workflow:

`AutoWerk → ServiceCheck → WerkstattFlow`

In der aktuellen Demo-Umgebung bleiben die Daten lokal im Browser. WerkstattFlow übernimmt im nächsten Ausbauschritt dieselbe strukturierte Anfrage in ein geschütztes Werkstatt-Dashboard. Dort kann sie geprüft, priorisiert, einem Termin zugeordnet und später in einen Arbeitsauftrag überführt werden.

Die Übergabe umfasst:

- Fahrzeugart, Hersteller, Modell, Baujahr und Kennzeichen
- Servicebereiche und Problembeschreibung
- Dringlichkeit als Kundeneinschätzung
- unverbindlichen Terminwunsch
- Kontaktdaten und bevorzugten Kontaktweg
- Erstellungszeitpunkt und Bearbeitungsstatus

### Einstieg aus AutoWerk

AutoWerk kann einen Servicebereich und die Rücksprungadresse als URL-Parameter übergeben:

```text
?anliegen=reifen&return=https://example.com/autowerk/
```

Unterstützte Anliegen: `inspektion`, `reifen`, `reparatur`, `diagnose`, `hu` und `sonstiges`. ServiceCheck markiert die passende Kategorie vor, ohne andere gespeicherte Angaben zu überschreiben.

## Portfolio-Deliverables

- öffentliche Live-Demo
- drei finale Screenshots
- kurzes Demo-Video des vollständigen Ablaufs

## Qualitätsprüfung

- vollständiger Durchlauf aller sechs Schritte geprüft
- Zusammenfassung und Abschlussansicht geprüft
- lokale Wiederherstellung der Eingaben geprüft
- mobile Darstellung bei 390 px ohne horizontalen Überlauf geprüft
- keine JavaScript- oder Browserfehler im Testlauf
