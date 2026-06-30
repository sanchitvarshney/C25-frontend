
const validateResponse = (data) => {
 
 
  if (data?.success) {  
    return data?.data;
  } 
};

export default validateResponse;
