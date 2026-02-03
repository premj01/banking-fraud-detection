import { PrismaClient } from '@prisma/client'
import Graph from 'graphology'
// Custom simple cycle detector implemented below for better control and dependency minimization.
// We implement a robust DFS manually to ensure we catch the specific money loops.

const prisma = new PrismaClient()

export const GraphService = {
    // Build the graph from recent transactions
    async buildTransactionGraph(hours = 24) {
        const startTime = new Date(Date.now() - hours * 60 * 60 * 1000)

        // Fetch transactions with sender and receiver
        const transactions = await prisma.fraudTransaction.findMany({
            where: {
                transactionTimestamp: { gte: startTime },
                receiverAccountId: { not: null } // Only where we have a receiver
            },
            select: {
                transactionId: true,
                senderAccountId: true,
                senderUserName: true,
                receiverAccountId: true,
                receiverUserName: true,
                amountValue: true,
                transactionTimestamp: true
            }
        })

        const graph = new Graph({ multi: true, type: 'directed' })

        transactions.forEach(tx => {
            // Add Sender Node
            if (!graph.hasNode(tx.senderAccountId)) {
                graph.addNode(tx.senderAccountId, {
                    label: tx.senderUserName || 'Unknown',
                    type: 'sender'
                })
            }

            // Add Receiver Node
            if (!graph.hasNode(tx.receiverAccountId)) {
                graph.addNode(tx.receiverAccountId, {
                    label: tx.receiverUserName || 'Unknown',
                    type: 'receiver'
                })
            }

            // Add Edge
            graph.addEdge(tx.senderAccountId, tx.receiverAccountId, {
                id: tx.transactionId,
                amount: tx.amountValue,
                timestamp: tx.transactionTimestamp
            })
        })

        return graph
    },

    // Detect Cyclic Transactions (Money Loops)
    detectCycles(graph) {
        const cycles = []
        const visited = new Set()
        const recursionStack = new Set()
        const path = []

        function dfs(nodeId) {
            if (recursionStack.has(nodeId)) {
                // Cycle detected
                const cycleStartIndex = path.indexOf(nodeId)
                if (cycleStartIndex !== -1) {
                    cycles.push([...path.slice(cycleStartIndex), nodeId])
                }
                return
            }
            if (visited.has(nodeId)) return

            visited.add(nodeId)
            recursionStack.add(nodeId)
            path.push(nodeId)

            graph.forEachOutNeighbor(nodeId, (neighbor) => {
                dfs(neighbor)
            })

            recursionStack.delete(nodeId)
            path.pop()
        }

        graph.forEachNode((node) => {
            if (!visited.has(node)) {
                dfs(node)
            }
        })

        return cycles
    },

    // Detect Smurfing (High Fan-Out or Fan-In)
    detectSmurfing(graph, threshold = 3) {
        const suspiciousNodes = []

        graph.forEachNode((node, attributes) => {
            const outDegree = graph.outDegree(node)
            const inDegree = graph.inDegree(node)

            // Fan-Out: One sender -> Many receivers (Structuring/Smurfing Source)
            if (outDegree >= threshold) {
                suspiciousNodes.push({
                    node,
                    type: 'FAN_OUT',
                    degree: outDegree,
                    reason: `High Fan-Out: Sent money to ${outDegree} different accounts`,
                    neighbors: graph.outNeighbors(node)
                })
            }

            // Fan-In: Many senders -> One receiver (Smurfing Target/Mule)
            if (inDegree >= threshold) {
                suspiciousNodes.push({
                    node,
                    type: 'FAN_IN',
                    degree: inDegree,
                    reason: `High Fan-In: Received money from ${inDegree} different accounts`,
                    neighbors: graph.inNeighbors(node)
                })
            }
        })

        return suspiciousNodes
    },

    async analyzeGraphAndFlag() {
        const graph = await this.buildTransactionGraph(168) // Analyze last 7 days
        const cycles = this.detectCycles(graph)
        const smurfing = this.detectSmurfing(graph, 3) // Threshold 3 for demo

        // Prepare report
        const report = {
            totalNodes: graph.order,
            totalEdges: graph.size,
            cycles: cycles.map(cycle => ({
                path: cycle,
                description: `Cyclic transaction loop detected: ${cycle.join(' -> ')}`
            })),
            smurfing: smurfing
        }

        const exportedGraph = graph.export();
        return {
            graphData: {
                nodes: exportedGraph.nodes,
                links: exportedGraph.edges // force-graph expects 'links', graphology gives 'edges'
            },
            report: report
        }
    }
}
