"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NODES, EDGES, type NodeDef, type EdgeDef } from "@/data/agentGraph";

function nodePos(id: string) {
  const n = NODES.find((node) => node.id === id);
  if (!n) return { x: 0, y: 0 };
  return { x: n.x, y: n.y };
}

function edgePath(e: EdgeDef): string {
  const a = nodePos(e.from);
  const b = nodePos(e.to);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 6;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
}

export default function AgentNodeGraph({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");

  return (
    <div
      role="img"
      aria-label="Diagram of Rafii's agent system: a Lead Agent connected to Agent Teams, Email Reactor and Mahoraga, with Memory and Council as downstream nodes."
      className={className}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ height: "clamp(170px,28vw,300px)" }}
        aria-hidden="true"
      >
        <defs>
          {EDGES.map((e, i) => (
            <path key={i} id={`${uid}-e-${i}`} d={edgePath(e)} fill="none" />
          ))}
        </defs>

        {/* edges */}
        {EDGES.map((e, i) => (
          <g key={i}>
            <path
              d={edgePath(e)}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.4"
              strokeDasharray={e.dashed ? "2 2" : undefined}
            />
            <motion.path
              d={edgePath(e)}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.35"
              strokeLinecap="round"
              initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 0.22 : 0 }}
              whileInView={{ pathLength: 1, opacity: 0.22 }}
              transition={{
                pathLength: {
                  delay: reduce ? 0 : 0.3 + i * 0.08,
                  duration: 0.9,
                  ease: [0.19, 1, 0.22, 1],
                },
                opacity: {
                  delay: reduce ? 0 : 0.3 + i * 0.08,
                  duration: 0.3,
                },
              }}
              viewport={{ once: true, margin: "-10% 0px" }}
            />
            {!reduce && (
              <circle r="0.9" fill="var(--color-accent)">
                <animateMotion
                  dur="1.6s"
                  begin={`${1.2 + i * 0.15}s`}
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.42 0 0.58 1"
                  keyTimes="0;1"
                >
                  <mpath href={`#${uid}-e-${i}`} />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;0.65;0.65;0"
                  dur="1.6s"
                  begin={`${1.2 + i * 0.15}s`}
                  repeatCount="indefinite"
                />
              </circle>
            )}
          </g>
        ))}

        {/* nodes on top */}
        {NODES.map((n: NodeDef, i: number) => (
          <motion.g
            key={n.id}
            initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{
              delay: reduce ? 0 : i * 0.07,
              duration: 0.5,
              ease: [0.19, 1, 0.22, 1],
              scale: { type: "spring", stiffness: 220, damping: 18 },
            }}
            viewport={{ once: true, margin: "-10% 0px" }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            {n.accent && (
              <circle
                cx={n.x}
                cy={n.y}
                r={(n.r ?? 11) + 3}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="0.3"
                opacity="0.3"
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r ?? 11}
              fill="var(--color-surface-2)"
              stroke={n.accent ? "var(--color-accent)" : "rgba(255,255,255,0.12)"}
              strokeWidth={n.accent ? 0.6 : 0.4}
            />
            <text
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="3.4"
              fontFamily="var(--font-mono)"
              fill={n.accent ? "var(--color-accent)" : "var(--color-dim)"}
            >
              {n.label}
            </text>
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
