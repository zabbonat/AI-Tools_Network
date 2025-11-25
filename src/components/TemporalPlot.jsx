import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TemporalPlot = ({ data, selectedArches, selectedFields }) => {
    const { chartData, lines } = useMemo(() => {
        if (!data || (selectedArches.length === 0 && selectedFields.length === 0)) {
            return { chartData: [], lines: [] };
        }

        let activeFields = [];
        let filterByArch = false;

        // Logic 1: Arch selected, Field NOT selected -> Show all fields for that Arch
        if (selectedArches.length > 0 && selectedFields.length === 0) {
            // Find all fields present in the data for the selected architectures
            const relevantFields = new Set();
            data.forEach(d => {
                if (selectedArches.includes(d.architecture)) {
                    relevantFields.add(d.field_name);
                }
            });
            activeFields = Array.from(relevantFields).sort();
            filterByArch = true;
        }
        // Logic 2: Field selected (Arch optional) -> Show selected fields
        else if (selectedFields.length > 0) {
            activeFields = selectedFields;
            // If Arch is ALSO selected, we will filter by it
            if (selectedArches.length > 0) {
                filterByArch = true;
            }
        }

        // Generate Series
        const seriesMap = {};
        const allYears = new Set();
        const linesConfig = [];

        // Colors
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#06b6d4'
        ];
        let colorIdx = 0;

        activeFields.forEach(field => {
            // Filter data
            const filtered = data.filter(d => {
                if (d.field_name !== field) return false;
                if (filterByArch && !selectedArches.includes(d.architecture)) return false;
                return true;
            });

            // Aggregate by year
            const aggregated = filtered.reduce((acc, curr) => {
                const year = curr.year;
                acc[year] = (acc[year] || 0) + curr.publications;
                return acc;
            }, {});

            seriesMap[field] = aggregated;
            Object.keys(aggregated).forEach(y => allYears.add(parseInt(y)));
            linesConfig.push({ key: field, color: colors[colorIdx++ % colors.length] });
        });

        // Create merged data array
        const sortedYears = Array.from(allYears).sort((a, b) => a - b);
        const mergedData = sortedYears.map(year => {
            const entry = { year };
            linesConfig.forEach(line => {
                entry[line.key] = seriesMap[line.key][year] || 0;
            });
            return entry;
        });

        return { chartData: mergedData, lines: linesConfig };
    }, [data, selectedArches, selectedFields]);

    if (selectedArches.length === 0 && selectedFields.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-72 bg-surface/95 backdrop-blur-sm border-t border-secondary/20 p-4 z-40 transition-transform duration-300 ease-in-out transform translate-y-0">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <h3 className="text-sm font-bold text-primary mb-2">
                    {selectedArches.length > 0 && selectedFields.length === 0
                        ? `Field Breakdown for: ${selectedArches.join(', ')}`
                        : 'Field Trends'}
                </h3>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="year"
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#94a3b8"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#e2e8f0' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            {lines.map(line => (
                                <Line
                                    key={line.key}
                                    type="monotone"
                                    dataKey={line.key}
                                    stroke={line.color}
                                    strokeWidth={2}
                                    dot={{ fill: line.color, r: 3 }}
                                    activeDot={{ r: 5, fill: line.color }}
                                    connectNulls
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TemporalPlot;
