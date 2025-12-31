import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriceHistoryPoint {
    date: string;
    price: number;
}

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
}

export function PriceHistoryChart({ data }: PriceHistoryChartProps) {
    if (!data || data.length === 0) return null;

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Price History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [`$${value}`, "Price"]}
                                labelStyle={{ color: "black" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
