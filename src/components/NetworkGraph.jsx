import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ data, filters }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    // Firefox canvas fix
    const isFirefox = typeof InstallTrigger !== 'undefined';

    // Show labels only when zoomed enough (optional)
    const showLabels = filters.selectedArch.length === 1 || filters.selectedField.length === 1;

    // Resize handler
    useEffect(() => {
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Force‑graph forces
    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3Force('charge').strength(-100);
            graphRef.current.d3Force('link').distance(50);
        }
    }, []);

    // Tooltip (built‑in)
    const nodeLabel = node => `${node.id}: ${node.val.toLocaleString()} publications`;

    // Reduce hit area to avoid accidental node selection when many nodes are close
    const nodePointerAreaPaint = (node, color, ctx) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, 2 * Math.PI, false); // tiny invisible circle
        ctx.fillStyle = color;
        ctx.fill();
    };

    return (
        <div className="fixed inset-0 bg-background z-0">
            <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeLabel={nodeLabel}
                nodeColor={node => (node.group === 'architecture' ? '#ef4444' : '#3b82f6')}
                nodeVal="val"
                linkColor={() => 'rgba(255,255,255,0.2)'}
                backgroundColor="#0f172a"
                enableZoomPanInteraction={true}
                enableNodeDrag={true}
                // Prevent default zoom‑on‑click and stop propagation
                onNodeClick={(node, event) => { if (event) event.stopPropagation(); }}
                onNodeHover={() => { }}
                onBackgroundClick={() => { }}
                nodePointerAreaPaint={nodePointerAreaPaint}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = 12 / globalScale;

                    if (isFirefox) ctx.save();

                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;

                    const r = Math.sqrt(node.val) * 0.01 + 1;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.group === 'architecture' ? '#ef4444' : '#3b82f6';
                    ctx.fill();
                    ctx.closePath();

                    if (globalScale > 1.5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(label, node.x - textWidth / 2, node.y + r + fontSize);
                    }

                    if (isFirefox) ctx.restore();
                }}
            />
        </div>
    );
};

export default NetworkGraph;
