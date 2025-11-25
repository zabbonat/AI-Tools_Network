import React, { useState, useEffect, useMemo } from 'react';
import NetworkGraph from './components/NetworkGraph';
import DataControl from './components/DataControl';
import TemporalPlot from './components/TemporalPlot';
import { parseCSV, processGraphData, getUniqueArchitectures, getUniqueFields } from './utils/dataProcessing';

function App() {
  const [rawData, setRawData] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    yearStart: 2000,
    yearEnd: 2025,
    threshold: 0,
    selectedArch: [],
    selectedField: []
  });

  // Load default data on mount
  useEffect(() => {
    const loadDefault = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}checkpoint.csv`);
        if (response.ok) {
          const text = await response.text();
          const data = await parseCSV(text);
          setRawData(data);
        }
      } catch (error) {
        console.error("Failed to load default data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDefault();
  }, []);

  // Process data when rawData or filters change
  useEffect(() => {
    if (rawData.length > 0) {
      const processed = processGraphData(rawData, filters);
      setGraphData(processed);
    }
  }, [rawData, filters]);

  const architectures = useMemo(() => getUniqueArchitectures(rawData), [rawData]);
  const fields = useMemo(() => getUniqueFields(rawData), [rawData]);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    try {
      const data = await parseCSV(file);
      setRawData(data);
    } catch (error) {
      alert("Error parsing CSV: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = {
    nodes: graphData.nodes.length,
    edges: graphData.links.length
  };

  // Download filtered data
  const downloadFilteredData = () => {
    const { yearStart, yearEnd, threshold, selectedArch, selectedField } = filters;

    const filteredData = rawData.filter(row => {
      if (row.publications === 0) return false;
      if (row.year < yearStart || row.year > yearEnd) return false;
      if (row.publications < threshold) return false;
      if (selectedArch.length > 0 && !selectedArch.includes(row.architecture)) return false;
      if (selectedField.length > 0 && !selectedField.includes(row.field_name)) return false;
      return true;
    });

    // Convert to CSV
    const headers = ['architecture', 'year', 'field_id', 'field_name', 'publications'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row =>
        headers.map(h => `"${row[h]}"`).join(',')
      )
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Expose download function globally for DataControl button
  useEffect(() => {
    window.downloadFilteredData = downloadFilteredData;
    return () => {
      delete window.downloadFilteredData;
    };
  }, [rawData, filters]);

  return (
    <div className="w-full h-screen bg-background text-text-primary overflow-hidden">
      <NetworkGraph data={graphData} filters={filters} />
      <DataControl
        onFileUpload={handleFileUpload}
        filters={filters}
        setFilters={setFilters}
        stats={stats}
        architectures={architectures}
        fields={fields}
        isLoading={isLoading}
      />

      <TemporalPlot
        data={rawData}
        selectedArches={filters.selectedArch}
        selectedFields={filters.selectedField}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="text-primary text-xl font-mono animate-pulse">Processing Data...</div>
        </div>
      )}
    </div>
  );
}

export default App;
