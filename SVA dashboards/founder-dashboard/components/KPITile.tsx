interface KPITileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function KPITile({ title, value, subtitle, trend }: KPITileProps) {
  const trendColor = trend === 'up' ? 'text-cyan-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div
      className="rounded-lg shadow-lg p-6 border-l-4"
      style={{
        background: '#3a4f63',
        borderColor: '#4dd0e1'
      }}
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 mb-2">
        {title}
      </h3>
      <div className={`text-3xl font-extrabold text-white ${trendColor}`}>
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

