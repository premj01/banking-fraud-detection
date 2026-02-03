import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { cn } from "@/lib/utils";

const INDIA_TOPO_JSON = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const cityCoordinates = {
    'Mumbai': [72.8777, 19.0760],
    'Delhi': [77.1025, 28.7041],
    'Bangalore': [77.5946, 12.9716],
    'Pune': [73.8567, 18.5204],
    'Chennai': [80.2707, 13.0827],
    'Hyderabad': [78.4867, 17.3850],
    'Kolkata': [88.3639, 22.5726],
    'Ahmedabad': [72.5714, 23.0225],
    'Jaipur': [75.7873, 26.9124],
    'Lucknow': [80.9462, 26.8467],
    'Indore': [75.8577, 22.7196],
    'Patna': [85.1376, 25.5941],
    'Bhopal': [77.4126, 23.2599],
    'Ludhiana': [75.8573, 30.9010],
    'Agra': [78.0081, 27.1767],
    'Surat': [72.8311, 21.1702],
    'Nagpur': [79.0882, 21.1458],
    'Coimbatore': [76.9558, 11.0168],
    'Kochi': [76.2711, 9.9312],
    'Visakhapatnam': [83.2185, 17.6868]
};

export function GeoHeatmap({ data, className }) {
    const [tooltipContent, setTooltipContent] = useState(null);
    const maxFraud = Math.max(...data.map(d => d.fraud_count), 1); // Avoid division by zero

    const colorScale = scaleLinear()
        .domain([0, maxFraud])
        .range(["#10b981", "#ef4444"]);

    const getSize = (fraudCount) => {
        const intensity = fraudCount / maxFraud;
        return 4 + (intensity * 10); // Base size 4, max size 14
    };

    const getMarkerColor = (fraudCount) => {
        return fraudCount > 0 ? colorScale(fraudCount) : "#10b981";
    };

    return (
        <div className={cn("relative w-full h-[500px] bg-card rounded-lg overflow-hidden border border-border/50 flex flex-col items-center justify-center", className)}>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 1200,
                    center: [78.9629, 22.5937] // Center of India
                }}
                className="w-full h-full"
            >
                <Geographies geography={INDIA_TOPO_JSON}>
                    {({ geographies }) =>
                        geographies.map((geo) => {
                            // Filter for India (ID 356) to show only India borders
                            // Or render all if you prefer context. 
                            // 356 is ISO numeric code for India.
                            const isIndia = String(geo.id) === "356";
                            return (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={isIndia ? "hsl(var(--muted))" : "#e5e5e5"}
                                    stroke="hsl(var(--border))"
                                    strokeWidth={isIndia ? 0.8 : 0.2}
                                    style={{
                                        default: { outline: "none", display: isIndia ? "block" : "none" }, // Hide non-India for cleaner look
                                        hover: { fill: isIndia ? "hsl(var(--accent))" : "#e5e5e5", outline: "none" },
                                        pressed: { outline: "none" },
                                    }}
                                />
                            );
                        })
                    }
                </Geographies>

                {data.map((city) => {
                    const coords = cityCoordinates[city.city];
                    if (!coords) return null;

                    return (
                        <Marker
                            key={city.city}
                            coordinates={coords}
                            onMouseEnter={() => {
                                setTooltipContent({
                                    city: city.city,
                                    fraud: city.fraud_count,
                                    total: city.total_transactions || 0,
                                    risk: (city.risk_score * 100).toFixed(0)
                                });
                            }}
                            onMouseLeave={() => {
                                setTooltipContent(null);
                            }}
                        >
                            {/* Pulse for high risk */}
                            {(city.fraud_count / maxFraud) > 0.5 && (
                                <circle
                                    r={getSize(city.fraud_count) * 1.5}
                                    fill={getMarkerColor(city.fraud_count)}
                                    opacity={0.3}
                                    className="animate-ping"
                                />
                            )}
                            <circle
                                r={getSize(city.fraud_count)}
                                fill={getMarkerColor(city.fraud_count)}
                                stroke="#fff"
                                strokeWidth={1}
                                className="cursor-pointer transition-all hover:scale-125"
                            />
                        </Marker>
                    );
                })}
            </ComposableMap>

            {/* Tooltip Overlay */}
            {tooltipContent && (
                <div className="absolute top-4 right-4 z-10 bg-popover/90 backdrop-blur border border-border px-4 py-3 rounded-lg shadow-lg text-sm animate-in fade-in slide-in-from-top-2 pointer-events-none">
                    <p className="font-semibold text-lg mb-1">{tooltipContent.city}</p>
                    <div className="space-y-1 text-muted-foreground">
                        <div className="flex justify-between gap-4">
                            <span>Flagged:</span>
                            <span className="font-medium text-foreground">{tooltipContent.fraud}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>Total Txns:</span>
                            <span className="font-medium text-foreground">{tooltipContent.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span>Risk Score:</span>
                            <span className={`font-medium ${Number(tooltipContent.risk) > 50 ? 'text-red-500' : 'text-green-500'}`}>
                                {tooltipContent.risk}%
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur px-3 py-2 rounded-lg border border-border/50 text-xs">
                <p className="font-medium mb-2">Fraud Intensity</p>
                <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full" style={{ background: `linear-gradient(to right, #10b981, #ef4444)` }} />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                </div>
            </div>
        </div>
    );
}
