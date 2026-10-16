import { useTrading } from "@/contexts/TradingContext";
import { useNavigate } from "react-router-dom";

export default function MasterButton() {
  const { isConnected, isAlgoRunning, toggleAlgo } = useTrading();
  const navigate = useNavigate();

  if (!isConnected) {
    return (
      <button
        onClick={() => navigate("/strategy")}
        className="glass-card mt-6 flex w-full items-center justify-center gap-3 py-5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Connect Algo First
      </button>
    );
  }

  return (
    <div className="mt-6 flex w-full items-center justify-center py-2">
      <div className="container">
        <label className="switch" title={isAlgoRunning ? "Stop Algo Trading" : "Start Algo Trading"}>
          <input 
            type="checkbox" 
            className="togglesw" 
            checked={isAlgoRunning} 
            onChange={() => toggleAlgo()}
          />
          <div className="indicator left"></div>
          <div className="indicator right"></div>
          <div className="button"></div>
        </label>
      </div>
    </div>
  );
}
