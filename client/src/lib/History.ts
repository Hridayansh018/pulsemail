"use client";
import {
  KEYS,
  getSessionUserId,
  readCollection,
  writeCollection,
  uid,
  nowISO,
} from "@/utils/localBackend";

export type CampaignRow = {
  id: string;
  user_id: string;
  connection_id: string;
  connection_name: string;
  campaign_name: string;
  email_list: string[];
  subject: string[];
  message: string[];
  created_at: string;
};

export async function logCampaign(input: {
  connection_id: string;
  connection_name: string;
  campaign_name: string;
  email_list: string[];
  subject?: string[];
  message?: string[];
}): Promise<CampaignRow> {
  const userId = getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");

  const all = readCollection<CampaignRow>(KEYS.CAMPAIGNS);
  const row: CampaignRow = {
    id: uid(),
    user_id: userId,
    connection_id: input.connection_id,
    connection_name: input.connection_name,
    campaign_name: input.campaign_name,
    email_list: input.email_list,
    subject: input.subject ?? [],
    message: input.message ?? [],
    created_at: nowISO(),
  };
  all.push(row);
  writeCollection(KEYS.CAMPAIGNS, all);
  return row;
}

export async function fetchCampaigns(): Promise<CampaignRow[]> {
  const userId = getSessionUserId();
  if (!userId) return [];
  return readCollection<CampaignRow>(KEYS.CAMPAIGNS)
    .filter((c) => c.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function deleteCampaign(id: string): Promise<void> {
  const userId = getSessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  const remaining = readCollection<CampaignRow>(KEYS.CAMPAIGNS).filter(
    (c) => !(c.id === id && c.user_id === userId)
  );
  writeCollection(KEYS.CAMPAIGNS, remaining);
}
