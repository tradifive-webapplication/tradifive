import { MoreVertical, RefreshCw, Settings } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export const Analytics2 = () => {
  const metrics = [
    {
      title: "User Retention",
      subtitle: "1.2k new cohorts",
      value: 78,
      badgeText: "+8.2%",
      percentageText: "78%",
      indicatorClass: "bg-blue-600",
    },
    {
      title: "Goal Completions",
      subtitle: "3.2k completed goals",
      value: 62,
      badgeText: "+15k",
      percentageText: "62%",
      indicatorClass: "bg-emerald-500",
    },
  ];

  return (
    <Card className="gap-3">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">Statistics</CardTitle>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refresh</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                <Settings className="h-3.5 w-3.5" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((item, idx) => (
          <div key={idx} className="flex w-full items-end gap-4">
            <div className="grow space-y-1.5">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              <Progress value={item.value} indicatorClassName={item.indicatorClass} />
            </div>
            <div className="flex h-full flex-col items-end justify-end gap-1.5">
              <Badge variant="secondary">{item.badgeText}</Badge>
              <span className="text-xs font-medium text-muted-foreground">{item.percentageText}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Analytics2;
