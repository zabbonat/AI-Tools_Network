import Papa from 'papaparse';

export const REQUIRED_COLUMNS = ['architecture', 'year', 'field_id', 'field_name', 'publications'];

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                const { data, meta } = results;

                const missingColumns = REQUIRED_COLUMNS.filter(col => !meta.fields.includes(col));
                if (missingColumns.length > 0) {
                    reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
                    return;
                }

                if (data.length === 0) {
                    reject(new Error("No valid data found in CSV."));
                    return;
                }

                resolve(data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const processGraphData = (data, filters) => {
    const { yearStart, yearEnd, threshold, selectedArch, selectedField } = filters;

    const filteredData = data.filter(row => {
        if (row.publications === 0) return false;
        if (row.year < yearStart || row.year > yearEnd) return false;
        if (row.publications < threshold) return false;
        if (selectedArch.length > 0 && !selectedArch.includes(row.architecture)) return false;
        if (selectedField.length > 0 && !selectedField.includes(row.field_name)) return false;
        return true;
    });

    const nodesMap = new Map();
    const edgesMap = new Map();

    filteredData.forEach(row => {
        if (!nodesMap.has(row.architecture)) {
            nodesMap.set(row.architecture, {
                id: row.architecture,
                group: 'architecture',
                val: 0
            });
        }
        nodesMap.get(row.architecture).val += row.publications;

        if (!nodesMap.has(row.field_name)) {
            nodesMap.set(row.field_name, {
                id: row.field_name,
                group: 'field',
                val: 0
            });
        }
        nodesMap.get(row.field_name).val += row.publications;

        const edgeKey = `${row.architecture}|${row.field_name}`;
        if (!edgesMap.has(edgeKey)) {
            edgesMap.set(edgeKey, {
                source: row.architecture,
                target: row.field_name,
                value: 0
            });
        }
        edgesMap.get(edgeKey).value += row.publications;
    });

    return {
        nodes: Array.from(nodesMap.values()),
        links: Array.from(edgesMap.values())
    };
};

export const getUniqueArchitectures = (data) => {
    return Array.from(new Set(data.map(d => d.architecture))).sort();
};

export const getUniqueFields = (data) => {
    return Array.from(new Set(data.map(d => d.field_name))).sort();
};
