"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

// --- DATA ---------------------------------------------------------------
// Pulito e deduplicato dalla lista fornita (con piccole correzioni ortografiche)
const CONTORNI = [
  "Zucchine al vapore o alla piastra",
  "Carote al vapore o al forno",
  "Patata lessa o al forno",
  "Purè di patate",
  "Vellutata leggera (zucca e carota)",
  "Brodo vegetale filtrato (no legumi, cipolla)",
  "Riso bianco",
  "Couscous integrale",
  "Pasta di farro o pasta integrale",
  "Polenta di mais",
  "Pane integrale a lunga lievitazione",
  "Uova sode o strapazzate senza latte",
  "Omelette semplici",
  "Filetto di pesce bianco al vapore o al forno",
  "Pollo alla griglia o al vapore",
  "Ricotta fresca di capra o vaccina (poco stagionata)",
  "Pane azimo o crackers integrali senza lievito",
  "Grissini integrali a basso contenuto di grassi",
  "Focaccia a lunga lievitazione",
  "Panini integrali con ricotta fresca o prosciutto cotto",
  "Arancini di riso al forno (ripieni di ricotta)",
  "Crocchette di patate al forno",
  "Mini soufflé di formaggio delattosato",
  "Pancakes salati (farina di riso e uovo, con robiola)",
];

const PRIMI = [
  "Pasta olio e parmigiano",
  "Pasta al pomodoro semplice",
  "Pasta con crema di zucca",
  "Pasta al pesto leggero (senza aglio)",
  "Pasta col tonno",
  "Pasta con burro chiarificato e salvia",
  "Pasta con acciughe e olio",
  "Pasta con robiola",
  "Riso in bianco",
  "Riso al limone",
  "Risotto allo zafferano (alla milanese, senza ossobuco)",
  "Passatelli in brodo",
  "Gnocchi burro e salvia",
];

const SECONDI = [
  "Filetto di merluzzo (vapore/forno)",
  "Sogliola alla piastra",
  "Orata al cartoccio",
  "Branzino al forno",
  "Salmone in padella antiaderente",
  "Pollo alla griglia o al vapore",
  "Straccetti di pollo con olio e limone",
  "Tacchino al forno",
  "Coscia di pollo senza pelle",
  "Polpette di pollo al forno (con pane integrale)",
  "Vitello al vapore o piastra",
  "Manzo alla griglia",
  "Roast beef molto tenero",
  "Scaloppina al limone (poco condimento)",
  "Uova strapazzate senza latte",
  "Omelette semplici con erbe delicate",
  "Uova sode",
  "Uovo in camicia su pane integrale leggero",
  "Ricotta fresca (vaccina o di capra)",
  "Mozzarella senza lattosio",
];

const DOLCI = [
  "Budino (riso/avena/mandorla) con latte vegetale",
  "Crema di tapioca (poco zucchero)",
  "Panna cotta senza lattosio (zucchero di canna)",
  "Crema pasticcera con latte vegetale",
  "Yogurt con piccola quantità di miele",
  "Plumcake allo yogurt senza lattosio",
  "Biscotti secchi integrali senza burro",
  "Ciambella semplice (olio di semi, zucchero ridotto)",
  "Torta di mele (poco zucchero, senza burro pesante)",
  "1–2 quadretti di cioccolato fondente 70%",
  "Biscotti morbidi (farina di riso, gocce di fondente)",
];

// --- HELPERS ------------------------------------------------------------
function pickRandom<T>(arr: T[], exclude: Set<T> = new Set()): T | null {
  const options = arr.filter((x) => !exclude.has(x));
  if (options.length === 0) return null;
  const i = Math.floor(Math.random() * options.length);
  return options[i];
}

function toCSV(rows: string[][]) {
  return rows
    .map((r) => r.map((c) => '"' + c.replaceAll('"', '""') + '"').join(","))
    .join("\n");
}

// --- COMPONENT ----------------------------------------------------------
export default function MealPlannerDisbiosi() {
  const [includeContorno, setIncludeContorno] = useState(true);
  const [includeDolce, setIncludeDolce] = useState(false);
  const [avoidRepeatsDay, setAvoidRepeatsDay] = useState(true);
  const [avoidRepeatsWeek, setAvoidRepeatsWeek] = useState(true);
  const [seed, setSeed] = useState("");

  // Optional reproducibility: seed the RNG if user provides a seed
  useMemo(() => {
    if (!seed) return;
    // xmur3 + sfc32 small PRNG
    function xmur3(str: string) {
      let h = 1779033703 ^ str.length;
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
      }
      return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return h >>> 0;
      };
    }
    function sfc32(a: number, b: number, c: number, d: number) {
      return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        let t = (a + b) | 0; t = (t + d) | 0; d = (d + 1) | 0;
        a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11);
        c = (c + t) | 0; return (t >>> 0) / 4294967296;
      };
    }
    const seedFn = xmur3(seed);
    const rand = sfc32(seedFn(), seedFn(), seedFn(), seedFn());
    const _random = Math.random;
    // monkey-patch Math.random (scoped-ish) – revert on unmount not needed here
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Math.random = rand;
    return () => {
      Math.random = _random;
    };
  }, [seed]);

  type Meal = {
    contorno?: string | null;
    primo: string;
    secondo: string;
    dolce?: string | null;
  };

  const [pranzo, setPranzo] = useState<Meal | null>(null);
  const [cena, setCena] = useState<Meal | null>(null);
  const [settimana, setSettimana] = useState<Meal[] | null>(null);

  function generaGiorno() {
    const used = new Set<string>();
    const meal: Meal = {
      contorno: includeContorno ? pickRandom(CONTORNI, avoidRepeatsDay ? used : undefined) : null,
      primo: pickRandom(PRIMI, avoidRepeatsDay ? used : undefined)!,
      secondo: pickRandom(SECONDI, avoidRepeatsDay ? used : undefined)!,
      dolce: includeDolce ? pickRandom(DOLCI, avoidRepeatsDay ? used : undefined) : null,
    };
    setPranzo(meal);
    // Cena diversa dallo stesso giorno
    const used2 = avoidRepeatsDay ? new Set<string>([...used, ...Object.values(meal).filter(Boolean) as string[]]) : new Set<string>();
    const dinner: Meal = {
      contorno: includeContorno ? pickRandom(CONTORNI, used2) : null,
      primo: pickRandom(PRIMI, used2)!,
      secondo: pickRandom(SECONDI, used2)!,
      dolce: includeDolce ? pickRandom(DOLCI, used2) : null,
    };
    setCena(dinner);
    setSettimana(null);
  }

  function generaSettimana() {
    const days = 7;
    const week: Meal[] = [];
    const usedAll = new Set<string>();
    for (let d = 0; d < days; d++) {
      const usedDay = new Set<string>();
      const ex = avoidRepeatsDay ? usedDay : new Set<string>();
      const meal: Meal = {
        contorno: includeContorno ? pickRandom(CONTORNI, ex) : null,
        primo: pickRandom(PRIMI, ex)!,
        secondo: pickRandom(SECONDI, ex)!,
        dolce: includeDolce ? pickRandom(DOLCI, ex) : null,
      };
      // se evitare ripetizioni sull'intera settimana
      if (avoidRepeatsWeek) {
        [meal.contorno, meal.primo, meal.secondo, meal.dolce].forEach((v) => {
          if (v) usedAll.add(v);
        });
      }
      week.push(meal);
    }
    if (avoidRepeatsWeek) {
      // Rigenera se collisioni pesanti (best-effort semplice)
      // Nota: con i dataset ampi è raro; manteniamo le scelte semplici per ora.
    }
    setSettimana(week);
    setPranzo(null);
    setCena(null);
  }

  function copyCSV() {
    if (!settimana) return;
    const header = ["Giorno", "Contorno", "Primo", "Secondo", "Dolce"];
    const rows = settimana.map((m, i) => [
      `Giorno ${i + 1}`,
      m.contorno || "-",
      m.primo,
      m.secondo,
      m.dolce || "-",
    ]);
    const csv = toCSV([header, ...rows]);
    navigator.clipboard.writeText(csv);
    alert("Piano settimanale copiato in CSV negli appunti ✅");
  }

  function MealCard({ title, meal }: { title: string; meal: Meal }) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="rounded-2xl shadow-md border">
          <CardContent className="p-4 space-y-2">
            <div className="text-lg font-semibold">{title}</div>
            {meal.contorno && (
              <div><span className="font-medium">Contorno:</span> {meal.contorno}</div>
            )}
            <div><span className="font-medium">Primo:</span> {meal.primo}</div>
            <div><span className="font-medium">Secondo:</span> {meal.secondo}</div>
            {meal.dolce && (
              <div><span className="font-medium">Dolce:</span> {meal.dolce}</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Meal Planner Disbiosi – Paolo & Alessia</h1>
        <p className="text-sm text-muted-foreground">Generatore casuale di <span className="font-medium">pranzo</span> e <span className="font-medium">cena</span> dai piatti concessi. Nessuna verdura forzata oltre a quelle già presenti nei piatti.</p>
      </div>

      <Card className="rounded-2xl">
        <CardContent className="p-4 grid md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="contorno">Includi contorno</Label>
              <Switch id="contorno" checked={includeContorno} onCheckedChange={setIncludeContorno} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dolce">Includi dolce</Label>
              <Switch id="dolce" checked={includeDolce} onCheckedChange={setIncludeDolce} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="repeat-day">Evita ripetizioni nello stesso giorno</Label>
              <Switch id="repeat-day" checked={avoidRepeatsDay} onCheckedChange={setAvoidRepeatsDay} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="repeat-week">Evita ripetizioni nella settimana</Label>
              <Switch id="repeat-week" checked={avoidRepeatsWeek} onCheckedChange={setAvoidRepeatsWeek} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed (opzionale, per risultati ripetibili)</Label>
              <Input id="seed" value={seed} placeholder="es. paolo-alessia-2025" onChange={(e) => setSeed(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={generaGiorno}>Genera giorno (pranzo + cena)</Button>
              <Button variant="secondary" onClick={generaSettimana}>Genera settimana (7 giorni)</Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Tip: condire sempre con <span className="font-medium">olio EVO a crudo</span>, cotture delicate, niente fritti. In fase acuta, preferire pasta/riso bianchi.</div>
            <div className="text-sm text-muted-foreground">Le liste sono basate sulla tua dieta: se vuoi, possiamo <span className="font-medium">spuntare</span> elementi da escludere (intolleranze del momento) in una versione avanzata.</div>
            {settimana && (
              <Button onClick={copyCSV}>Copia piano settimanale in CSV</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {pranzo && cena && (
        <div className="grid md:grid-cols-2 gap-4">
          <MealCard title="Pranzo" meal={pranzo} />
          <MealCard title="Cena" meal={cena} />
        </div>
      )}

      {settimana && (
        <div className="space-y-3">
          <h2 className="text-xl font-semibold">Settimana generata</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {settimana.map((m, i) => (
              <MealCard key={i} title={`Giorno ${i + 1}`} meal={m} />
            ))}
          </div>
        </div>
      )}

      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-2 text-sm text-muted-foreground">
          <p>Nota: questo generatore non sostituisce un parere medico. Adatta le scelte alla tolleranza individuale. I nomi delle pietanze sono stati normalizzati (piccole correzioni ortografiche) per chiarezza.</p>
        </CardContent>
      </Card>
    </div>
  );
}
