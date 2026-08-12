import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/AboutUs";
import Contact from "@/components/ContactUs";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-grow flex-col">
        <Hero />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
