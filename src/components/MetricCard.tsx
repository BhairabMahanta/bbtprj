import { StarIcon as star} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: star;
  title: string;
  value: string | number;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({ icon: Icon, title, value, description, onClick, className }: MetricCardProps) {
  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md bg-card text-card-foreground border-border',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-[3vw] md:p-[2vw] lg:p-[1.5vw]">
        <div className="flex items-start justify-between gap-[2vw]">
          <div className="flex-1 min-w-0">
            <p className="text-[clamp(0.75rem,2.5vw,0.875rem)] font-medium text-muted-foreground mb-[1vh]">{title}</p>
            <p className="text-[clamp(1.5rem,5vw,2rem)] font-bold font-headline text-foreground mb-[0.5vh] truncate">{value}</p>
            {description && <p className="text-[clamp(0.75rem,2.5vw,0.875rem)] text-muted-foreground">{description}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-[2vw] md:p-[1.5vw] lg:p-[0.75vw] flex-shrink-0">
            <Icon className="w-[5vw] h-[5vw] md:w-[3vw] md:h-[3vw] lg:w-[1.5vw] lg:h-[1.5vw] min-w-[24px] min-h-[24px] text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
