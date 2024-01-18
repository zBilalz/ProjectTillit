import styles from "./Navbar.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt,  faTimeline } from '@fortawesome/free-solid-svg-icons';
import {  Link, useNavigate,  } from "react-router-dom";

const Navbar = ({userName, setLoggedIn} : {userName:string,setLoggedIn:React.Dispatch<React.SetStateAction<boolean>>  }) => {
  const navigate = useNavigate();
  const logOut = async() => {
    localStorage.removeItem('token');
    setLoggedIn(false);
   navigate("/account/login");
  }
  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/project-setup"><img className={styles.logo} style={{ width: "100%" }} src="logo-dark.svg" alt="" /></Link>
      </div>
      <div className={styles.icons}>
        <FontAwesomeIcon icon={faTimeline} />
        <div className={styles.user}>
          <img className={styles.profilePic} src="noavatar.png" alt="" onClick={() => navigate("/account")}/>
          <span style={{fontSize:"20px"}}>{userName}</span>
        </div>
        <FontAwesomeIcon
          icon={faSignOutAlt}
          onClick={() => {logOut()}}
          className={styles.logoutIcon}
        />
      </div>
    </div>
  );
};

export default Navbar
