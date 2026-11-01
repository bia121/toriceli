TORICELI — magazin demo local

CERINȚĂ: Node.js 18 sau mai nou.
1. Instalează Node.js de pe https://nodejs.org (versiunea LTS).
2. Dezarhivează folderul TORICELI.
3. Deschide Terminal / PowerShell în folderul TORICELI.
4. Rulează: node server.js
5. Deschide în browser: http://localhost:3000
6. Panou admin: http://localhost:3000/admin.html

PAROLA ADMIN INIȚIALĂ:
schimba-aceasta-parola

SCHIMBĂ PAROLA înainte de a expune site-ul pe internet:
Windows PowerShell:
  $env:ADMIN_PASSWORD="o-parola-lunga-si-unica"
  node server.js

macOS / Linux:
  ADMIN_PASSWORD="o-parola-lunga-si-unica" node server.js

Pentru oprire: Ctrl+C în fereastra terminalului.

ACCES DE PE ALTE DISPOZITIVE:
- În aceeași rețea Wi-Fi: află IP-ul local al PC-ului (Windows: rulează ipconfig și caută IPv4 Address), apoi deschide pe telefon http://IP-UL-PC-ULUI:3000.
- De oriunde prin internet: configurează ulterior un Cloudflare Tunnel către http://localhost:3000. Nu expune panoul admin fără parolă puternică. PC-ul trebuie să rămână pornit și conectat la internet.

IMPORTANT:
Acesta este un prototip demonstrativ. Comenzile sunt fictive; nu există plăți, procesare de carduri, livrare sau e-mailuri. Nu introduce date reale ale clienților. Sesiunile admin sunt păstrate în memoria serverului și se resetează la repornire. Pentru lansare comercială sunt necesare securizare suplimentară, HTTPS, backup, protecția datelor și integrarea unui procesator de plăți.
