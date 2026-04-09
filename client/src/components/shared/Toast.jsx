
import { useEffect } from "react";

const Toast = ({ message, type, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`toast ${type}`}>
      {type === "success" ? "✅" : "❌"} {message}
    </div>
  );
};

export default Toast;