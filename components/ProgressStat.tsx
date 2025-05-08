interface ProgressStatProps {
  title: string;
  value: string;
  bgColor: string;
  textColor: string;
}

export const ProgressStat: React.FC<ProgressStatProps> = ({ title, value, bgColor, textColor }) => {
  return (
    <div className={`rounded-lg p-4 ${bgColor} shadow-sm`}>
      <h3 className={`text-sm font-medium ${textColor} mb-2`}>{title}</h3>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};