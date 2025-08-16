import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/bg1.jpg"            
        alt="Hero background"
        fill                      
        priority                 
        sizes="100vw"             
        className="object-cover object-center"
      />



      {/* Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div className="max-w-3xl text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to PulseMail
          </h1>

          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90">
            Build modern apps with React, Next.js, and Tailwind!
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <a href="/auth" className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transition">
              Get Started
            </a>
            
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
