import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ data, filters }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(null);

    // Detect Firefox for specific fixes
    const isFirefox = typeof InstallTrigger !== 'undefined';

    // Show labels only when filtering by single arch or single field
    const showLabels = filters.selectedArch.length === 1 || filters.selectedField.length === 1;

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.d3Force('charge').strength(-100);
            graphRef.current.d3Force('link').distance(50);
        }
    }, []);

    // Track drag to prevent click during pan
    const handleNodeDragStart = () => {
        setIsDragging(true);
    };

    const handleNodeDragEnd = () => {
        setTimeout(() => setIsDragging(false), 100);
    };

    const handleNodeClick = (node, event) => {
        // Prevent zoom if dragging
        if (isDragging) return;

        // Just center on node, no tooltip
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(3, 1000);
    };

    return (
        <div className="fixed inset-0 bg-background z-0">
            <ForceGraph2D
                ref={graphRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={data}
                nodeLabel={showLabels ? (node => `${node.id}: ${node.val.toLocaleString()} publications`) : undefined}
                nodeColor={node => node.group === 'architecture' ? '#ef4444' : '#3b82f6'}
                nodeVal="val"
                linkColor={() => 'rgba(255,255,255,0.2)'}
                backgroundColor="#0f172a"
                onNodeClick={handleNodeClick}
                onNodeDragStart={handleNodeDragStart}
                onNodeDragEnd={handleNodeDragEnd}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = 12 / globalScale;

                    // Firefox-specific fix: save context state
                    if (isFirefox) {
                        ctx.save();
                    }

                    ctx.font = `${fontSize}px Sans-Serif`;
                    const textWidth = ctx.measureText(label).width;

                    // Draw circle - MUCH SMALLER (40x reduction)
                    const r = Math.sqrt(node.val) * 0.01 + 1; // 40x smaller

                    // Firefox-specific: explicit path operations
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.group === 'architecture' ? '#ef4444' : '#3b82f6';
                    ctx.fill();
                    ctx.closePath(); // Firefox fix: explicitly close path

                    // Draw label if zoomed in
                    if (globalScale > 1.5) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillText(label, node.x - textWidth / 2, node.y + r + fontSize);
                    }

                    // Firefox-specific fix: restore context state
                    if (isFirefox) {
                        ctx.restore();
                    }
                }}
            />
        </div>
    );
};

export default NetworkGraph;
