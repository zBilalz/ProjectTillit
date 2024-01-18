import { useEffect, useState } from 'react';
import styles from './ProcessOverview.module.css';
import axios from 'axios';
import MigrationHistory from '../../interfaces/schemas/migrationHistory';
import LoadingSpinner from '../../components/Indicators/loadingSpinner';
import { format } from 'date-fns';

const ProcessOverview = () => {
  const [userData, setUserData] = useState<MigrationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  
  useEffect(() => {
    setLoading(true);
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/fetchUser", {
          headers: { Authorization: token}, 
          params: { requests: ["migrationHistory"] },
        });

        if (response.status == 200) {
          setUserData(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
   
    
    
    fetchUserData();
  }, []);


  return (<><h1 style={{textAlign:"center", margin: 25}}>Migration History</h1> 
  {loading ? <LoadingSpinner /> : userData.length < 1 ? 
  <div className={styles.historyEmptyMessageContainer}>
          <div className={styles.historyEmptyMessageBox}>
            It looks like your migration history is empty!
          </div>
        </div>:
  
  
  <div className={styles.historyListContainer}>
    
      <table className={styles.historyTable}>
        <thead >
          <tr className={styles.historyListHeader}>
          <th>Id</th>
            <th>Started At</th>
            <th>Finished At</th>
            <th>Source</th>
            <th>Destination</th>
          </tr>
        </thead>
        <tbody className={styles.historyListBody}>
          {userData.map((item:any, index:any) => (
            <tr key={index} className={styles.historyListItem}>
              <td>{index + 1}</td>
              <td>{format(item.startedAt, "dd-MM-yy HH:mm:ss")}</td>
              <td>{format(item.endedAt, "dd-MM-yy HH:mm:ss")}</td>
              <td>{item.sourceDb}</td>
              <td>{item.destinationDb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  
}
 
  </>
    
  );
};

export default ProcessOverview;
