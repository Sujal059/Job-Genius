import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

/**
 * @param {{skill: string, required: number, current: number}[]} data
 */
export function SkillRadarChart({ data, height = 320 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border-default)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
        <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} tick={{ fill: "var(--text-faint)", fontSize: 10 }} />
        <Radar
          name="Required"
          dataKey="required"
          stroke="var(--accent-gold)"
          fill="var(--accent-gold)"
          fillOpacity={0.12}
          strokeWidth={2}
        />
        <Radar
          name="Your level"
          dataKey="current"
          stroke="var(--primary-accent)"
          fill="var(--primary-accent)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text-muted)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: 8,
            fontSize: 12,
            color: "var(--text-main)",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default SkillRadarChart;
