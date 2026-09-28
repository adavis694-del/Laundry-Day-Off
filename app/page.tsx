import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import ServiceArea from "@/components/ServiceArea";
import Reviews from "@/components/Reviews";
import FAQ from "@/components/FAQ";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Pricing />
      <ServiceArea />
      <Reviews />
      <FAQ />
      <section className="mx-auto mt-24 max-w-4xl px-4">
        <div className="card bg-rose text-center">
          <h2 className="font-script text-4xl font-normal">You deserve a day off too.</h2>
          <p className="mt-2">Book your first pickup in under two minutes.</p>
          <Link href="/book" className="btn-ghost mt-5">Schedule a Pickup</Link>
        </div>
      </section>
    </>
  );
}
