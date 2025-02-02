import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface StatusCardProps {
  title: string;
  stats: {
    success: number;
    warnings: number;
    errors: number;
  };
  total: number;
}

export function StatusCard({ title, stats, total }: StatusCardProps) {
  const successPercentage = (stats.success / total) * 100;
  const warningsPercentage = (stats.warnings / total) * 100;
  const errorsPercentage = (stats.errors / total) * 100;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm">
          Explore →
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-sm">Success</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.success} ({successPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={successPercentage} className="bg-muted h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">Warnings</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.warnings} ({warningsPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={warningsPercentage} className="bg-muted h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm">Errors</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.errors} ({errorsPercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={errorsPercentage} className="bg-muted h-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 