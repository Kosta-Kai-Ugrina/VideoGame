const StatusDot = ({ on }: { on: boolean }) => {
  return (
    <span
      title={on ? "connected" : "disconnected"}
      style={{
        width: 10,
        height: 10,
        display: "inline-block",
        borderRadius: "50%",
        background: on ? "#38c172" : "#e3342f",
        boxShadow: "0 0 0 2px #0002",
      }}
    />
  );
};

export default StatusDot;
