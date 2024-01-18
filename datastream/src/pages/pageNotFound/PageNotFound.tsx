import { useNavigate } from 'react-router-dom';
import styles from './PageNotFound.module.css';

const PageNotFound = () => {
    const navigate=useNavigate();
  return (
    <div className={styles.pageNotFoundContainer}>
      <div className={styles.pageNotFoundContent}>
        <p className={styles.pageNotFoundMessage}>Page Not Found</p>
        <p className={styles.pageNotFoundDescription}>
         It seems like our server could not find the page you are looking for.
        </p>
        <div>
        <button className={styles.pageNotFoundButton} onClick={() => {localStorage.getItem("token") ? navigate("/") :navigate("/account/login") }}>
          Go back to {localStorage.getItem("token") ? "Home" :"Login" }
        </button>
        </div>
        
      </div>
    </div>
  );
};

export default PageNotFound;
