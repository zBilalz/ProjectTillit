import {  TailSpin } from "react-loader-spinner";

const LoadingLoginSpinner = () => {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop:30 , alignItems: "flex-start"}}>
        <TailSpin
  visible={true}
  height="80"
  width="80"
  color="#4fa94d"
  ariaLabel="tail-spin-loading"
  radius="1"
  wrapperStyle={{}}
  wrapperClass=""
  />
      </div>
    );
  };
  
  export default LoadingLoginSpinner;