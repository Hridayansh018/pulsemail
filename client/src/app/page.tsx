import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Image from "next/image";
import About from "@/components/AboutUs";
import Contact from "@/components/ContactUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}
