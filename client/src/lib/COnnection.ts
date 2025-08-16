"use client";

import supabase from "@/utils/supabase";

export type Connection = {
  id: string;
  user_id: string;
  connection_name: string;
  host_email: string;
  host_app_password: string;
  created_at: string;
};

export async function getSessionUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function fetchConnections(): Promise<Connection[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createConnection(input: {
  connection_name: string;
  host_email: string;
  host_app_password: string;
}): Promise<Connection> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  if (!input.connection_name.trim()) throw new Error("Connection name is required.");
  if (!input.host_email.trim()) throw new Error("Host email is required.");
  if (!input.host_app_password.trim()) throw new Error("App password is required.");

  const { data, error } = await supabase
    .from("connections")
    .insert({
      user_id: userId,
      connection_name: input.connection_name.trim(),
      host_email: input.host_email.trim(),
      host_app_password: input.host_app_password.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as Connection;
}

export async function deleteConnection(id: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  const { error } = await supabase.from("connections").delete().eq("id", id);
  if (error) throw error;
}
