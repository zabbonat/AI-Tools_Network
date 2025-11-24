import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TemporalPlot = ({ data, selectedArch }) => {
    const chartData = useMemo(() => {
        if (!selectedArch || !data) return [];

        // Filter for the selected architecture
        const filtered = data.filter(d => d.architecture === selectedArch);

        // Aggregate publications by year
        const aggregated = filtered.reduce((acc, curr) => {
            const year = curr.year;
            if (!acc[year]) {
                acc[year] = 0;
            }
            acc[year] += curr.publications;
            return acc;
        }, {});

        // Convert to array and sort by year
        return Object.entries(aggregated)
            .map(([year, pubs]) => ({
                year: parseInt(year),
                publications: pubs
            }))
            .sort((a, b) => a.year - b.year);
    }, [data, selectedArch]);

    if (!selectedArch) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-64 bg-surface/95 backdrop-blur-sm border-t border-secondary/20 p-4 z-40 transition-transform duration-300 ease-in-out transform translate-y-0">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                <h3 className="text-sm font-bold text-primary mb-2">
                    Publication Trend: <span className="text-text-primary">{selectedArch}</span>
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
                                itemStyle={{ color: '#3b82f6' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="publications"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', r: 4 }}
                                activeDot={{ r: 6, fill: '#60a5fa' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default TemporalPlot;
