import { mkdir, writeFile } from "node:fs/promises";

const TOTAL = 151;
const BASE = "https://pokeapi.co/api/v2/pokemon";

async function fetchPokemon(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) {
    throw new Error(`Fetch failed for #${id}: ${res.status}`);
  }
  const p = await res.json();
  return {
    id: p.id,
    name: p.name,
    height: p.height,
    weight: p.weight,
    types: p.types.map((t) => t.type.name),
    sprite:
      p.sprites.other?.["official-artwork"]?.front_default ??
      p.sprites.front_default,
    stats: Object.fromEntries(p.stats.map((s) => [s.stat.name, s.base_stat]))
  };
}

async function main() {
  await mkdir("data", { recursive: true });

  const list = [];
  for (let i = 1; i <= TOTAL; i += 1) {
    const item = await fetchPokemon(i);
    list.push(item);
    if (i % 25 === 0 || i === TOTAL) {
      console.log(`Fetched ${i}/${TOTAL}`);
    }
  }

  await writeFile("data/pokemon.json", `${JSON.stringify(list, null, 2)}\n`, "utf8");
  console.log("Saved data/pokemon.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
