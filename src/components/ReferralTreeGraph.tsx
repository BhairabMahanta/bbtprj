import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, TrendingUpIcon } from 'lucide-react';

interface ReferralTreeGraphProps {
  title?: string;
}

export function ReferralTreeGraph({ title = 'Referral Network' }: ReferralTreeGraphProps) {
  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader className="p-[3vw] md:p-[2vw] lg:p-[1.5vw]">
        <CardTitle className="font-headline text-foreground text-[clamp(1rem,3vw,1.25rem)]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-[3vw] md:p-[2vw] lg:p-[1.5vw]">
        <div className="relative h-[40vh] md:h-[45vh] lg:h-[50vh] bg-neutral rounded-lg overflow-hidden">
          <img
            src="https://c.animaapp.com/mh24xt4khAF0wm/img/ai_1.png"
            alt="Referral tree network"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-[3vw] md:p-[2vw]">
            <div className="flex flex-col sm:flex-row gap-[2vw] md:gap-[3vw] w-full">
              <div className="flex items-center gap-[2vw] md:gap-[1vw] bg-card/90 px-[3vw] md:px-[2vw] py-[1.5vh] rounded-lg flex-1">
                <UsersIcon className="w-[5vw] h-[5vw] md:w-[2vw] md:h-[2vw] lg:w-[1.25vw] lg:h-[1.25vw] min-w-[20px] min-h-[20px] text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[clamp(0.625rem,2vw,0.75rem)] text-muted-foreground">Total Network</p>
                  <p className="text-[clamp(1rem,3vw,1.125rem)] font-bold text-foreground">1,247</p>
                </div>
              </div>
              <div className="flex items-center gap-[2vw] md:gap-[1vw] bg-card/90 px-[3vw] md:px-[2vw] py-[1.5vh] rounded-lg flex-1">
                <TrendingUpIcon className="w-[5vw] h-[5vw] md:w-[2vw] md:h-[2vw] lg:w-[1.25vw] lg:h-[1.25vw] min-w-[20px] min-h-[20px] text-success flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[clamp(0.625rem,2vw,0.75rem)] text-muted-foreground">Growth Rate</p>
                  <p className="text-[clamp(1rem,3vw,1.125rem)] font-bold text-foreground">+23%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
