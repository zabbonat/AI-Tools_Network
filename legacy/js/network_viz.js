// Network Visualization Logic

// Network instance
let network = null;
let nodes = null;
let edges = null;
let allData = [];
let isPhysicsEnabled = true;

// DOM Elements
const totalPubsEl = document.getElementById('total-publications');
const activeNodesEl = document.getElementById('active-nodes');
const connectionsEl = document.getElementById('connections-count');
const yearStartInput = document.getElementById('year-start');
const yearEndInput = document.getElementById('year-end');
const yearStart = parseInt(yearStartInput.value) || 2000;
const yearEnd = parseInt(yearEndInput.value) || 2025;
const threshold = parseInt(thresholdInput.value) || 0;
const selectedArch = archFilterSelect.value;

// Filter Data
const filteredData = allData.filter(row => {
    const year = parseInt(row.year);
    const pubs = parseInt(row.publications);

    if (year < yearStart || year > yearEnd) return false;
    if (pubs < threshold) return false;
    if (selectedArch && row.architecture !== selectedArch) return false;

    return true;
});

// Transform to Nodes and Edges
// Nodes: Architectures and Fields
const architectureMap = new Map(); // Name -> {id, value (pubs)}
const fieldMap = new Map(); // Name -> {id, value (pubs)}
const edgesMap = new Map(); // "Arch|Field" -> value (pubs)

let nodeIdCounter = 1;

filteredData.forEach(row => {
    // Architecture Node
    if (!architectureMap.has(row.architecture)) {
        architectureMap.set(row.architecture, {
            id: nodeIdCounter++,
            label: row.architecture,
            group: 'architecture',
            value: 0
        });
    }
    architectureMap.get(row.architecture).value += row.publications;

    // Field Node
    if (!fieldMap.has(row.field_name)) {
        fieldMap.set(row.field_name, {
            id: nodeIdCounter++,
            label: row.field_name,
            group: 'field',
            value: 0
        });
    }
    fieldMap.get(row.field_name).value += row.publications;

    // Edge
    const edgeKey = `${row.architecture}|${row.field_name}`;
    if (!edgesMap.has(edgeKey)) {
        edgesMap.set(edgeKey, 0);
    }
    edgesMap.set(edgeKey, edgesMap.get(edgeKey) + row.publications);
});

// Convert to Vis.js format
const visNodes = [];
const visEdges = [];

architectureMap.forEach(node => {
    visNodes.push({
        id: node.id,
        label: node.label,
        group: 'architecture',
        value: node.value,
        title: `${node.label}: ${node.value} publications`
    });
});

fieldMap.forEach(node => {
    visNodes.push({
        id: node.id,
        label: node.label,
        group: 'field',
        value: node.value,
        title: `${node.label}: ${node.value} publications`
    });
});

edgesMap.forEach((value, key) => {
    const [archName, fieldName] = key.split('|');
    const archId = architectureMap.get(archName).id;
    const fieldId = fieldMap.get(fieldName).id;

    visEdges.push({
        from: archId,
        to: fieldId,
        value: value,
        title: `${value} publications shared`
    });
});

// Populate Architecture Filter if empty (first run)
if (archFilterSelect.options.length <= 1) {
    const architectures = Array.from(new Set(allData.map(d => d.architecture))).sort();
    architectures.forEach(arch => {
        const option = document.createElement('option');
        option.value = arch;

        const data = { nodes, edges };

        const options = {
            nodes: {
                shape: 'dot',
                scaling: {
                    min: 10,
                    max: 40,
                    label: {
                        enabled: true,
                        min: 12,
                        max: 20
                    }
                },
                font: {
                    size: 14,
                    color: '#ffffff',
                    face: 'Inter'
                },
                borderWidth: 2,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.3)',
                    size: 10,
                    x: 2,
                    y: 2
                }
            },
            edges: {
                width: 2,
                color: {
                    color: 'rgba(255, 255, 255, 0.2)',
                    highlight: 'rgba(255, 75, 75, 0.6)',
                    hover: 'rgba(77, 171, 247, 0.6)'
                },
                smooth: {
                    type: 'continuous'
                },
                scaling: {
                    min: 1,
                    max: 8
                }
            },
            groups: {
                architecture: {
                    color: {
                        background: '#ff4b4b',
                        border: '#ff3333',
                        highlight: {
                            background: '#ff6b6b',
                            border: '#ff4b4b'
                        }
                    }
                },
                field: {
                    color: {
                        background: '#4dabf7',
                        border: '#339af0',
                        highlight: {
                            background: '#74c0fc',
                            border: '#4dabf7'
                        }
                    }
                }
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -8000,
                    centralGravity: 0.3,
                    springLength: 150,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.1
                },
                stabilization: {
                    enabled: true,
                    iterations: 200,
                    updateInterval: 25
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 100,
                zoomView: true,
                dragView: true,
                dragNodes: true
            }
        };

        if (network) {
            network.destroy();
        }

        network = new vis.Network(container, data, options);

        // Disable physics after stabilization to save resources
        network.on('stabilizationIterationsDone', function () {
            network.setOptions({ physics: false });
            isPhysicsEnabled = false;
        });
    }

// Update statistics display
function updateStatistics(visNodes, visEdges) {
            const totalPubs = visNodes.reduce((sum, node) => sum + node.value, 0);
            const totalPubsArch = visNodes.filter(n => n.group === 'architecture').reduce((sum, n) => sum + n.value, 0);

            const activeNodesCount = visNodes.length;
            const connectionsCount = visEdges.length;

            totalPubsEl.textContent = totalPubsArch.toLocaleString('en-US');
            activeNodesEl.textContent = activeNodesCount.toLocaleString('en-US');
            connectionsEl.textContent = connectionsCount.toLocaleString('en-US');
        }

// Event Listeners
document.getElementById('center-network-btn').addEventListener('click', () => {
            if (network) {
                network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
            }
        });

    document.getElementById('fit-network-btn').addEventListener('click', () => {
        if (network) {
            network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
        }
    });

    document.getElementById('refresh-data-btn').addEventListener('click', () => {
        showLoader();
        setTimeout(() => {
            hideLoader();
            processDataAndDraw(); // Re-apply filters
        }, 1000);
    });

    // Filter Listeners
    yearStartInput.addEventListener('change', processDataAndDraw);
    yearEndInput.addEventListener('change', processDataAndDraw);
    thresholdInput.addEventListener('input', (e) => {
        thresholdValueEl.textContent = e.target.value;
    });
    thresholdInput.addEventListener('change', processDataAndDraw);
    archFilterSelect.addEventListener('change', processDataAndDraw);

    document.getElementById('toggle-sidebar-btn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('sidebar-mobile');
        sidebar.classList.toggle('open');
    });

    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.add('sidebar-mobile');
        sidebar.classList.toggle('open');
    });

    // Loader functions
    function showLoader() {
        loaderOverlay.style.display = 'flex';
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            loadingPercentage.textContent = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
            }
        }, 100);
    }

    function hideLoader() {
        loaderOverlay.style.display = 'none';
        loadingPercentage.textContent = '0%';
    }

    // Initialize on load
    window.addEventListener('load', () => {
        showLoader();
        setTimeout(() => {
            hideLoader();
            initNetwork();
        }, 1000);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (network && window.innerWidth >= 768) {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('sidebar-mobile', 'open');
        }
    });
