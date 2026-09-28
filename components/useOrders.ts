"use client";
import { useEffect, useState } from "react";
import { loadOrders, Order } from "@/lib/store";
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const r = () => setOrders(loadOrders());
    r(); setReady(true);
    window.addEventListener("ldo-orders", r); window.addEventListener("storage", r);
    return () => { window.removeEventListener("ldo-orders", r); window.removeEventListener("storage", r); };
  }, []);
  return { orders, ready };
}
