

import React, { useEffect, useState } from 'react';
import styles from './MyAccount.module.css';
import axios from 'axios';
import { Circles } from 'react-loader-spinner';
import LoadingSpinner from '../../components/Indicators/loadingSpinner';
import CheckMark from '../../components/Indicators/checkMark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTrash, faEdit, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import ServerErrorModal from '../../components/Modals/serverErrorModal';
import DbLink from '../../interfaces/schemas/dbLink';


interface RenderModalProps {
    
    setErrorServer:React.Dispatch<React.SetStateAction<boolean>>,
    databaseConnections:DbLink,
    addDb:boolean,
    isModalOpen: boolean,
    setModalOpen:React.Dispatch<React.SetStateAction<boolean>>,
}

interface RenderAddDatabaseModal {
    setModalOpen:React.Dispatch<React.SetStateAction<boolean>>,
    setErrorServer:React.Dispatch<React.SetStateAction<boolean>>,

}

const Modal = ({ children, closeModal }: {children:any, closeModal:any}) => {
  return (
    <div className={styles.accountModalOverlay} onClick={closeModal}>
      <div className={`${styles.accountModalContent} ${styles.active}`} onClick={(e) => e.stopPropagation()}>
        <span className={styles.accountCloseBtn} onClick={closeModal}>
          &times;
        </span>
      

        {children}
    
        
      </div>
    </div>
  );
};

const RenderDeleteDatabaseConnection = ({setModalOpen,onDeleteConfirmed}: {setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteConfirmed: () => void;
}) => {
  return (
    <Modal closeModal={() => setModalOpen(false)}>
      <h2>Are you sure you want to delete the database connection?</h2>
      <div style={{display:"flex", flexDirection:"row", justifyContent:'space-evenly' }}>
      <button className={styles.updateBtn} onClick={onDeleteConfirmed}>
        Yes
      </button>
      <button className={styles.updateBtn} onClick={() => setModalOpen(false)}>
        No
      </button>
      </div>
   
    </Modal>
  );
};



const RenderViewDatabases = ({databaseConnections,setModalOpen}: {databaseConnections: DbLink,
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {

  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<{dbName:string, connectionName:string}>({dbName:"", connectionName:""});
  

  const openDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(false);
  };

  const onDeleteConfirmed = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.delete(`http://localhost:8000/database?dbName=${selectedConnection.dbName}&connectionName=${selectedConnection.connectionName}`, {
          headers: { Authorization: token}
        });
     
        
        if (response.status == 200) {
          window.location.reload();

        }
      } catch (error) {
        
      }
    closeDeleteConfirmationModal();
  };
  

  return (
    <Modal closeModal={() => setModalOpen(false)}>
      <div className={styles.accountModalDatabaseList}>
        <h2>Servers connected to</h2>
        {Object.keys(databaseConnections).length < 1 ? 
          <p>No databases connected to this account.</p>:
          <ul>
            {Object.keys(databaseConnections).map((dbName,index) => (
              <div style={{ display: 'flex',flexDirection: 'column',alignContent: 'center',justifyContent: 'center'}}>
                <li key={dbName}>{dbName} ({Object.keys(databaseConnections[dbName]).length})
                  <span style={{ fontSize: 26 }}>
                    <FontAwesomeIcon style={{ color: 'green' }} icon={faCircleCheck} />
                  </span>
                </li>
                <div style={{width:"90%", marginLeft:25}}>
                  {Object.keys(databaseConnections[dbName]).map((connectionName, index) =>{return (
                    <>
                    <div style={{display:"flex", flexDirection:"row"}}>
                    <span key={index.toString() + "_edit"} style={{fontSize: 26,margin: '15px 0 0 0',cursor: 'pointer',}}>
                  <FontAwesomeIcon style={{ color: 'black' }} icon={faArrowRight} />
                </span><li>{connectionName} (server:{databaseConnections[dbName][connectionName].server})</li>
                <span key={index.toString() + "_delete"} style={{fontSize: 26,margin: '15px 0 0 5px',cursor: 'pointer',}}>
                  <FontAwesomeIcon style={{ color: 'black' }} icon={faTrash} onClick={() => {openDeleteConfirmationModal(); setSelectedConnection({dbName:dbName, connectionName:connectionName})} }/>
                </span>
                <span key={index.toString() + "_edit"} style={{fontSize: 26,margin: '15px 0 0 15px',cursor: 'pointer',}}>
                  <FontAwesomeIcon style={{ color: 'black' }} icon={faEdit} />
                </span>
                    </div>
                    
                    </>
                  
                 )})}
                 
                </div>
                
              </div>
            ))}
          </ul>
        }
      </div>
      {deleteConfirmationModalOpen && (
        <RenderDeleteDatabaseConnection
          setModalOpen={closeDeleteConfirmationModal}
          onDeleteConfirmed={onDeleteConfirmed}
        />
      )}
    </Modal>
  );
};

const RenderAddDatabaseModal = ({setErrorServer, setModalOpen} :RenderAddDatabaseModal) => {

    const [connectionLink, setConnectionLink] = useState("");
    const [dbTypeName, setDbTypeName] = useState("");
    const [connectionName, setConnectionName] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);
    const token = localStorage.getItem("token");

    const submit = async(e: any) => {
        e.preventDefault();
        setIsEmpty(false);
        if (connectionLink && dbTypeName && connectionName) {
            
          try {
            const response = await axios.post("http://localhost:8000/updateDbLinks",{
            
            connectionName,
            dbTypeName,
            connectionLink,
          }, {
              headers: { Authorization: token },
            },);
      
            if (response.status == 200) {
         
              
                window.location.reload();
              
            } 
          } catch (e) {
            
            setErrorServer(true);
          }
    
    
    
        }
    
        else {
            setIsEmpty(true)
        }
    
        
      }

    return ( <Modal closeModal={() => setModalOpen(false)}>
    <div className={styles.accountModalChildItems}>
      <h2>Add a Database connection</h2>
      <label>
        Name Connection:
        <input
          type="text"
          value={connectionName}
          onChange={(e) => setConnectionName(e.target.value.toLowerCase())}
        />
      </label>
      <label>
        Database Type:
        <input
          type="text"
          value={dbTypeName}
          onChange={(e) => setDbTypeName(e.target.value.toLowerCase())}
        />
      </label>
      <label>
        Connection link:
        <input
          type="text"
          value={connectionLink}
          onChange={(e) => setConnectionLink(e.target.value)}
        />
      </label>
      {isEmpty ? <p style={{color:"red"}}>Some fields are empty.</p>:""}
      <button className={styles.updateBtn} onClick={(e) => submit(e)}>
        Update
      </button>
    </div>
  </Modal>)
}

const RenderModal = ({setErrorServer, addDb, databaseConnections, isModalOpen, setModalOpen} :RenderModalProps) => {


    return (
        <>
        
        {!isModalOpen ? "" : addDb ? <RenderAddDatabaseModal setErrorServer={setErrorServer} setModalOpen={setModalOpen}  /> : <RenderViewDatabases setModalOpen={setModalOpen} databaseConnections={databaseConnections} />}
     
    
    </>
    )
        
       
       
}

const MyAccount = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [addDb, setAddDb] = useState(false);
  const [errorServer, setErrorServer] = useState(false);
  const [userData, setUserData] = useState<{userName:string,databaseConnections:DbLink}>({
    userName: '',
    databaseConnections: {},
  });
  
  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/fetchUser", {
          headers: { Authorization: token}, 
          params: { requests: ["name", "databases"] },
        });
        
        setUserData(response.data);
      
     
      
        
      } catch (error) {
        setErrorServer(true);
      }
    };
   
    
    
    fetchUserData();
  }, []);
  const closeServerErrorModal = () => {
    setErrorServer(false);
  };

  const calculateServers = ():number => {
    let totalKeys = 0;
    if (Object.keys(userData.databaseConnections).length > 0) {
      for (const dbTypeName in userData.databaseConnections) {
        if (userData.databaseConnections.hasOwnProperty(dbTypeName)) {
          for (const connectionName in userData.databaseConnections[dbTypeName]) {
            if (userData.databaseConnections[dbTypeName].hasOwnProperty(connectionName)) {
              totalKeys++;
            }
          }
        }
      }
     
    }
    return totalKeys
  }

  return (
    <>
    {userData.userName == "" ? <LoadingSpinner /> : <><div className={styles.accountDetails}>
        <div className={styles.accountProfileCard}>
          <img className={styles.accountAvatar} src="noavatar.png" alt="" />
          <div className={styles.accountDetails}>
            <div className={styles.accountDetailItem}>
              <span className={styles.accountLabel}>Name:</span>
              <span>{userData.userName}</span>
            </div>
            <div className={styles.accountDetailItem}>
              <span className={styles.accountLabel}>Role:</span>
              <span>{userData.userName == "admin" ? "admin" : "user"}</span>
            </div>
            <div className={styles.accountDetailItem}>
              <span className={styles.accountLabel}>Connected to servers:</span>
              <span>{Object.keys(userData.databaseConnections).length < 1? 0 : calculateServers()}</span>
            </div>
           
          </div>
        </div>
        <button className={styles.addDatabaseBtn} onClick={() => {setModalOpen(true); setAddDb(false)}}>
          View Database connections
        </button>
        <button className={styles.addDatabaseBtn} onClick={() => {setModalOpen(true); setAddDb(true)}}>
          Add a Database connection
        </button>
      </div>
      <RenderModal setErrorServer={setErrorServer} databaseConnections={userData.databaseConnections} addDb={addDb} isModalOpen={isModalOpen} setModalOpen={setModalOpen}  />
      </>
  }
      {errorServer ? <ServerErrorModal errorServer={errorServer} closeModal={closeServerErrorModal} /> : ""}
    </>
  );
};

export default MyAccount;
