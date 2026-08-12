"use client";

import {
  KEYS,
  getSessionUserId as sessionUserId,
  readCollection,
  writeCollection,
  uid,
  nowISO,
} from "@/utils/localBackend";

export type Connection = {
  id: string;
  user_id: string;
  connection_name: string;
  host_email: string;
  host_app_password: string;
  created_at: string;
};

export async function getSessionUserId(): Promise<string | null> {
  return sessionUserId();
}

export async function fetchConnections(): Promise<Connection[]> {
  const userId = sessionUserId();
  if (!userId) return [];
  return readCollection<Connection>(KEYS.CONNECTIONS)
    .filter((c) => c.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function createConnection(input: {
  connection_name: string;
  host_email: string;
  host_app_password: string;
}): Promise<Connection> {
  const userId = sessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  if (!input.connection_name.trim()) throw new Error("Connection name is required.");
  if (!input.host_email.trim()) throw new Error("Host email is required.");
  if (!input.host_app_password.trim()) throw new Error("App password is required.");

  const all = readCollection<Connection>(KEYS.CONNECTIONS);
  const connection: Connection = {
    id: uid(),
    user_id: userId,
    connection_name: input.connection_name.trim(),
    host_email: input.host_email.trim(),
    host_app_password: input.host_app_password.trim(),
    created_at: nowISO(),
  };
  all.push(connection);
  writeCollection(KEYS.CONNECTIONS, all);
  return connection;
}

export async function deleteConnection(id: string): Promise<void> {
  const userId = sessionUserId();
  if (!userId) throw new Error("Not authenticated.");
  const remaining = readCollection<Connection>(KEYS.CONNECTIONS).filter(
    (c) => !(c.id === id && c.user_id === userId)
  );
  writeCollection(KEYS.CONNECTIONS, remaining);
}
