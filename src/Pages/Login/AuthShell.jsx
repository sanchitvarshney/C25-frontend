import { Typography } from "antd";

const { Text } = Typography;

const shellStyle = {
  backgroundImage:"url('/assets/images/login_bg.svg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "scroll",
};

const cardStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  backgroundColor: "white",
  maxWidth: "50%",
  minWidth: "50%",
  overflow: "hidden",
  borderRadius: "20px",
  border: "1px solid #e9e1e1",
  gap: 20,
  padding: 40,
  position: "relative",
  boxShadow: "0px 0px 6px 1px #a4a8aa",
};

/**
 * Shared layout for login, sign-up, and OTP screens (two-column card on gradient background).
 */
export default function AuthShell({ footerLeft, children }) {
  return (
    <div
      className="flex justify-center items-center h-[calc(100vh-25px)]"
      style={shellStyle}
    >
      <div style={cardStyle}>
        <div>
          <div>
            <img
              src={"/assets/images/mscorpres_auto_logo.png"}
              alt="Oakter Logo"
              className="w-[150px] h-[auto]"
            />
            <div style={{ position: "absolute", bottom: 40, left: 40 }}>
              {footerLeft}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center ">{children}</div>
      </div>
    </div>
  );
}

export { Text };
