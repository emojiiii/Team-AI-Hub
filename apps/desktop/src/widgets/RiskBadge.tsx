import { riskTone } from "../utils/risk";
import { useLocale } from "../hooks/useLocale";
import { Pill } from "./Pill";

export function RiskBadge({ level }: { level?: string | null }) {
  const { t } = useLocale();
  const value = level ?? "low";
  return (
    <Pill tone={(riskTone[value] ?? "default") as never}>
      {riskTone[value] ? t(`risk.level.${value}`) : value}
    </Pill>
  );
}
