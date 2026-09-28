"use client";
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { fetchOrders, Order } from "@/lib/store";

/** Orders the signed-in user can see, kept live via Supabase Realtime. Pass `enabled=false` while signed out. */
export function useOrders(enabled: boolean) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try { setOrders(await fetchOrders()); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Couldn't load orders."); }
    finally { setReady(true); }
  }, []);

  useEffect(() => {
    const sb = getSupabase();
    if (!enabled || !sb) { setOrders([]); setReady(!enabled); return; }
    setReady(false);
    reload();
    const channel = sb.channel(`orders-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => reload())
      .subscribe();
    window.addEventListener("focus", reload);
    return () => { sb.removeChannel(channel); window.removeEventListener("focus", reload); };
  }, [enabled, reload]);

  return { orders, ready, error, reload };
}
