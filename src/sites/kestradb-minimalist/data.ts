/* ------------------------------------------------------------------ */
/* Consola del hero                                                    */
/* ------------------------------------------------------------------ */

export type Lang = 'py' | 'sql' | 'ts'

export type Stage = {
  id: string
  label: string
  ms: number
  /** Etapas que se reparten entre shards: se dibujan con una línea por shard. */
  fanout?: boolean
}

export type Hit = {
  id: string
  title: string
  score: number
  shard: number
}

export type Preset = {
  id: string
  file: string
  lang: Lang
  collection: string
  code: string
  stages: Stage[]
  hits: Hit[]
  candidates: number
  /** Salida resumida de EXPLAIN que se muestra bajo el editor. */
  plan: [string, string][]
}

export const SHARDS = 12

export const PRESETS: Preset[] = [
  {
    id: 'semantic',
    file: 'semantic.py',
    lang: 'py',
    collection: 'support_articles',
    code: `# Búsqueda semántica con filtro de metadatos
from kestradb import Client

db = Client("kdb://prod-eu.kestra.cloud")
docs = db.collection("support_articles")

hits = docs.search(
    vector=embed("cómo revierto un despliegue"),
    top_k=5,
    filter={"lang": "es", "product": "deploy"},
    consistency="bounded",
)`,
    stages: [
      { id: 'parse', label: 'parse', ms: 0.06 },
      { id: 'route', label: 'plan + route', ms: 0.18 },
      { id: 'ann', label: 'ANN · HNSW', ms: 2.41, fanout: true },
      { id: 'merge', label: 'merge top-k', ms: 0.27 },
      { id: 'rerank', label: 'rerank exacto', ms: 0.52 },
      { id: 'serialize', label: 'serialize', ms: 0.09 },
    ],
    hits: [
      { id: 'kb-2291', title: 'Revertir un despliegue a la versión anterior', score: 0.912, shard: 3 },
      { id: 'kb-0874', title: 'Rollback automático tras fallar un health check', score: 0.887, shard: 7 },
      { id: 'kb-3310', title: 'Congelar despliegues durante un incidente', score: 0.861, shard: 1 },
      { id: 'kb-1046', title: 'Historial de releases y cómo compararlas', score: 0.842, shard: 10 },
      { id: 'kb-2958', title: 'Promover una build de staging a producción', score: 0.829, shard: 5 },
    ],
    candidates: 4812,
    plan: [
      ['fanout', '12/12 shards'],
      ['ef_search', '96'],
      ['filter', 'lang, product · selectividad 0.31'],
      ['pipeline', '4.812 → rerank 50 → top 5'],
    ],
  },
  {
    id: 'hybrid',
    file: 'hybrid.sql',
    lang: 'sql',
    collection: 'support_articles',
    code: `-- Híbrida: vector + BM25 en una sola consulta
SELECT id, title, score
FROM support_articles
WHERE lang = 'es'
ORDER BY hybrid(
  vector_distance(embedding, :q),
  bm25(body, 'rollback despliegue'),
  alpha => 0.7
) DESC
LIMIT 5;`,
    stages: [
      { id: 'parse', label: 'parse SQL', ms: 0.14 },
      { id: 'route', label: 'plan + route', ms: 0.21 },
      { id: 'ann', label: 'ANN · HNSW', ms: 2.12, fanout: true },
      { id: 'bm25', label: 'BM25 léxico', ms: 0.66, fanout: true },
      { id: 'fusion', label: 'fusión α=0.7', ms: 0.31 },
      { id: 'serialize', label: 'serialize', ms: 0.08 },
    ],
    hits: [
      { id: 'kb-2291', title: 'Revertir un despliegue a la versión anterior', score: 0.947, shard: 3 },
      { id: 'kb-0874', title: 'Rollback automático tras fallar un health check', score: 0.903, shard: 7 },
      { id: 'kb-4102', title: 'El comando deploy undo de la CLI', score: 0.871, shard: 11 },
      { id: 'kb-3310', title: 'Congelar despliegues durante un incidente', score: 0.858, shard: 1 },
      { id: 'kb-0519', title: 'Permisos necesarios para revertir', score: 0.82, shard: 8 },
    ],
    candidates: 6307,
    plan: [
      ['fanout', '12/12 shards'],
      ['ann', 'ef_search 96 · k 100'],
      ['bm25', 'k1 1.2 · b 0.75 · 2 términos'],
      ['pipeline', '6.307 → fusión α 0.7 → top 5'],
    ],
  },
  {
    id: 'multi',
    file: 'multi_vector.ts',
    lang: 'ts',
    collection: 'products',
    code: `// Multi-vector: imagen + texto con fusión RRF
import { kdb } from "./client";

const hits = await kdb.collection("products").search({
  vectors: { image: imageEmb, text: textEmb },
  fusion: "rrf",
  filter: { inStock: true },
  topK: 5,
});`,
    stages: [
      { id: 'parse', label: 'parse', ms: 0.07 },
      { id: 'route', label: 'plan + route', ms: 0.19 },
      { id: 'ann', label: 'ANN · 2 vectores', ms: 2.36, fanout: true },
      { id: 'fusion', label: 'fusión RRF', ms: 0.29 },
      { id: 'rerank', label: 'rerank exacto', ms: 0.44 },
      { id: 'serialize', label: 'serialize', ms: 0.1 },
    ],
    hits: [
      { id: 'sku-88213', title: 'Chaqueta de lona encerada, verde oliva', score: 0.934, shard: 2 },
      { id: 'sku-10457', title: 'Parka ligera con capucha, caqui', score: 0.901, shard: 9 },
      { id: 'sku-66120', title: 'Chaqueta de campo de algodón, musgo', score: 0.889, shard: 4 },
      { id: 'sku-73002', title: 'Cortavientos de poliéster reciclado', score: 0.866, shard: 0 },
      { id: 'sku-51239', title: 'Gabardina corta encerada, piedra', score: 0.843, shard: 6 },
    ],
    candidates: 5540,
    plan: [
      ['fanout', '12/12 shards × 2 vectores'],
      ['ef_search', '64 por vector'],
      ['filter', 'inStock · selectividad 0.72'],
      ['pipeline', '5.540 → RRF k=60 → top 5'],
    ],
  },
]

// Latencias (ms) de las últimas consultas, para que el gráfico no arranque vacío.
export const SEED_HISTORY = [
  3.41, 3.62, 3.38, 3.9, 3.55, 3.47, 3.71, 3.33, 4.12, 3.58, 3.49, 3.66, 3.44, 3.8, 3.52, 3.39,
  3.61, 3.95, 3.46, 3.57, 3.42, 3.7, 3.51, 3.36, 3.84, 3.48, 3.63, 3.4, 3.54,
]

/* ------------------------------------------------------------------ */
/* Benchmarks                                                          */
/* ------------------------------------------------------------------ */

export type EngineId = 'kestra' | 'a' | 'b' | 'c'

export const ENGINES: { id: EngineId; name: string; detail: string }[] = [
  { id: 'kestra', name: 'KestraDB 2.4', detail: 'HNSW particionado' },
  { id: 'a', name: 'Motor A', detail: 'HNSW en memoria, nodo único' },
  { id: 'b', name: 'Motor B', detail: 'IVF-PQ sobre disco' },
  { id: 'c', name: 'Motor C', detail: 'Extensión de Postgres' },
]

export type MetricId = 'qps' | 'p99' | 'mem' | 'build'

export const METRICS: { id: MetricId; label: string; unit: string; higherIsBetter: boolean }[] = [
  { id: 'qps', label: 'Throughput a recall@10 = 0.95', unit: 'qps', higherIsBetter: true },
  { id: 'p99', label: 'Latencia p99', unit: 'ms', higherIsBetter: false },
  { id: 'mem', label: 'Memoria por millón de vectores', unit: 'GiB', higherIsBetter: false },
  { id: 'build', label: 'Tiempo de construcción del índice', unit: 'min', higherIsBetter: false },
]

export type DatasetId = 'laion' | 'deep' | 'msmarco'

export const DATASETS: { id: DatasetId; name: string; shape: string }[] = [
  { id: 'laion', name: 'LAION-100M', shape: '100M × 768d' },
  { id: 'deep', name: 'Deep1B', shape: '1B × 96d' },
  { id: 'msmarco', name: 'MS MARCO v2', shape: '138M × 1024d' },
]

export const RESULTS: Record<DatasetId, Record<MetricId, Record<EngineId, number>>> = {
  laion: {
    qps: { kestra: 18400, a: 11200, b: 6900, c: 2100 },
    p99: { kestra: 3.8, a: 6.1, b: 14.2, c: 41.0 },
    mem: { kestra: 1.9, a: 3.4, b: 0.9, c: 3.9 },
    build: { kestra: 42, a: 71, b: 55, c: 190 },
  },
  deep: {
    qps: { kestra: 41200, a: 29800, b: 17500, c: 5200 },
    p99: { kestra: 2.1, a: 3.3, b: 8.9, c: 22.4 },
    mem: { kestra: 0.52, a: 0.61, b: 0.21, c: 0.88 },
    build: { kestra: 118, a: 164, b: 131, c: 520 },
  },
  msmarco: {
    qps: { kestra: 9800, a: 6100, b: 3900, c: 980 },
    p99: { kestra: 6.4, a: 10.8, b: 23.5, c: 77.0 },
    mem: { kestra: 2.4, a: 4.6, b: 1.2, c: 5.1 },
    build: { kestra: 64, a: 102, b: 88, c: 305 },
  },
}

/* ------------------------------------------------------------------ */
/* Arquitectura                                                        */
/* ------------------------------------------------------------------ */

export type NodeKind = 'client' | 'router' | 'coordinator' | 'shard' | 'wal' | 'object' | 'compactor'

export type ArchNode = {
  id: string
  kind: NodeKind
  label: string
  sub: string
  x: number
  y: number
  w: number
  h: number
}

export const ARCH_NODES: ArchNode[] = [
  { id: 'sdk', kind: 'client', label: 'SDK', sub: 'py · ts · rust', x: 210, y: 20, w: 160, h: 56 },
  { id: 'api', kind: 'client', label: 'REST / gRPC', sub: ':8443 · :9090', x: 425, y: 20, w: 160, h: 56 },
  { id: 'jobs', kind: 'client', label: 'Ingesta', sub: 'kafka · spark', x: 640, y: 20, w: 160, h: 56 },

  { id: 'router-a', kind: 'router', label: 'router-a', sub: 'stateless', x: 300, y: 148, w: 170, h: 58 },
  { id: 'router-b', kind: 'router', label: 'router-b', sub: 'stateless', x: 530, y: 148, w: 170, h: 58 },
  { id: 'coord', kind: 'coordinator', label: 'coordinator', sub: 'raft × 3', x: 810, y: 148, w: 150, h: 58 },

  { id: 'shard-0', kind: 'shard', label: 'shard-0', sub: 'L + 2R', x: 90, y: 280, w: 170, h: 70 },
  { id: 'shard-1', kind: 'shard', label: 'shard-1', sub: 'L + 2R', x: 300, y: 280, w: 170, h: 70 },
  { id: 'shard-2', kind: 'shard', label: 'shard-2', sub: 'L + 2R', x: 530, y: 280, w: 170, h: 70 },
  { id: 'shard-3', kind: 'shard', label: 'shard-3', sub: 'L + 2R', x: 740, y: 280, w: 170, h: 70 },

  { id: 'wal', kind: 'wal', label: 'WAL replicado', sub: 'quorum 2/3', x: 90, y: 422, w: 280, h: 58 },
  { id: 'object', kind: 'object', label: 'Object storage', sub: 's3 · gcs · azure blob', x: 430, y: 422, w: 320, h: 58 },
  { id: 'compactor', kind: 'compactor', label: 'compactor', sub: 'background', x: 810, y: 422, w: 150, h: 58 },
]

export type ArchEdge = { from: string; to: string; control?: boolean }

const shardIds = ['shard-0', 'shard-1', 'shard-2', 'shard-3']

export const ARCH_EDGES: ArchEdge[] = [
  { from: 'sdk', to: 'router-a' },
  { from: 'api', to: 'router-a' },
  { from: 'api', to: 'router-b' },
  { from: 'jobs', to: 'router-b' },
  ...shardIds.flatMap((s) => [
    { from: 'router-a', to: s },
    { from: 'router-b', to: s },
  ]),
  ...shardIds.map((s) => ({ from: s, to: s === 'shard-0' || s === 'shard-1' ? 'wal' : 'object' })),
  { from: 'shard-1', to: 'object' },
  { from: 'shard-2', to: 'wal' },
  { from: 'compactor', to: 'object' },
  { from: 'coord', to: 'router-b', control: true },
  { from: 'coord', to: 'shard-3', control: true },
]

export const NODE_DETAILS: Record<NodeKind, { title: string; body: string; facts: [string, string][] }> = {
  client: {
    title: 'Clientes',
    body: 'Cualquier cliente puede hablar con cualquier router. Los SDKs mantienen conexiones persistentes y reintentan contra otro router si uno cae.',
    facts: [
      ['Protocolos', 'gRPC, REST, Arrow Flight'],
      ['SDKs oficiales', 'Python, TypeScript, Rust, Go'],
      ['Autenticación', 'mTLS o tokens con scope'],
    ],
  },
  router: {
    title: 'Query router',
    body: 'Planifica la consulta, hace fan-out a los shards que contienen la partición, fusiona los top-k parciales y aplica el rerank exacto. No guarda estado: se escala añadiendo réplicas detrás del balanceador.',
    facts: [
      ['Estado', 'ninguno'],
      ['Mapa de shards', 'cacheado, TTL 500 ms'],
      ['Overhead típico', '0.4–0.9 ms por consulta'],
    ],
  },
  coordinator: {
    title: 'Coordinator',
    body: 'Mantiene el catálogo de colecciones, el mapa de shards y la asignación de líderes mediante Raft. Está fuera del camino caliente: si se pierde el quórum, las lecturas siguen funcionando.',
    facts: [
      ['Consenso', 'Raft, 3 o 5 votantes'],
      ['Datos', 'solo metadatos'],
      ['Rebalanceo', 'movimiento de segmentos, sin reindexar'],
    ],
  },
  shard: {
    title: 'Shard',
    body: 'Posee una partición de la colección. Los segmentos HNSW recientes viven en memoria y los sellados se mapean desde disco. Los filtros se evalúan sobre bitmaps Roaring durante el recorrido del grafo, no después.',
    facts: [
      ['Réplicas', '1 líder + 2 seguidores'],
      ['Índices', 'HNSW, IVF-PQ, flat'],
      ['Cuantización', 'fp32, fp16, int8, binaria'],
    ],
  },
  wal: {
    title: 'WAL replicado',
    body: 'Toda escritura se confirma cuando 2 de 3 réplicas la persisten. El índice se construye de forma asíncrona a partir del log, así que las escrituras no esperan a HNSW.',
    facts: [
      ['Durabilidad', 'quórum antes del ack'],
      ['Visibilidad', '≤ 150 ms en modo bounded'],
      ['Retención', 'hasta el siguiente checkpoint'],
    ],
  },
  object: {
    title: 'Object storage',
    body: 'Los segmentos sellados son inmutables y se guardan en almacenamiento de objetos. Un nodo nuevo se hidrata descargando segmentos, no recalculando el grafo.',
    facts: [
      ['Formato', 'segmentos inmutables versionados'],
      ['Compatibilidad', 'S3, GCS, Azure Blob, MinIO'],
      ['Hidratación', '~1.8 GB/s por nodo'],
    ],
  },
  compactor: {
    title: 'Compactor',
    body: 'Fusiona segmentos pequeños, reconstruye el grafo con mejores vecinos y purga tombstones. Corre en nodos separados para que la compactación nunca compita con las consultas.',
    facts: [
      ['Disparador', 'n.º de segmentos o % de borrados'],
      ['Aislamiento', 'pool de CPU dedicado'],
      ['Impacto en p99', '< 3 %'],
    ],
  },
}

export const QUERY_PATH = [
  'El cliente envía la consulta a cualquier router del pool.',
  'El router resuelve qué shards contienen la partición con el mapa cacheado del coordinator.',
  'Cada shard recorre sus segmentos HNSW aplicando el filtro sobre bitmaps.',
  'El router fusiona los top-k parciales y recalcula la distancia exacta de los finalistas.',
  'Respuesta al cliente. En producción, p99 por debajo de 4 ms.',
]
