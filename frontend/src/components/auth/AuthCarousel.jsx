import { useState, useEffect } from "react";
import { LayoutDashboard } from "lucide-react";

const slides = [
    {
        image: "/carousel/slide1.png",
        text: "Banking Security Reimagined",
        subtext: "State-of-the-art encryption locking down your assets."
    },
    {
        image: "/carousel/slide2.png",
        text: "AI-Powered Fraud Detection",
        subtext: "Neural networks analyzing patterns in real-time."
    },
    {
        image: "/carousel/slide3.png",
        text: "Protected Payments",
        subtext: "Advanced shielding for every transaction you make."
    }
];

export function AuthCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative hidden h-[85%] w-[90%] flex-col bg-muted text-white lg:flex overflow-hidden rounded-[32px] m-auto shadow-2xl border border-white/10">
            <div className="absolute inset-0 bg-zinc-900" />

            {/* Background Images */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={slide.image}
                        alt="Security"
                        className="h-full w-full object-cover" // Ensure it covers the full height
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/40 to-transparent" />
                </div>
            ))}

            {/* Logo */}
            <div className="relative z-20 flex items-center p-10 text-lg font-medium">
                <LayoutDashboard className="mr-2 h-6 w-6" />
                FraudShield Inc
            </div>

            {/* Text Content */}
            <div className="relative z-20 mt-auto p-10">
                <div className="space-y-4 max-w-lg">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`transition-all duration-700 absolute bottom-10 left-10 right-10 ${index === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                                }`}
                        >
                            <h3 className="text-3xl font-bold tracking-tight mb-2 text-white">
                                {slide.text}
                            </h3>
                            <p className="text-lg text-zinc-300">
                                {slide.subtext}
                            </p>
                        </div>
                    ))}
                    {/* Spacer to keep layout stable since above is absolute */}
                    <div className="h-24"></div>
                </div>

                {/* Indicators */}
                <div className="flex gap-2 mt-6">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? "w-8 bg-white" : "w-1.5 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
