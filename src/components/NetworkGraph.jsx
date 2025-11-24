import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ data, filters }) => {
    const graphRef = useRef();
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const mouseDownPos = useRef(null);

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

    // Track mouse position to detect pan vs click
    useEffect(() => {
        const handleMouseDown = (e) => {
            mouseDownPos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            mouseDownPos.current = null;
        };

        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleNodeClick = (node, event) => {
        // Check if mouse moved more than 5px (indicates drag/pan, not click)
        if (mouseDownPos.current) {
            const dx = Math.abs(event.clientX - mouseDownPos.current.x);
            const dy = Math.abs(event.clientY - mouseDownPos.current.y);
            if (dx > 5 || dy > 5) {
                return; // Was a drag, not a click
            }
        }

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
