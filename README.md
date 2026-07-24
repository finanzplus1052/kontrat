# Finanzplus Austria — Vertragsportal

Ein sicheres Portal zur Einsicht und zum Download von Kreditverträgen.

## 🌟 Funktionen

### Kundenportal
- 🔍 Suche nach Aktennummer
- 🔐 Authentifizierungssiegel-Animation
- 📄 PDF-Vertragsdownload
- 🇩🇪 Vollständig auf Deutsch

### Beraterbereich
- 🔑 Sichere Anmeldung (Passwort: `FP@Admin2026`)
- 📤 Unbegrenzte PDF-Upload-Größe
- 📊 Aktenverwaltung (Hinzufügen/Löschen)
- 💼 Verwaltungskonsole
- 📥📤 **Export/Import-Funktion** - Teilen Sie Akten zwischen verschiedenen Computern

## 🚀 Installation

1. Repository klonen:
```bash
git clone https://github.com/IHR-USERNAME/finanzplus-austria.git
cd finanzplus-austria
```

2. Öffnen Sie `index.html` in Ihrem Browser

Das war's! Keine Abhängigkeiten erforderlich.

## 📁 Projektstruktur

```
finanzplus-austria/
├── index.html          # Hauptseite
├── src/
│   ├── app.js         # JavaScript-Logik
│   └── style.css      # Styling
└── README.md          # Diese Datei
```

## 🔧 Technologien

- **HTML5** - Struktur
- **CSS3** - Styling mit benutzerdefinierten Eigenschaften
- **Vanilla JavaScript** - Keine Frameworks
- **LocalStorage** - Datenspeicherung (Base64-kodierte PDFs)

## 💡 Verwendung

### Für Kunden
1. Öffnen Sie das Portal
2. Geben Sie Ihre Aktennummer ein (z.B.: `DE-2026-1610`)
3. Klicken Sie auf "Weiter"
4. Laden Sie Ihren Vertrag herunter

### Für Berater
1. Klicken Sie auf "Beraterbereich" (unten rechts)
2. Melden Sie sich mit dem Passwort an: `FP@Admin2026`
3. Laden Sie neue Akten hoch
4. Verwalten Sie bestehende Akten

### 📤 Akten mit Kunden teilen (Export/Import)

**Problem**: LocalStorage speichert Daten nur lokal. Kunden auf anderen Computern können Ihre Akten nicht sehen.

**Lösung**: Export/Import-Funktion

#### Als Berater (Daten exportieren):
1. Melden Sie sich im Beraterbereich an
2. Klicken Sie auf **"📤 Daten exportieren"**
3. Eine JSON-Datei wird heruntergeladen (z.B. `finanzplus-akten-2026-07-24.json`)
4. Senden Sie diese Datei an Ihre Kunden (per E-Mail, Cloud, etc.)

#### Als Kunde (Daten importieren):
1. Öffnen Sie das Portal auf Ihrem Computer
2. Klicken Sie auf "Beraterbereich" und melden Sie sich an
3. Klicken Sie auf **"📥 Daten importieren"**
4. Wählen Sie die JSON-Datei aus, die Sie vom Berater erhalten haben
5. Die Akten werden importiert und sind nun verfügbar
6. Melden Sie sich ab und suchen Sie nach Ihrer Aktennummer im Kundenportal

**Hinweis**: Der Import fügt neue Akten hinzu und aktualisiert bestehende. Ihre lokalen Daten werden nicht gelöscht.

## 🔒 Sicherheit

- ⚠️ **Wichtig**: Ändern Sie das Admin-Passwort in `src/app.js` (Zeile 12) vor der Produktionsbereitstellung
- 🛡️ Anti-Brute-Force-Schutz (6 Versuche)
- 🔐 Session-basierte Admin-Authentifizierung

## 📝 Anpassung

### Admin-Passwort ändern
Bearbeiten Sie `src/app.js`, Zeile 12:
```javascript
const CONFIG = {
  ADMIN_PASSWORD : 'IHR_NEUES_PASSWORT',
  // ...
};
```

### Maximale Versuche ändern
Bearbeiten Sie `src/app.js`, Zeile 13:
```javascript
MAX_ATTEMPTS : 6,  // Ändern Sie diese Zahl
```

## 🌐 Browser-Kompatibilität

- ✅ Chrome/Edge (empfohlen)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 📄 Lizenz

Dieses Projekt ist für Finanzplus Austria entwickelt.

## 👨‍💻 Entwicklung

Entwickelt mit ❤️ für Finanzplus Austria

---

**Hinweis**: Dieses System verwendet LocalStorage zur Speicherung von Daten. Die Export/Import-Funktion ermöglicht das Teilen von Akten zwischen verschiedenen Computern. Für Produktionsumgebungen mit vielen Benutzern wird eine serverseitige Lösung (z.B. Firebase, Supabase) empfohlen.