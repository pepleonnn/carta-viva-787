/*
 * English version of the menu. Dish names keep their Catalan identity where it is part of the dish
 * (arròs del senyoret, fideuà, pa amb tomàquet...) and are explained in the description.
 * Product and brand names are never translated.
 */
(() => {
  const EN = {
    amanides:  { name: "Salads", kicker: "To start", intro: "Fresh, generous and made for the centre of the table." },
    classics:  { name: "7vuit7 classics", kicker: "To share", intro: "The ones that can't be missing. In the middle, for everyone to try." },
    platets:   { name: "Small plates for dipping bread", kicker: "With sauce", intro: "Sauces that call for bread. Don't hold back." },
    carns:     { name: "Meats", kicker: "Charcoal grill", intro: "The grill is the heart of the house. The fire does the rest.",
                 note: "Choose a side for the secreto, the fillet and the entrecôte: french fries, ember-roasted potatoes or green salad." },
    peixos:    { name: "Fish", kicker: "From the sea", intro: "Fish cooked to the point, with sides that complement it without covering it." },
    arrossos:  { name: "Rice dishes", kicker: "Our speciality", intro: "The pan in the middle of the table, and everyone dips in.",
                 note: "Lunchtime only · minimum 2 people · price per person." },
    pans:      { name: "Bread", kicker: "For dipping", intro: "Essential. Especially if you ordered small plates." },
    postres:   { name: "Desserts", kicker: "The finale", intro: "So the memory of dinner is a sweet one." },
    vins:      { name: "Recommended dessert wines", kicker: "With dessert", intro: "A small glass to round off dinner properly." }
  };
  const D = {
    "amanida-tomaquet":   ["Tomato salad", "With spring onion and tuna belly."],
    "amanida-burrata":    ["Burrata salad", "With pesto, rocket, confit semi-dried tomato, Kalamata olives, walnuts and honey vinaigrette."],
    "saltat-mongetes":    ["Sautéed Ganxet beans", "With green and red pepper, Figueres onion, white botifarra sausage and crispy ham."],
    "braves":             ["7vuit7 patatas bravas", "Twice-cooked potatoes."],
    "anxoves":            ["Cantabrian anchovies", "6 pieces."],
    "pernil":             ["Acorn-fed Iberian ham D.O. Jabugo", "100 g, with «picos» breadsticks."],
    "croquetes":          ["Croquettes", "Porcini, acorn-fed ham or roast chicken."],
    "ous-estrellats":     ["Broken eggs", "With acorn-fed Iberian ham."],
    "calamar-andalusa":   ["Andalusian-style squid", "With lime mayonnaise."],
    "cors-carxofa":       ["Artichoke hearts in tempura", "And foie gras."],
    "steak-tartar":       ["7vuit7 steak tartare", "Hand-cut, with a touch of heat."],
    "camembert":          ["Baked camembert", "With honey and rosemary."],
    "formatges":          ["Cheese board", "A selection of cheeses."],
    "bikini":             ["Acorn-fed ham «bikini»", "Toasted ham and cheese sandwich brushed with black truffle."],
    "raviolis":           ["Oxtail ravioli", "With blue cheese sauce, apple and walnuts."],
    "vieires":            ["Scallops with confit pork jowl", "With leek cream and roast jus."],
    "calamarcets":        ["Sautéed baby squid", "With black botifarra sausage, caramelised onion and red pepper aioli."],
    "tartar-tonyina":     ["Balfegó tuna tartare", "With avocado, Figueres onion, tomato and coriander."],
    "carxofes-confitades":["Confit artichokes", "With Iberian ham and red prawn."],
    "pollastre-coreana":  ["Korean-style chicken bites", "With french fries."],
    "secret":             ["Charcoal-grilled Iberian secreto", "250 g."],
    "filet":              ["Sliced beef fillet", "With foie gras escalope and Modena demi-glace. 200 g."],
    "entrecot":           ["Charcoal-grilled dry-aged beef entrecôte", "300 g."],
    "confit-anec":        ["Duck confit", "With mango, pear, pine nuts in red wine and ember-roasted potatoes."],
    "xuleton":            ["Premium beef «Xuletón»", "1 kg bone-in rib steak, with french fries and green salad."],
    "bacalla":            ["Cod loin", "With Mallorcan sobrassada and honey aioli mousseline."],
    "salmo":              ["Salmon", "With green asparagus purée and meunière sauce."],
    "llobarro":           ["Sea bass", "On a bed of courgette with leek cream."],
    "senyoret":           ["Arròs del senyoret", "Peeled seafood rice with cuttlefish, mussels and red prawn."],
    "mar-muntanya":       ["Surf and turf rice", "With cuttlefish, shredded cod, confit pork jowl and porcini."],
    "muntanya":           ["Mountain rice", "With pork ribs, porcini and white and black botifarra from Calaf."],
    "fideua":             ["Fideuà", "Toasted noodle paella with cuttlefish, shredded cod and carabinero prawns."],
    "negre":              ["Black rice", "With cuttlefish and octopus."],
    "pa-tomaquet":        ["7vuit7 pa amb tomàquet", "Catalan bread with tomato."],
    "pa-sense-gluten":    ["Gluten-free bread", ""],
    "pastis-formatge":    ["Homemade cheesecake", "With red berry coulis."],
    "cardinal":           ["Cardinal del Turull", "With hot chocolate."],
    "torrada":            ["Santa Teresa torrija", "Spanish caramelised brioche toast with toffee and salted caramel ice cream."],
    "lemon-pie":          ["Lemon pie", ""],
    "coulant":            ["Homemade chocolate coulant", "70% cocoa, with stracciatella ice cream."],
    "gelat-carquinyoli":  ["Carquinyoli ice cream", "With crema catalana liqueur and carquinyoli almond biscuits."],
    "formatges-postres":  ["Cheese board", "A selection of cheeses."],
    "px":                 ["PX Gosálvez", "D.O. Montilla-Moriles"],
    "ratafia":            ["Ratafia de l'àvia", "Arenys de Munt"],
    "snaranja":           ["S'naranja de Sauci", "D.O.P. Condado de Huelva"],
    "palo-cortado":       ["Palo Cortado Solera Cayetano del Pino", "D.O. Jerez"]
  };
  (window.MENU || []).forEach(c => {
    const e = EN[c.id];
    const PE = { amanides: "A crisp, mineral white, such as a Penedès xarel·lo.", classics: "A brut nature cava, dry with fine bubbles.",
      platets: "A lees-aged white with enough body for the sauce.", carns: "A full-bodied local red: Priorat, Montsant or Pla de Bages.",
      peixos: "A rounded white Garnacha from Terra Alta.", arrossos: "A dry rosé or a white Garnacha." };
    if (c.pairing && PE[c.id]) c.pairing.en = PE[c.id];
    if (e) { c.name.en = e.name; c.kicker.en = e.kicker; c.intro.en = e.intro; if (c.note && e.note) c.note.en = e.note; }
    c.dishes.forEach(d => { const x = D[d.id]; if (x) { d.name.en = x[0]; d.desc.en = x[1]; } if (d.unit) d.unit.en = "each"; });
  });
  const A = { gluten: "Gluten", crustacis: "Crustaceans", ous: "Eggs", peix: "Fish", cacauets: "Peanuts", soja: "Soy",
    lactics: "Milk", fruits_secs: "Tree nuts", api: "Celery", mostassa: "Mustard", sesam: "Sesame", sulfits: "Sulphites",
    tramussos: "Lupin", molluscs: "Molluscs" };
  Object.keys(A).forEach(k => window.ALLERGENS[k] && (window.ALLERGENS[k].en = A[k]));
  window.RESTAURANT.claim.en = ["Local Catalan", "cuisine."];
})();
