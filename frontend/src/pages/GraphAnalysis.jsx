import { useEffect, useState, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import ForceGraph2D from "react-force-graph-2d";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Share2 } from "lucide-react";
import axios from "axios";
import socket from "@/lib/socket";

export default function GraphAnalysis() {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [report, setReport] = useState({ cycles: [], smurfing: [] });
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Use environment variable or default to localhost
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const res = await axios.get(`${API_URL}/graph/analyze`);

                const graphData = res.data?.graphData || { nodes: [], links: [] };
                // Ensure 'links' exists (map from 'edges' if present)
                if (!graphData.links && graphData.edges) {
                    graphData.links = graphData.edges;
                }
                setData(graphData);
                setReport(res.data?.report || { cycles: [], smurfing: [] });
            } catch (error) {
                console.error("Failed to fetch graph data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Real-time updates via Socket.IO
    useEffect(() => {
        // Ensure connection
        if (!socket.connected) {
            socket.connect();
        }

        const handleRealTimeStream = (payload) => {
            const { sender, receiver, transaction } = payload;

            // Only update graph if we have a valid receiver (edge)
            if (!receiver?.account_id) return;

            console.log("🔗 New Graph Link:", sender.user_name, "->", receiver.user_name);

            setData(prev => {
                // Clone to avoid mutation issues (though ForceGraph might mutate internal objects, we replace arrays)
                const newNodes = [...prev.nodes];
                const newLinks = [...prev.links];

                // Add Sender Node if sending for first time
                if (!newNodes.find(n => n.id === sender.account_id)) {
                    newNodes.push({
                        id: sender.account_id,
                        label: sender.user_name || 'Unknown',
                        type: 'sender'
                    });
                }

                // Add Receiver Node if receiving for first time
                if (!newNodes.find(n => n.id === receiver.account_id)) {
                    newNodes.push({
                        id: receiver.account_id,
                        label: receiver.user_name || 'Unknown',
                        type: 'receiver'
                    });
                }

                // Add Link
                // Check if link already exists (avoid duplicates if ID matches)
                if (!newLinks.find(l => l.id === transaction.transaction_id)) {
                    newLinks.push({
                        id: transaction.transaction_id,
                        source: sender.account_id,
                        target: receiver.account_id,
                        amount: transaction.amount_value,
                        timestamp: transaction.transaction_timestamp
                    });
                }

                return { nodes: newNodes, links: newLinks };
            });
        };

        socket.on('real-time-stream', handleRealTimeStream);

        return () => {
            socket.off('real-time-stream', handleRealTimeStream);
        };
    }, []);

    const navigate = useNavigate();
    const handleNodeClick = useCallback((node) => {
        // Navigate to Investigators page filter by this user ID (or Name)
        // We use the node.id which corresponds to accountId or similar
        // Or if node.label is the name, we can filter by that.
        // Let's pass the ID.
        console.log("Navigating to investigator view for:", node);
        navigate(`/investigators?id=${encodeURIComponent(node.id)}`);
    }, [navigate]);

    return (
        <DashboardLayout
            title="Graph Intelligence"
            subtitle="Detect complex money laundering patterns like cycles and layering"
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in h-[calc(100vh-12rem)]">

                {/* Left Panel: Suspicious Patterns List */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto">
                    {/* Smurfing / Structuring */}
                    <Card className="glass-card border-l-4 border-l-orange-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-orange-500" />
                                Smurfing / Structuring
                            </CardTitle>
                            <CardDescription>High fan-in or fan-out activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
                            ) : report.smurfing.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No suspicious structuring detected.</p>
                            ) : (
                                <div className="space-y-3">
                                    {report.smurfing.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 bg-secondary/30 rounded-md text-sm cursor-pointer hover:bg-secondary/50 transition-colors"
                                            onClick={() => navigate(`/investigators?id=${encodeURIComponent(item.node)}`)}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-semibold text-foreground">{item.node}</span>
                                                <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{item.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Cyclic Transactions */}
                    <Card className="glass-card border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Cyclic Transactions
                            </CardTitle>
                            <CardDescription>Money looping back to source (Layering)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <Loader2 className="animate-spin w-5 h-5 text-muted-foreground" />
                            ) : report.cycles.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No cyclic patterns detected.</p>
                            ) : (
                                <div className="space-y-3">
                                    {report.cycles.map((cycle, idx) => (
                                        <div key={idx} className="p-3 bg-destructive/10 rounded-md text-sm border border-destructive/20">
                                            <div className="flex items-center gap-2 mb-2 font-medium text-destructive">
                                                <Loader2 className="w-4 h-4 animate-spin-slow" /> Cycle Detected
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {cycle.path.map((nodeId, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="outline"
                                                        className="cursor-pointer hover:bg-destructive/20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/investigators?id=${encodeURIComponent(nodeId)}`);
                                                        }}
                                                    >
                                                        {nodeId}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Graph Visualization */}
                <div className="lg:col-span-2 glass-card rounded-xl overflow-hidden border border-border/50 relative" ref={containerRef}>
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Analyzing network topology...</p>
                            </div>
                        </div>
                    ) : (
                        <ForceGraph2D
                            width={containerRef.current ? containerRef.current.clientWidth : 800}
                            height={containerRef.current ? containerRef.current.clientHeight : 600}
                            graphData={data}
                            nodeLabel="id"
                            nodeColor={node => {
                                // Color nodes based on risk
                                if (report.cycles.some(c => c.path.includes(node.id))) return '#ef4444'; // Red for cycles
                                if (report.smurfing.some(s => s.node === node.id)) return '#f97316'; // Orange for smurfing
                                return '#3b82f6'; // Blue default
                            }}
                            nodeRelSize={6}
                            linkColor={() => '#94a3b8'}
                            linkDirectionalParticles={2}
                            linkDirectionalParticleSpeed={d => d.value * 0.001}
                            backgroundColor="#020817" // Matches app background usually
                            onNodeClick={handleNodeClick}
                        />
                    )}
                    <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur px-3 py-1 rounded text-xs text-muted-foreground border">
                        Interactive Network Map • Click node to investigate
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
