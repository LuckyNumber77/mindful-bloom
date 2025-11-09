// listModels.ts  (project root)
const key = import.meta.env.VITE_GEMINI_API_KEY as string;

async function list(endpoint: string) {
  const url = `https://generativelanguage.googleapis.com/${endpoint}/models?key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`❌ ${endpoint} -> ${res.status} ${res.statusText}`);
    const txt = await res.text();
    console.error(txt);
    return;
  }
  const data = await res.json();
  console.log(`\n✅ ${endpoint} models:`);
  for (const m of data.models ?? []) console.log(" -", m.name);
}

await list("v1");
await list("v1beta");
await list("v1alpha");