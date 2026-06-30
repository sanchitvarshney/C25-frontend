import { LinearProgress, Typography } from "@mui/material";

const AppLoader = ({ logo="/assets/images/appLoader.png" }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center w-full  bg-white">
      <img src={logo} alt="Oakter Logo" className="w-[500px] opacity-50" />

      <LinearProgress
        sx={{
          width: "500px",
          height: "5px",
          mt: 2,
          backgroundColor: "#857f81",
          "& .MuiLinearProgress-bar": {
            backgroundColor: "#f4b102",
          },
        }}
      />
      <Typography variant="h6" sx={{ mt: 4 }}>
        Loading Please Wait ...
      </Typography>
    </div>
  );
};

export default AppLoader;
