
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Entry.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons'; 
import { Navigate, useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [usernameReg, setUsernameReg] = useState("");
  const [emailReg, setEmailReg] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const[isAdmin, setIsAdmin] = useState(true);
  const[isEmpty, setIsEmpty] = useState(false);
  const token = localStorage.getItem("token");

  const verifyToken = async () => {
          
    try {
      const response = await axios.get("http://localhost:8000/checkToken", {
        headers: { Authorization: token },
      });
      if (response.status == 200) {
          
        const response = await axios.get("http://localhost:8000/checkAdmin", {
          headers: { Authorization: token },
        });
       
        if (response.status == 200) {
          setIsAdmin(true)
        }
        else {
        
         
        }
      }
      
    } catch (error:any) {
      if (error.response.status == 401) {
        navigate("/unauthorized")
      }
    
      
    } 
  };
useEffect(() => {
let ignore = false;
if (!ignore) {
  verifyToken();

}
return () => {
  ignore = true;
}
}, [])


  const submit = async(e: any) => {
    e.preventDefault();
    setIsEmpty(false);
    if (usernameReg && passwordReg && emailReg) {

      try {
        const response = await axios.post("http://localhost:8000/register", {
          usernameReg,
          emailReg,
          passwordReg,
        });
  
        if (response.status == 200) {
          
          
          window.location.reload();
        } 
      } catch (e) {
  
   
      }



    }

    else {
      setIsEmpty(true);
    }

    
  }

  return (
<>{isAdmin ? <div className={styles.container}>
      
      <div className={styles.entryFormBox}>
      <img style={{ width: "140px", height: "auto" }} src="/tillit.png" alt="" />
        <p style={{ color: 'darkblue', fontSize: '24px' }}>Create an Account</p>
        <div className={styles.entryInputGroup}>
          <div className={styles.entryInputField}>
            <label>* Name</label>
            <div className={styles.entryInputIcon}>
              <FontAwesomeIcon icon={faUser} />
            </div>
            <input style={{border: isEmpty ? !usernameReg ? "1px solid red" : "" : ""}} type="text" placeholder="Name" value={usernameReg} onChange={(e) => setUsernameReg(e.target.value)} required />
          </div>
          <div className={styles.entryInputField}>
            <label>* Email</label>
            <div className={styles.entryInputIcon}>
              <FontAwesomeIcon icon={faEnvelope} />
            </div>
            <input style={{border: isEmpty ? !emailReg ? "1px solid red" : "" : ""}} type="email" placeholder="Email" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} required/>
          </div>
          <div className={styles.entryInputField}>
            <label>* Password</label>
            <div className={styles.entryInputIcon}>
              <FontAwesomeIcon icon={faLock} />
            </div>
            <input style={{border: isEmpty ? !passwordReg ? "1px solid red" : "" : ""}} type="password" placeholder="Password" value={passwordReg} onChange={(e) => setPasswordReg(e.target.value)} required />
          </div>
        </div>
        {isEmpty ? <p style={{color:"red"}}>One or more required fields is empty</p> : ""}

        <button className={styles.entryButton} onClick={(e) => submit(e)}>Register</button>
      </div>
    </div>: ""}</>
    
 
    
  );
};

export default Registration;
