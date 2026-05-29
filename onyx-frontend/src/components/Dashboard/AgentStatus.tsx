const AgentStatus = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Supervisor</span>
        <span className="text-xs text-green-500">Idle</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Programmer</span>
        <span className="text-xs text-gray-500">Waiting</span>
      </div>
    </div>
  );
};

export default AgentStatus;
