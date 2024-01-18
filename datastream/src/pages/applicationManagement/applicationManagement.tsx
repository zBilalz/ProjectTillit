import React from 'react';
import styles from './applicationManagement.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
const ApplicationManagement = () => {
    const navigate = useNavigate();
    const logOut = async() => {
        localStorage.removeItem('token');
      
       navigate("/account/login");
      }
  return (
    <>
       <h1 style={{textAlign:"center", marginTop:60, marginBottom:20}}>Application Management</h1>
       <div className={styles.applicationIconContainer}>
     
      <div className={styles.applicationIcon} onClick={() => navigate("/project-setup")}>
        <img src="./log.svg" alt="project-setup" />
        <p>Project Setup</p>
      </div>
      <div className={styles.applicationIcon} onClick={() => navigate("/process-overview")}>
        <img src="./app.svg" alt="process-overview" />
        <p>Process Overview</p>
      </div>
      <div className={styles.applicationIcon} onClick={() => navigate("/user-management")}>
        <img src="./user.svg" alt="user-management" />
        <p>User Management</p>
      </div>
      <div className={styles.applicationIcon} onClick={() => navigate("/account")}>
        <img src="./profile.svg" alt="my-account" />
        <p>My Account</p>
      </div>
      <div className={styles.applicationIcon} onClick={() => {logOut()}}>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          className={styles.applicationLogoutIcon}
        />
        <p>Log Out</p>
      </div>
    </div>
       </>
    
  );
};

export default ApplicationManagement;
