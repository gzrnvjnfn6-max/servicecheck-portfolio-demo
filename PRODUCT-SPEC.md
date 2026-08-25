# ServiceCheck – MVP-Spezifikation

## Zielgruppe

Autofahrerinnen und Autofahrer, die ein Werkstattanliegen online vollständig übermitteln möchten, sowie freie Kfz-Werkstätten, die weniger Rückfragen bearbeiten wollen.

## Erfolgsversprechen

„In wenigen Schritten zu einer vollständigen, unverbindlichen Werkstattanfrage.“

## Formularschritte

### 1. Fahrzeug

- Fahrzeugart: Pkw, Transporter, Wohnmobil, Sonstiges
- Hersteller und Modell als abhängige Auswahllisten
- Baujahr als absteigende Auswahlliste
- Kennzeichen

Pflicht für „Weiter“: Fahrzeugart, Hersteller, Modell, Baujahr und Kennzeichen. Diese Angaben ermöglichen später die eindeutige Übergabe an die Auftragsvorbereitung; ServiceCheck selbst erstellt noch keinen verbindlichen Werkstattauftrag.

### 2. Anliegen

- Inspektion oder Wartung
- Reifen und Räder
- Defekt oder Reparatur
- Warnleuchte oder Diagnose
- Hauptuntersuchung
- Sonstiges
- kurze Beschreibung als Freitext

Pflicht für „Weiter“: mindestens eine Kategorie und eine Beschreibung.

### 3. Dringlichkeit

- Fahrzeug ist fahrbereit
- eingeschränkt fahrbereit
- nicht fahrbereit
- sicherheitskritisch oder unsicher

Bei „sicherheitskritisch oder unsicher“ erscheint ein klarer Hinweis, nicht weiterzufahren und im Notfall professionelle Hilfe zu kontaktieren. ServiceCheck stellt keine Diagnose.

### 4. Terminwunsch

- gewünschtes Datum
- bevorzugte Uhrzeit: morgens, mittags, nachmittags, flexibel
- Alternative zulassen: ja/nein

Hinweis: Der Termin wird erst nach persönlicher Bestätigung verbindlich.

### 5. Kontakt

- Vor- und Nachname
- E-Mail-Adresse
- Telefonnummer
- Bestätigung per E-Mail oder SMS

Pflicht: Name sowie mindestens E-Mail oder Telefonnummer.

### 6. Zusammenfassung

- alle Angaben in klaren Abschnitten
- „Ändern“-Sprung zu jedem Schritt
- Kennzeichnung „Unverbindliche Anfrage“
- Abschluss-Button „Anfrage abschließen“
- sichtbare Bestätigungsansicht mit Demo-Vorgangsnummer und ausgewiesenem E-Mail- oder SMS-Kanal, ohne echten Versand

## Zustandsmodell

```text
currentStep: 1–6
vehicle: { type, makeModel, year, plate }
request: { categories[], description }
urgency: { level }
appointment: { date, timeWindow, alternativeAllowed }
contact: { name, email, phone, preferredChannel }
updatedAt: ISO-Zeitstempel
```

Der Entwurf wird unter `servicecheck:draft:v1` in `localStorage` gespeichert. Nach erfolgreicher Demo kann der Nutzer den Entwurf bewusst löschen oder weiter bearbeiten.

## UX-Regeln

- pro Bildschirm genau eine Hauptentscheidung
- sichtbare Labels statt ausschließlich Platzhaltern
- Fehlermeldungen direkt am betroffenen Feld
- Enter darf keine ungewollte endgültige Absendung auslösen
- Fokus wandert nach dem Schrittwechsel zur Überschrift
- Zurück-Navigation verliert keine Daten
- Fortschritt wird als „Schritt X von 6“ und grafisch angezeigt

## Visuelle Richtung

ServiceCheck übernimmt die visuelle Identität der AutoWerk-Website und wirkt wie deren digitales Servicewerkzeug – nicht wie ein unabhängiges Fremdprodukt.

### Verbindliche Designvorgaben

- warmer Papierhintergrund `#e9e5dc` und helle Oberfläche `#f5f2eb`
- fast schwarzer Haupttext `#181715`
- AutoWerk-Signalrot `#e84524` für Aktionen, Fortschritt und aktive Auswahl
- technische Sekundärfarbe `#52636a` für Hinweise und ruhige Flächen
- schmale, kräftige Groteskschrift für Überschriften
- Monospace-Schrift für Schrittzahlen, Labels und Statusangaben
- Serif-Kursivschrift nur als gezielter redaktioneller Akzent
- kantige Karten, feine schwarze Linien und versetzte Schatten statt weicher Standard-App-Karten
- Buttons entsprechen dem AutoWerk-System mit sichtbarer Bewegung bei Hover und Fokus
- Schrittkennzeichnung nach dem Muster `01 / 06`
- Icons als reduzierte Liniengrafiken im vorhandenen Werkstattstil

### Übertragung auf die Web-App

Die Formularfläche bleibt funktional und ruhig: pro Schritt eine klar abgegrenzte Hauptfläche, großzügige Abstände und wenige gleichzeitige Entscheidungen. AutoWerk-Elemente werden gezielt übernommen, ohne die Marketingseite zu kopieren. Header, Fortschritt, Auswahlkarten, Zusammenfassung und Erfolgsmeldung bilden gemeinsam ein konsistentes Produktsystem.

## Abnahmekriterien

- kompletter Ablauf funktioniert ohne Seitenneuladen
- Pflichtfelder blockieren nachvollziehbar den nächsten Schritt
- ein Reload stellt den bisherigen Entwurf wieder her
- Zusammenfassung entspricht sämtlichen Eingaben
- Änderung aus der Zusammenfassung führt zum richtigen Schritt
- Desktopbreite 1440 px und Mobilbreite 390 px sind nutzbar
- Tastaturfokus und Kontraste sind gut sichtbar
- keine Daten verlassen den Browser

## Übergabe an WerkstattFlow

ServiceCheck und WerkstattFlow verwenden später ein gemeinsames Anfrageformat. ServiceCheck erzeugt dabei keinen verbindlichen Auftrag, sondern einen neuen Werkstattvorgang mit dem Ausgangsstatus `Neu`.

```text
id: wird vom Backend erzeugt
source: "servicecheck"
status: "new"
createdAt: ISO-Zeitstempel
vehicle: { type, make, model, year, plate }
request: { categories[], description }
urgency: { level }
appointment: { requestedDate, timeWindow, alternativeAllowed }
customer: { name, email, phone, preferredChannel }
```

WerkstattFlow ergänzt intern unter anderem zuständige Person, Rückrufdatum, bestätigten Termin, Werkstatthinweise und den späteren Auftragsstatus. Diese internen Felder werden nicht im öffentlichen ServiceCheck erfasst.
