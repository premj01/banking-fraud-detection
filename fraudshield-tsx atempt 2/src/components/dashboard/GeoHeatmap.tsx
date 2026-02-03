import { cn } from "@/lib/utils";
import { GeoHeatmapData } from "@/types/fraud";

interface GeoHeatmapProps {
  data: GeoHeatmapData[];
  className?: string;
}

export function GeoHeatmap({ data, className }: GeoHeatmapProps) {
  const maxFraud = Math.max(...data.map(d => d.fraud_count));
  
  const getColor = (fraudCount: number) => {
    const intensity = fraudCount / maxFraud;
    if (intensity > 0.7) return 'bg-risk-high';
    if (intensity > 0.4) return 'bg-risk-medium';
    return 'bg-risk-low';
  };

  const getSize = (fraudCount: number) => {
    const intensity = fraudCount / maxFraud;
    if (intensity > 0.7) return 'w-4 h-4';
    if (intensity > 0.4) return 'w-3 h-3';
    return 'w-2 h-2';
  };

  // Simple India map representation with major cities positioned relatively
  const cityPositions: Record<string, { x: number; y: number }> = {
    'Mumbai': { x: 25, y: 55 },
    'Delhi': { x: 45, y: 25 },
    'Bangalore': { x: 35, y: 75 },
    'Pune': { x: 28, y: 58 },
    'Chennai': { x: 50, y: 78 },
    'Hyderabad': { x: 42, y: 62 },
    'Kolkata': { x: 75, y: 42 },
    'Ahmedabad': { x: 20, y: 42 },
    'Jaipur': { x: 35, y: 30 },
    'Lucknow': { x: 55, y: 32 },
  };

  return (
    <div className={cn("relative w-full h-[300px] bg-surface-2 rounded-lg overflow-hidden", className)}>
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} 
      />
      
      {/* Map outline (simplified) */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <path
          d="M30 10 L50 8 L70 15 L80 25 L85 40 L80 55 L75 70 L65 85 L50 90 L35 88 L25 80 L20 65 L15 50 L18 35 L25 20 Z"
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="0.5"
        />
      </svg>

      {/* City markers */}
      {data.map((city) => {
        const pos = cityPositions[city.city];
        if (!pos) return null;

        return (
          <div
            key={city.city}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Pulse effect for high-risk cities */}
            {city.fraud_count / maxFraud > 0.6 && (
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-75",
                getColor(city.fraud_count)
              )} />
            )}
            
            {/* City dot */}
            <div className={cn(
              "relative rounded-full transition-transform group-hover:scale-150",
              getSize(city.fraud_count),
              getColor(city.fraud_count)
            )} />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="glass-card px-3 py-2 rounded-lg text-xs whitespace-nowrap">
                <p className="font-medium">{city.city}</p>
                <p className="text-muted-foreground">
                  {city.fraud_count} flagged / {city.total_transactions.toLocaleString()} total
                </p>
                <p className="text-muted-foreground">
                  Risk: {(city.risk_score * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 glass-card px-3 py-2 rounded-lg">
        <p className="text-[10px] text-muted-foreground mb-2">Fraud Density</p>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-risk-low" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-risk-medium" />
            <span>Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-risk-high" />
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
