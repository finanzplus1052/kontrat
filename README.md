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

**Hinweis**: Dieses System verwendet LocalStorage zur Speicherung von Daten. Für Produktionsumgebungen wird eine serverseitige Lösung empfohlen.