
import { Typography } from "@mui/material";
const AlwarFooter = () => {
  return (
    <div className="w-full  flex-wrap bg-[#f5f5f5] px-[150px] sm:px-[200px] flex items justify-between gap-[50px] py-[20px] text-white">
      <div className="flex flex-col justify-between  items-start gap-y-4  ">
        <div>
          <Typography fontSize={18} fontWeight={600} sx={{color:"#999999"}} variant="subtitle2" >Made with ❤️ in India </Typography>
        
        </div>
        <Typography fontSize={13}   variant="subtitle2" sx={{color:"#999999"}} >
          © 2017 - {new Date().getFullYear()} | All rights reserved
        </Typography>
      </div>
      <div className="flex flex-col gap-[10px] w-[310px] items-start text-left justify-end">
        <img src="./assets/images/ms.png" alt="" className="w-[280px] h-auto" />
        <div>
          <Typography fontSize={13}  sx={{color:"#999999"}}  variant="subtitle2">
            Office No. 1 and 2, 3rd Floor, Plot number B-88<br/>Sector 83, Noida,
            Gautam Buddha Nagar, 201305
          </Typography>
          <Typography  variant="subtitle2" sx={{color:"#999999"}} fontSize={13}>Phone: +91 88 26 788880 </Typography>
          <Typography  variant="subtitle2" sx={{color:"#999999"}} fontSize={13}>e-mail: iot@mscorpres.in</Typography>
        </div>
      </div>
    </div>
  );
};

export default AlwarFooter;
