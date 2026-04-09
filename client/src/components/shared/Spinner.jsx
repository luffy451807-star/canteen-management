
const Spinner = () => (
  <span style={{
    width: "14px", height: "14px",
    border: "2px solid rgba(255,255,255,.3)",
    borderTopColor: "white", borderRadius: "50%",
    animation: "spin .7s linear infinite",
    display: "inline-block"
  }} />
);

export default Spinner;