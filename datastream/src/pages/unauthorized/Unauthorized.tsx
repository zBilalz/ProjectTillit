import React from 'react';
import styles from './UnauthorizedPage.module.css';
import { Link } from 'react-router-dom';


const Unauthorized = () => {
    
    const token = localStorage.getItem("token");
  return (
    <div className={styles.unauthorizedFlexContainer}>
          <div className={styles.unauthorizedContainer}>
      <h1 className={styles.unauthorizedTitle}>Access Denied</h1>
      <p className={styles.unauthorizedMessage}>
        Sorry, you don't have permission to access this page. Go back to {<Link style={{float:"none", color:"grey"}} to={token == undefined ? "/account/login" :"/"}>{token == undefined ? "Login" :"Home"}</Link>}
      </p>
    
   
    </div>
    </div>
  
  );
};

export default Unauthorized;
