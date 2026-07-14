import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    "Faltam as variáveis VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY. Confira o arquivo .env (veja .env.example)."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLE = "guide_data";
const ROW_ID = 1;

/** Carrega os dados do guia (senha + imóveis). Retorna null se ainda não existir. */
export async function loadGuideData() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("payload")
    .eq("id", ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data ? data.payload : null;
}

/** Salva (cria ou atualiza) os dados do guia inteiro. */
export async function saveGuideData(payload) {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ id: ROW_ID, payload, updated_at: new Date().toISOString() });

  if (error) throw error;
}

const PHOTOS_BUCKET = "property-photos";

/** Envia uma foto (Blob já comprimido) para o Storage e devolve a URL pública. */
export async function uploadPhoto(blob) {
  const fileName = `cover-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
