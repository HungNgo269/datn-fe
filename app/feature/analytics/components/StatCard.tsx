import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { StatCardProps } from "../types/analytics.type";

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
  deltaPercent,
  deltaLabel,
}) => {
  const showDelta = typeof deltaPercent === "number";
  const isUp = showDelta && deltaPercent > 0;
  const isDown = showDelta && deltaPercent < 0;
  const DeltaIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800" suppressHydrationWarning>{value}</h3>
        {showDelta ? (
          <div className="mt-1 flex items-center gap-1 text-xs">
            <DeltaIcon
              className={`h-4 w-4 ${
                isUp
                  ? "text-emerald-600"
                  : isDown
                  ? "text-rose-600"
                  : "text-slate-500"
              }`}
            />
            <span
              className={`font-semibold ${
                isUp
                  ? "text-emerald-600"
                  : isDown
                  ? "text-rose-600"
                  : "text-slate-500"
              }`}
            >
              {Math.abs(deltaPercent).toFixed(1)}%
            </span>
            {deltaLabel ? (
              <span className="text-slate-500">{deltaLabel}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};
