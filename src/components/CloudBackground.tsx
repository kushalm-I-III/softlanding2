"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function CloudBackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax offsets – tuned for an interactive feel
  const layer1 = scrollY * 0.25;
  const layer2 = scrollY * 0.4;
  const layer3 = scrollY * 0.55;
  const layer4 = scrollY * 0.35;
  const layer5 = scrollY * 0.18;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50"
    >
      {/* soft glow behind clouds */}
      <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-sky-100/80 blur-3xl" />
      <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl" />

      {/* top-corner clouds */}
      <div
        className="absolute left-[-40px] top-[-10px] h-40 w-72"
        style={{
          transform: `translateX(${layer5 * 0.4}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={260}
          height={160}
          className="h-full w-full object-contain opacity-85"
        />
      </div>
      <div
        className="absolute right-[-40px] top-[-10px] h-40 w-72"
        style={{
          transform: `translateX(${-layer5 * 0.4}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={260}
          height={160}
          className="h-full w-full object-contain opacity-85"
        />
      </div>

      {/* left cloud image group */}
      <div
        className="absolute left-[-180px] top-40 h-64 w-96"
        style={{
          transform: `translateX(${layer1}px) translateY(${layer1 * 0.1}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={320}
          height={200}
          className="h-full w-full object-contain opacity-90"
        />
      </div>

      {/* mid-left small cloud */}
      <div
        className="absolute left-[-60px] top-[60%] h-40 w-72"
        style={{
          transform: `translateX(${layer4 * 0.7}px) translateY(${layer4 * 0.05}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={260}
          height={160}
          className="h-full w-full object-contain opacity-75"
        />
      </div>

      {/* center-top small drifting cloud */}
      <div
        className="absolute left-1/2 top-16 h-36 w-72 -translate-x-1/2"
        style={{
          transform: `translateX(${layer5 * 0.5}px) translateY(${layer5 * 0.1}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={260}
          height={160}
          className="h-full w-full object-contain opacity-80"
        />
      </div>

      {/* right cloud image group */}
      <div
        className="absolute right-[-160px] top-56 h-64 w-96"
        style={{
          transform: `translateX(${-layer2}px) translateY(${layer2 * 0.08}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={320}
          height={200}
          className="h-full w-full object-contain opacity-90"
        />
      </div>

      {/* mid-right extra cloud */}
      <div
        className="absolute right-[-40px] top-[65%] h-44 w-80"
        style={{
          transform: `translateX(${-layer2 * 0.5}px) translateY(${layer2 * 0.03}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={260}
          height={160}
          className="h-full w-full object-contain opacity-78"
        />
      </div>

      {/* lower horizon clouds */}
      <div
        className="absolute left-[-100px] bottom-[-40px] h-56 w-96"
        style={{
          transform: `translateX(${layer3 * 0.6}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={320}
          height={200}
          className="h-full w-full object-contain opacity-85"
        />
      </div>
      <div
        className="absolute right-[-120px] bottom-[-48px] h-56 w-96"
        style={{
          transform: `translateX(${-layer3 * 0.6}px)`,
        }}
      >
        <Image
          src="/cloud1.png"
          alt=""
          width={320}
          height={200}
          className="h-full w-full object-contain opacity-85"
        />
      </div>
    </div>
  );
}

