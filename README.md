# 7vuit7 · Carta viva

Carta digital en moviment del restaurant **7vuit7 · 787matadepera** (C/ Sant Llorenç, 91, Matadepera).
El client escaneja el QR de la taula i entra a una carta que es llisca com un vídeo: plat a plat, amb preu, descripció i suggeriments per acompanyar-lo.

Català, castellà i anglès · pensada per a mòbil · sense dependències ni servidor.

## Què hi ha

- **Intro animada** amb el logotip: el traç del 7vuit7 s'escriu sol i la flama de la llar de foc s'encén.
- **Inici**: foto de la llar de foc en moviment, horari d'avui en directe i accés a la carta en vídeo.
- **La carta en moviment**: un plat per pantalla, a pantalla completa, com un reel. Cada plat admet vídeo propi; mentre no n'hi ha, es mostra un pòster animat amb la marca.
- **Venda suggerida**: pa amb tomàquet als platets, vins dolços a les postres, acompanyament a triar a les carns.
- **La meva tria**: el client marca el que vol, veu un total orientatiu i ho ensenya al cambrer en pantalla gran.
- **Carta completa** amb navegació per seccions, espais del restaurant, contacte i reserva amb un toc.

## Estructura

```
index.html          pàgina
styles.css          disseny
app.js              lògica i animacions
data/menu.js        LA CARTA: plats, preus, textos (aquí és on s'edita)
fonts.css           tipografies (Cormorant Garamond, Raleway, Jost) allotjades al repo
assets/img/         logotip
assets/video/       (posa-hi els vídeos dels plats)
```

## Vídeos d'exemple

La carta no fa servir cap foto: només vídeo. Ara mateix 45 dels 46 plats tenen un vídeo d'exemple de YouTube (Shorts de tercers), revisats un a un en moviment i sense repetir-ne cap. Són a `window.VIDEOS`, al final de `data/menu.js`. Els plats sense un vídeo prou bo es mostren en negre. Abans de posar la carta en servei s'han de substituir per vídeos propis del restaurant.

Els vídeos de YouTube només es veuen quan la carta està publicada en una web normal (GitHub Pages, per exemple). Si un vídeo no carrega, el plat es queda en negre.

## Afegir el vídeo propi d'un plat

1. Grava en vertical (9:16), 6–10 segons, sense so, en bucle. Exporta MP4 (H.264) de menys de 4 MB.
2. Desa'l a `assets/video/`, per exemple `assets/video/braves.mp4`.
3. A `data/menu.js`, al plat, afegeix:

```js
media: { type: "video", src: "assets/video/braves.mp4", poster: "assets/img/braves.jpg" }
```

## Canviar preus o plats

Tot és a `data/menu.js`. Cada plat té `name` i `desc` en `ca` i `es`, i `price` en número (15.5 = 15,5 €).

## Al·lèrgens

La carta original no inclou al·lèrgens. El camp `allergens` ja està preparat (codis a `ALLERGENS`, al principi de `data/menu.js`). Mentrestant es mostra un avís perquè el client ho consulti a l'equip.

## Publicar amb GitHub Pages

Settings → Pages → Branch `main`, carpeta `/ (root)`. La URL resultant és la que va al QR.

## Al·lèrgens

Cada plat mostra la línia "Al·lèrgens". Mentre el restaurant no els passi, hi diu "Consulta'ls al nostre equip".
Per omplir-los: `data/alergens-plantilla.csv` (una fila per plat, marcar amb una X els que conté) i passar-los a `allergens: [...]` a `data/menu.js`.
