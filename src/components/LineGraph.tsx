import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LineGraphProps {
  data: Array<{ name: string; value: number }>;
  title: string;
}

export function LineGraph({ data, title }: LineGraphProps) {
  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="bg-gradient-1 rounded-t-lg p-[3vw] md:p-[2vw] lg:p-[1.5vw]">
        <CardTitle className="font-headline text-white text-[clamp(1rem,3vw,1.25rem)]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-[3vh] p-[3vw] md:p-[2vw] lg:p-[1.5vw]">
        <ResponsiveContainer width="100%" height={Math.max(250, window.innerHeight * 0.35)}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(176, 68%, 44%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(176, 68%, 44%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
            <XAxis dataKey="name" stroke="hsl(210, 10%, 40%)" />
            <YAxis stroke="hsl(210, 10%, 40%)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(210, 15%, 90%)',
                borderRadius: '0.5rem',
                color: 'hsl(222, 27%, 12%)'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(176, 68%, 44%)"
              strokeWidth={3}
              fill="url(#lineGradient)"
              dot={{ fill: 'hsl(176, 68%, 44%)', r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
