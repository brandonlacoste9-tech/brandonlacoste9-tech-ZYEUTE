# Orbital Physics Engine (Colony OS Mind)

## 🌌 Overview
This document defines the core logic for **OrbitalProp**, the sovereign intelligence engine of Colony OS. Unlike LLMs that predict the next token in a linear sequence, OrbitalProp maps concepts as nodes on a **Spherical Manifold** and applies "physics" (gravity, velocity) to find emergent clusters.

## 🧠 Core Philosophy
- **Manifold:** A 3D Unit Sphere ($x^2 + y^2 + z^2 = 1$).
- **Gravity:** Related concepts pull each other closer.
- **Time:** Thought occurs over **24 Cycles** of message passing.
- **Energy:** Activation levels decay over time to prevent noise.

## 🛠 Python Implementation Spec
This logic belongs in the Backend (`Colony OS`), likely in `app/mind/engine/orbital_physics.py`.

### 1. The Physics Class
```python
import math
from typing import Dict, List, Tuple
from app.mind.engine.graph_builder import SemanticGraph, OrbitalNode

class OrbitalPhysics:
    """
    The Laws of Thought: Applies gravity and velocity to semantic nodes
    to cluster related concepts on the spherical manifold.
    """
    
    def __init__(self, eta=0.06, cycles=24, decay=0.95):
        self.eta = eta        # Learning rate / Gravity strength
        self.cycles = cycles  # Time steps
        self.decay = decay    # Activation decay to prevent explosion

    def run_simulation(self, graph: SemanticGraph) -> SemanticGraph:
        """
        The Thinking Process: Runs the simulation loop.
        """
        print(f"🌌 Starting Orbital Simulation: {len(graph.nodes)} nodes, {self.cycles} cycles")
        
        for cycle in range(self.cycles):
            self._orbit_cycle(graph)
            
        return graph

    def _orbit_cycle(self, graph: SemanticGraph):
        # 1. Calculate Forces (Gravity between connected/similar nodes)
        updates = {} # Store position deltas
        
        for node_id, node in graph.nodes.items():
            force_vector = [0.0, 0.0, 0.0]
            
            # Pull from connected neighbors
            neighbors = self._get_neighbors(node_id, graph.edges)
            for neighbor_id in neighbors:
                neighbor = graph.nodes[neighbor_id]
                
                # Similarity = Cosine Distance
                sim = self._cosine_similarity(node.position, neighbor.position)
                
                # Gravity equation: Mass * Activation * Similarity
                gravity = neighbor.mass * neighbor.activation * sim * self.eta
                
                # Vector addition towards neighbor
                force_vector[0] += (neighbor.position[0] - node.position[0]) * gravity
                force_vector[1] += (neighbor.position[1] - node.position[1]) * gravity
                force_vector[2] += (neighbor.position[2] - node.position[2]) * gravity
            
            updates[node_id] = force_vector

        # 2. Update Positions & Activation
        for node_id, delta in updates.items():
            node = graph.nodes[node_id]
            
            # Update Position (Simple Euler integration)
            new_pos = [
                node.position[0] + delta[0],
                node.position[1] + delta[1],
                node.position[2] + delta[2]
            ]
            
            # Re-normalize to unit sphere (The Manifold Constraint)
            node.position = self._normalize(new_pos)
            
            # Decay energy
            node.activation *= self.decay

    def _get_neighbors(self, node_id: str, edges: List[dict]) -> List[str]:
        # Simple adjacency lookup
        return [e['target'] for e in edges if e['source'] == node_id] + \
               [e['source'] for e in edges if e['target'] == node_id]

    def _cosine_similarity(self, v1: Tuple, v2: Tuple) -> float:
        dot = v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2]
        return max(-1.0, min(1.0, dot)) # Clamp -1 to 1

    def _normalize(self, v: List[float]) -> Tuple[float, float, float]:
        mag = math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)
        if mag == 0: return (0, 0, 1) # Fail safe
        return (v[0]/mag, v[1]/mag, v[2]/mag)
```

## 🧪 Tuning Parameters

| Parameter | Value | Effect |
|-----------|-------|--------|
| `eta` | 0.06 | Higher = faster clustering, Lower = more stable |
| `cycles` | 24 | Sufficient for convergence without overfitting |
| `decay` | 0.95 | Prevents "runaway" activation energy |

## 🔗 Integration Guide

1.  **Input:** `GraphBuilder` creates the initial `SemanticGraph` (Nodes with random positions).
2.  **Process:** `OrbitalPhysics.run_simulation(graph)` applies the physics.
3.  **Output:** The nodes have moved. High-activation nodes clustered together represent the "Thought."

<!-- end list -->
