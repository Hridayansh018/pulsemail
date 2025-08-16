"use client";
import supabase from "@/utils/supabase";

export type CampaignRow = {
  id: string;
  user_id: string;
  connection_id: string;
  connection_name: string;
  campaign_name: string;
  email_list: string[];
  subject: string;
  message: string;
  created_at: string;
};

async function getSessionUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function logCampaign(input: {
  connection_id: string;
  connection_name: string;
  campaign_name: string;
  email_list: string[];
  subject: string;
  message: string;
}): Promise<CampaignRow> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      connection_id: input.connection_id,
      connection_name: input.connection_name,
      campaign_name: input.campaign_name,
      email_list: input.email_list,
      subject: input.subject,
      message: input.message,
    })
    .select()
    .single();

  if (error) throw error;
  return data as CampaignRow;
}

export async function fetchCampaigns(): Promise<CampaignRow[]> {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CampaignRow[];
}

export async function deleteCampaign(id: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  
  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) throw error;
}
