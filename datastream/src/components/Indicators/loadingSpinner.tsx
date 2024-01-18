import { Circles } from "react-loader-spinner";

const LoadingSpinner = () => {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop:30 , alignItems: "flex-start"}}>
        <Circles
          height={80}
          width={80}
          color="#4fa94d"
          ariaLabel="circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
      </div>
    );
  };
  
  export default LoadingSpinner;