import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './Entry.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, Navigate} from 'react-router-dom';
import LoadingLoginSpinner from '../../components/Indicators/loadingLoginSpinner';
import ServerErrorModal from '../../components/Modals/serverErrorModal';



const Login = () => {

  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [wrongDetails, setWrongDetails] = useState(false);
  const [checkDone, setCheckDone] = useState<boolean>(false);
  const [errorServer, setErrorServer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const verifyToken = async () => {
         
   try {
     const response = await axios.get("http://localhost:8000/checkToken", {
       headers: { Authorization: token },
     });
     if (response.status == 200) {
       setLoggedIn(true);

      navigate("/");
     }
     
   } catch (error) {
     setLoggedIn(false);
     
     
   } finally {
     setCheckDone(true);
   }
 };

 useEffect(() => {
   verifyToken();

 }, [])

  async function submit(e: any) {
      e.preventDefault();
      setWrongDetails(false);
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:8000/login", {
          email,
          password,
        });
    
        if (response.data.token) {
        
          localStorage.setItem('token', response.data.token);
          setLoggedIn(true);
          
          navigate("/");
        } 
        
      } catch (error:any) {

        if (error.response == undefined || error.response.status == 500) {
          setErrorServer(true);
    
        }
        
        else if (error.response.status === 401) {
          setWrongDetails(true);
        }
        setLoading(false);
      
      }
    }
    const closeModal = () => {
      setErrorServer(false);
    };
  return (<> {checkDone ? loggedIn ? <Navigate to="/" /> : <div className={styles.container}>
  <div className={styles.entryFormBox}>
  <img style={{ width: "140px", height: "auto" }} src="/tillit.png" alt="" />
    <p style={{ color: 'darkblue', fontSize: '24px' }}>Welcome Back</p>
    <div className={styles.entryInputGroup}>
      <div className={styles.entryInputField}>
        <label>* Email</label>
        <div className={styles.entryInputIcon}>
          <FontAwesomeIcon icon={faEnvelope} />
        </div>
        <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} required  />
      </div>
      <div className={styles.entryInputField}>
        <label>* Password</label>
        <div className={styles.entryInputIcon}>
          <FontAwesomeIcon icon={faLock} />
        </div>
        <input type="password" placeholder="Password"value={password}
        onChange={(e) => setPassword(e.target.value)} required />
      </div>
    </div>
    {loading ? <LoadingLoginSpinner /> : ""}
    {wrongDetails ? <p style={{color:"red"}}>Invalid Username or Password</p> : ""}
    <button className={styles.entryButton} onClick={submit}>Sign in</button>
  </div>
</div> : ""} 
{errorServer ? <ServerErrorModal closeModal={closeModal} errorServer={errorServer} />
      : ""}
  </>
    
  );
};

export default Login;