# 🎰 SlotMachine Game

Ein retro-inspiriertes Slot Machine Spiel mit täglichen kostenlosen Spins, Powerups und strategischen Einsatzmöglichkeiten.

![Game Screenshot](https://github.com/user-attachments/assets/88e48472-6fbf-4e44-81b1-194d3efd334f)

## 📖 Inhaltsverzeichnis

- [🚀 Schnellstart](#-schnellstart)
- [🎮 Spielanleitung](#-spielanleitung)
- [💎 Symbol-Werte und Kombinationen](#-symbol-werte-und-kombinationen)
- [⚡ Powerup-System](#-powerup-system)
- [💰 Einsatz-Multiplikatoren](#-einsatz-multiplikatoren)
- [🔄 Auto-Spin](#-auto-spin)
- [🆓 Tägliche Free Spins](#-tägliche-free-spins)
- [🎯 Langzeit-Engagement Konzept](#-langzeit-engagement-konzept)
- [🛠️ Technische Details](#️-technische-details)
- [📋 Entwicklungs-Roadmap](#-entwicklungs-roadmap)

## 🚀 Schnellstart

1. **Spiel öffnen**: Öffne die `index.html` Datei in deinem Browser
2. **Erste Schritte**: Du startest mit 10 Coins und einem FREE SPIN
3. **Spinnen**: Klicke auf "FREE SPIN" oder "SPIN" um das Spiel zu starten
4. **Gewinnen**: Sammle identische Symbole in Linien, um Coins zu gewinnen

## 🎮 Spielanleitung

### Grundlegendes Gameplay

Das SlotMachine Spiel funktioniert mit einem **5x3 Raster** (5 Walzen, 3 Reihen). Ziel ist es, identische Symbole in verschiedenen Gewinnlinien zu sammeln.

### Spielmechaniken

- **Coins**: Deine Hauptwährung für Spins und Powerups
- **Spin-Kosten**: 1 Coin pro Spin (kann mit Einsatz-Multiplikatoren erhöht werden)
- **Gewinnlinien**: Horizontal, vertikal und diagonal
- **Powerups**: Temporäre Boni für bessere Gewinnchancen

### Steuerung

- **SPIN**: Startet eine einzelne Runde
- **AUTO SPIN**: Automatisches kontinuierliches Spielen
- **FREE SPIN**: Kostenloser täglicher Spin (grün markiert)

## 💎 Symbol-Werte und Kombinationen

### Symbol-Hierarchie (von wertvoll zu häufig)

| Symbol | Wert | Häufigkeit | Auszahlung (3er Kombo) |
|--------|------|------------|------------------------|
| 7️⃣ **Sieben** | 10x | Sehr selten | 10x Einsatz |
| 🔔 **Glocke** | 8x | Selten | 8x Einsatz |
| 🍒 **Kirsche** | 6x | Selten | 6x Einsatz |
| 🍋 **Zitrone** | 5x | Mittel | 5x Einsatz |
| 🍊 **Orange** | 4x | Mittel | 4x Einsatz |
| 🍇 **Traube** | 3x | Häufig | 3x Einsatz |
| 🍉 **Wassermelone** | 2x | Sehr häufig | 2x Einsatz |

### Gewinnkombinationen

#### Horizontale Linien
- **3+ identische Symbole** in einer Reihe
- **Multiplikator**: (Anzahl Symbole - 2) × Symbol-Wert × Einsatz

#### Vertikale Linien
- **3 identische Symbole** in einer Spalte
- **Multiplikator**: 1x × Symbol-Wert × Einsatz

#### Diagonale Linien
- **Hauptdiagonale**: Links-oben → Rechts-unten
- **Anti-Diagonale**: Rechts-oben → Links-unten
- **Multiplikator**: 1.5x × Symbol-Wert × Einsatz

#### X-Formation (Jackpot!)
- **Beide Diagonalen** gleichzeitig mit identischen Symbolen
- **Multiplikator**: 3x × Symbol-Wert × Einsatz

## ⚡ Powerup-System

### Verfügbare Powerups

#### 💰 Double Money (5 Coins)
- **Effekt**: Verdoppelt alle Gewinne
- **Dauer**: 3 Spins
- **Strategie**: Nutze es mit hohen Einsätzen für maximalen Profit

#### 🍀 Lucky 7s (10 Coins)
- **Effekt**: 3x höhere Chance auf seltene Symbole (7, Glocke, Kirsche)
- **Dauer**: 5 Spins
- **Strategie**: Ideal für Jackpot-Jagd

#### 🔒 Symbol Lock (15 Coins)
- **Effekt**: Sperre 2 Walzen für den nächsten Spin
- **Dauer**: 1 Spin
- **Strategie**: Verwende es bei vielversprechenden Kombinationen

### Powerup-Strategien

1. **Kombiniere Powerups**: Double Money + Lucky 7s = Maximaler Gewinn
2. **Timing**: Nutze Symbol Lock bei 2/3 einer guten Kombination
3. **Einsatz-Optimierung**: Höhere Einsätze während aktiver Powerups

## 💰 Einsatz-Multiplikatoren

### Verfügbare Multiplikatoren

| Multiplikator | Kosten pro Spin | Potenzielle Gewinne |
|---------------|-----------------|-------------------|
| **1x** | 1 Coin | Basis-Gewinne |
| **2x** | 2 Coins | 2x Gewinne |
| **5x** | 5 Coins | 5x Gewinne |
| **10x** | 10 Coins | 10x Gewinne |
| **25x** | 25 Coins | 25x Gewinne |

### Risiko-Management

- **Niedrige Einsätze**: Sicheres Spiel, langsamerer Fortschritt
- **Hohe Einsätze**: Hohes Risiko, schnelle Gewinne möglich
- **Empfehlung**: Steigere Einsätze graduell mit wachsendem Coin-Bestand

## 🔄 Auto-Spin

### Funktionsweise

- **Automatisches Spielen**: Kontinuierliche Spins ohne manuelle Klicks
- **Stopp-Bedingungen**: 
  - Nicht genügend Coins
  - Manuelle Deaktivierung
  - Symbol Lock Powerup (erfordert manuelle Auswahl)

### Strategische Nutzung

- **Passive Coin-Generierung**: Lass das Spiel für dich laufen
- **Powerup-Timing**: Aktiviere profitable Powerups vor Auto-Spin
- **Überwachung**: Behalte dein Coin-Level im Auge

## 🆓 Tägliche Free Spins

### Mechanismus

- **Häufigkeit**: Ein kostenloser Spin pro Tag (24-Stunden-Zyklus)
- **Reset-Zeit**: Mitternacht (Ortszeit)
- **Anzeige**: Grüner "FREE SPIN" Button mit Animation
- **Countdown**: Timer zeigt verbleibende Zeit bis zum nächsten Free Spin

### Maximierung

- **Tägliche Routine**: Logge dich täglich ein für den Free Spin
- **Powerup-Kombination**: Nutze Powerups mit dem Free Spin
- **Hoher Einsatz**: Verwende hohe Multiplikatoren mit Free Spins

## 🎯 Langzeit-Engagement Konzept

### 🏗️ Progressives Freischalt-System

#### Phase 1: Starter (0-100 Coins)
- **Verfügbar**: Basis-Spiel, Free Spins, niedrige Einsätze
- **Ziel**: Grundlegendes Gameplay erlernen

#### Phase 2: Fortgeschritten (100-500 Coins)
- **Freischaltung**: Auto-Spin (kostet 100 Coins)
- **Freischaltung**: Höhere Einsatz-Multiplikatoren (2x, 5x)
- **Neue Features**: Extended Powerup-Dauer

#### Phase 3: Expert (500-2000 Coins)
- **Freischaltung**: Alle Powerups permanent verfügbar
- **Freischaltung**: Maximale Einsätze (10x, 25x)
- **Neue Features**: Kombinations-Achievements

#### Phase 4: Master (2000+ Coins)
- **Freischaltung**: Erweiterte Spielfelder (7x3, 9x3)
- **Freischaltung**: Exklusive Powerups
- **Prestige-System**: Neustart mit permanenten Boni

### 💎 Investitions-System

#### Coin-Investitionen
- **Slot-Upgrade**: Erweitere das Spielfeld stufenweise
  - 1x3 → 3x3 (200 Coins)
  - 3x3 → 5x3 (500 Coins) 
  - 5x3 → 7x3 (1000 Coins)
  - 7x3 → 9x3 (2500 Coins)

#### Feature-Freischaltungen
- **Auto-Spin Lizenz**: 100 Coins (permanent)
- **Lever-System**: 50 Coins pro Einsatz-Level
- **Powerup-Slots**: Zusätzliche aktive Powerup-Slots (300 Coins)
- **Speed Boost**: 2x Auto-Spin Geschwindigkeit (400 Coins)

#### Premium-Upgrades
- **Lucky Streak**: 10% höhere Gewinnchance (1000 Coins)
- **Coin Magnet**: 25% Bonus auf alle Gewinne (1500 Coins)
- **Time Warp**: Reduzierte Free-Spin Wartezeit (2000 Coins)

### 🎮 Engagement-Mechaniken

#### Achievement-System
- **Symbol Master**: Sammle 1000 von jedem Symbol
- **Combo King**: Erreiche 50 X-Formationen
- **High Roller**: Gewinne 10,000 Coins in einem Spin
- **Daily Dedication**: 30 Tage hintereinander gespielt

#### Prestige-System
- **Cosmic Reset**: Starte neu mit permanenten 10% Coin-Bonus
- **Legendary Status**: Exklusive Symbole und Kombinationen
- **Infinity Mode**: Endlose Spielfeld-Erweiterungen

#### Social Features (Zukunft)
- **Leaderboards**: Tägliche/wöchentliche Bestenlisten
- **Friend Challenges**: Coin-Wettkämpfe
- **Guild System**: Team-basierte Events

### 🔄 Retention-Strategien

#### Tägliche Anreize
- **Streak-Bonus**: Zusätzliche Coins für aufeinanderfolgende Tage
- **Daily Challenges**: Spezielle Aufgaben mit Belohnungen
- **Lucky Hours**: Erhöhte Gewinnchancen zu bestimmten Zeiten

#### Wöchentliche Events
- **Double XP Weekend**: Schnellere Progression
- **Powerup Festival**: Reduzierte Powerup-Kosten
- **Jackpot Rush**: Erhöhte Chancen auf große Gewinne

## 🛠️ Technische Details

### Systemanforderungen
- **Browser**: Moderner Webbrowser (Chrome, Firefox, Safari, Edge)
- **JavaScript**: Aktiviert
- **LocalStorage**: Für Spielstand-Speicherung

### Dateien
- `index.html`: Haupt-HTML-Struktur
- `script.js`: Spiellogik und Mechaniken
- `style.css`: Styling und CRT-Effekte

### Speicherung
- **LocalStorage**: Coins, Powerups, Free-Spin Status
- **Persistent**: Spielstand bleibt nach Browser-Neustart erhalten

## 📋 Entwicklungs-Roadmap

### ✅ Aktuell Implementiert
- [x] Basis-Slot-Machine (5x3)
- [x] Gewichtetes Symbol-System
- [x] Powerup-System (3 Arten)
- [x] Einsatz-Multiplikatoren
- [x] Auto-Spin Funktionalität
- [x] Tägliche Free Spins
- [x] Multiple Gewinnlinien
- [x] LocalStorage Persistierung
- [x] Retro CRT-Design

### 🚧 In Entwicklung
- [ ] Balancing-Verbesserungen
- [ ] Diagonale Kombinationen optimieren
- [ ] Symbol-Legende UI
- [ ] Performance-Optimierungen

### 🔮 Geplante Features

#### Phase 1: Core Improvements
- [ ] Achievement-System
- [ ] Freischalt-Progression
- [ ] Investitions-Mechaniken
- [ ] Erweiterte Statistiken

#### Phase 2: Expansion
- [ ] Variable Spielfeld-Größen (1x3 bis 9x3)
- [ ] Zusätzliche Powerups
- [ ] Prestige-System
- [ ] Daily/Weekly Challenges

#### Phase 3: Advanced Features
- [ ] Online Leaderboards
- [ ] Social Features
- [ ] Mobile App Version
- [ ] Sound-Design und Musik

### 🐛 Bekannte Issues
- Diagonale Kombinationen benötigen Feintuning
- Auto-Spin Geschwindigkeit könnte konfigurierbar sein
- Mobile Responsiveness verbesserungsfähig

---

## 🎰 Viel Spaß beim Spielen!

Das SlotMachine Game kombiniert klassisches Casino-Gameplay mit modernen Progression-Mechaniken. Ob du ein Gelegenheitsspieler oder ein strategischer Hochstapler bist - das Spiel bietet für jeden Spieltyp die passenden Herausforderungen und Belohnungen.

**Mögen die Walzen stets in deinem Sinne fallen! 🍀**