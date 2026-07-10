import { supabase } from "./supabase";

const STATE_TABLE = "hunter_user_state";

export async function loadRemoteState(userId) {
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from(STATE_TABLE)
    .select("profile, profile_doc, statuses, accents, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveRemoteState(userId, { profile, profileDoc, statuses, accents }) {
  if (!supabase || !userId) return null;

  const payload = {
    user_id: userId,
    profile,
    profile_doc: profileDoc,
    statuses,
  };
  if (accents !== undefined) payload.accents = accents;

  const { data, error } = await supabase
    .from(STATE_TABLE)
    .upsert(payload, { onConflict: "user_id" })
    .select("updated_at")
    .single();

  if (error) throw error;
  return data;
}
