import { Suspense } from "react";
import BookingFlow from "@/components/BookingFlow";
export const metadata = { title: "Schedule a Pickup — Laundry Day Off" };
export default function Page() {
  return <Suspense><BookingFlow /></Suspense>;
}
