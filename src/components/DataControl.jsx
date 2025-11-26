import React, { useState } from 'react';
import { Upload, Filter, Activity, X, Menu } from 'lucide-react';

const DataControl = ({
    onFileUpload,
    filters,
    setFilters,
    stats,
    architectures,
    fields,
    isLoading
}) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            onFileUpload(e.target.files[0]);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 bg-surface border border-secondary/20 rounded-lg text-text-primary hover:bg-surface/80 transition-colors"
            >
                <Menu size={20} />
            </button>
        );
    }

    return (
        <div className="fixed top-0 left-0 h-full w-60 bg-surface/95 backdrop-blur-sm border-r border-secondary/20 p-4 z-50 overflow-y-auto transition-transform">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-bold text-primary flex items-center gap-2">
                    <Activity size={20} />
                    Network
                </h1>
                <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
                    <X size={18} />
                </button>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
                <h2 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">Data Source</h2>
                <div
                    className="border-2 border-dashed border-secondary/40 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        type="file"
                        id="file-input"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileSelect}
                    />
                    <Upload className="mx-auto mb-2 text-text-secondary group-hover:text-primary transition-colors" size={20} />
                    <p className="text-xs text-text-secondary group-hover:text-text-primary">
                        {isLoading ? 'Processing...' : 'Drop CSV or Click'}
                    </p>
                </div>
                <p className="text-[10px] text-text-secondary mt-2 text-center">
                    Required columns: <span className="font-mono text-primary">architecture, year, field_name, publications</span>
                </p>
            </div>

            {/* Stats Section */}
            <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="bg-background/50 p-2 rounded-lg border border-secondary/20">
                    <div className="text-xs text-text-secondary mb-1">Nodes</div>
                    <div className="text-lg font-mono font-bold text-primary">{stats.nodes}</div>
                </div>
                <div className="bg-background/50 p-2 rounded-lg border border-secondary/20">
                    <div className="text-xs text-text-secondary mb-1">Edges</div>
                    <div className="text-lg font-mono font-bold text-primary">{stats.edges}</div>
                </div>
            </div>

            {/* Download Button */}
            <button
                onClick={() => {
                    if (window.downloadFilteredData) {
                        window.downloadFilteredData();
                    }
                }}
                className="w-full mb-6 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
            </button>

            {/* Filters Section */}
            <div className="space-y-4">
                <h2 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Filter size={14} />
                    Filters
                </h2>

                {/* Eras */}
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Eras</label>
                    <div className="grid grid-cols-1 gap-1">
                        <button
                            onClick={() => setFilters({ ...filters, yearStart: 2000, yearEnd: 2013 })}
                            className="px-2 py-1 bg-secondary/20 hover:bg-primary/20 text-xs text-text-primary rounded text-left transition-colors border border-transparent hover:border-primary/30"
                        >
                            Classical (2000-2013)
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, yearStart: 2014, yearEnd: 2017 })}
                            className="px-2 py-1 bg-secondary/20 hover:bg-primary/20 text-xs text-text-primary rounded text-left transition-colors border border-transparent hover:border-primary/30"
                        >
                            Deep Learning (2014-2017)
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, yearStart: 2017, yearEnd: 2024 })}
                            className="px-2 py-1 bg-secondary/20 hover:bg-primary/20 text-xs text-text-primary rounded text-left transition-colors border border-transparent hover:border-primary/30"
                        >
                            Generative (2017-2024)
                        </button>
                    </div>
                </div>

                {/* Year Range */}
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Year Range</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            value={filters.yearStart}
                            onChange={(e) => setFilters({ ...filters, yearStart: parseInt(e.target.value) })}
                            className="w-full bg-background border border-secondary/20 rounded px-2 py-1 text-xs text-text-primary focus:border-primary outline-none"
                        />
                        <span className="text-text-secondary text-xs">-</span>
                        <input
                            type="number"
                            value={filters.yearEnd}
                            onChange={(e) => setFilters({ ...filters, yearEnd: parseInt(e.target.value) })}
                            className="w-full bg-background border border-secondary/20 rounded px-2 py-1 text-xs text-text-primary focus:border-primary outline-none"
                        />
                    </div>
                </div>

                {/* Threshold */}
                <div>
                    <label className="block text-xs text-text-secondary mb-1">
                        Min Publications: <span className="text-primary font-mono">{filters.threshold}</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={filters.threshold}
                        onChange={(e) => setFilters({ ...filters, threshold: parseInt(e.target.value) })}
                        className="w-full accent-primary h-1 bg-secondary/30 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Architecture Filter - CHECKBOXES */}
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Architecture</label>
                    <div className="bg-background border border-secondary/20 rounded px-2 py-2 max-h-32 overflow-y-auto space-y-1">
                        {architectures.map(arch => (
                            <label key={arch} className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 px-1 py-0.5 rounded">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedArch.includes(arch)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilters({ ...filters, selectedArch: [...filters.selectedArch, arch] });
                                        } else {
                                            setFilters({ ...filters, selectedArch: filters.selectedArch.filter(a => a !== arch) });
                                        }
                                    }}
                                    className="accent-primary w-3 h-3"
                                />
                                <span className="text-xs text-text-primary">{arch}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Field Filter - CHECKBOXES */}
                <div>
                    <label className="block text-xs text-text-secondary mb-1">Field</label>
                    <div className="bg-background border border-secondary/20 rounded px-2 py-2 max-h-32 overflow-y-auto space-y-1">
                        {fields.map(field => (
                            <label key={field} className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 px-1 py-0.5 rounded">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedField.includes(field)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFilters({ ...filters, selectedField: [...filters.selectedField, field] });
                                        } else {
                                            setFilters({ ...filters, selectedField: filters.selectedField.filter(f => f !== field) });
                                        }
                                    }}
                                    className="accent-primary w-3 h-3"
                                />
                                <span className="text-xs text-text-primary">{field}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataControl;
