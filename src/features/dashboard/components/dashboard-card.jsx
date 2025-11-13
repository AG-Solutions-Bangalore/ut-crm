import { Card, Typography } from "antd";

const { Text } = Typography;

const DashboardCard = ({ 
  title, 
  count, 
  icon, 
  gradient, 
  bgLight, 
  textColor, 
  path, 
  onClick 
}) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(path)}
      className="
        group cursor-pointer overflow-hidden rounded-xl border-0 
        shadow-md hover:shadow-2xl transition-all duration-300 bg-white
      "
      styles={{ body: { padding: 0 } }}
    >
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`
              ${bgLight} px-4 py-3.5 rounded-xl flex items-center justify-between gap-3
              transition-transform duration-300 group-hover:scale-110 shadow-sm w-full
              max-w-[160px]
            `}
          >
            <span className={`text-3xl ${textColor}`}>
              {icon}
            </span>
            <span
              className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
            >
              {count}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Text className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            {title}
          </Text>
        </div>
      </div>

      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
    </Card>
  );
};

export default DashboardCard;