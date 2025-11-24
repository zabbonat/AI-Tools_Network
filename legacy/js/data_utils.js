// Shared Data Utilities

// IndexedDB Helper
const DB_NAME = 'AINetworkDB';
const DB_VERSION = 2;
const STORE_NAME = 'datasets';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => reject('Database error: ' + event.target.error);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
    });
}

async function saveToIndexedDB(data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // We'll store the whole dataset under a single key 'currentDataset'
        const request = store.put({ id: 'currentDataset', data: data });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

async function loadFromIndexedDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get('currentDataset');

        request.onsuccess = (event) => {
            if (event.target.result) {
                resolve(event.target.result.data);
            } else {
                resolve(null);
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// Simple CSV Parser
function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return []; // Header + at least one row

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const requiredColumns = ['architecture', 'year', 'field_id', 'field_name', 'publications'];

    // Check headers
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const row = [];
        let inQuote = false;
        let currentVal = '';
        for (let char of lines[i]) {
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                row.push(currentVal);
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        row.push(currentVal);

        if (row.length !== headers.length) continue; // Skip malformed rows

        const obj = {};
        headers.forEach((header, index) => {
            let val = row[index].trim().replace(/^"|"$/g, '');
            // Type conversion
            if (header === 'year' || header === 'publications' || header === 'field_id') {
                val = parseInt(val, 10);
            }
            obj[header] = val;
        });
        result.push(obj);
    }
    return result;
}
