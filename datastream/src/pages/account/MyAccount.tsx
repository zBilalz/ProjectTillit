

import React, { useEffect, useState } from 'react';
import styles from './MyAccount.module.css';
import axios from 'axios';
import { Circles } from 'react-loader-spinner';
import LoadingSpinner from '../../components/Indicators/loadingSpinner';
import CheckMark from '../../components/Indicators/checkMark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons'
import ServerErrorModal from '../../components/Modals/serverErrorModal';


interface RenderModalProps {
    
    setErrorServer:React.Dispatch<React.SetStateAction<boolean>>,
    dbNames:string[],
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

const RenderViewDatabases = ({dbNames,setModalOpen}: {dbNames: string[],
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>}) => {

  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [selectedDb, setSelectedDb] = useState("");

  const openDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setDeleteConfirmationModalOpen(false);
  };

  const onDeleteConfirmed = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.delete(`http://localhost:8000/database?dbName=${selectedDb}`, {
          headers: { Authorization: token}
        });
        console.log(response.status);
        
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
        <h2>Database connected to</h2>
        {dbNames.length < 1 ? 
          <p>No databases connected to this account.</p>:
          <ul>
            {dbNames.map((dbName,index) => (
              <div style={{ display: 'flex',flexDirection: 'row',alignContent: 'center',justifyContent: 'center'}}>
                <li key={dbName}>{dbName}
                  <span style={{ fontSize: 26 }}>
                    <FontAwesomeIcon style={{ color: 'green' }} icon={faCircleCheck} />
                  </span>
                </li>
                <span key={index.toString() + "_delete"} style={{fontSize: 26,margin: '15px 0 0 5px',cursor: 'pointer',}}>
                  <FontAwesomeIcon style={{ color: 'black' }} icon={faTrash} onClick={() => {openDeleteConfirmationModal(); setSelectedDb(dbName)} }/>
                </span>
                <span key={index.toString() + "_edit"} style={{fontSize: 26,margin: '15px 0 0 15px',cursor: 'pointer',}}>
                  <FontAwesomeIcon style={{ color: 'black' }} icon={faEdit} />
                </span>
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

    const [sourceLink, setSourceLink] = useState("");
    const [destinationLink, setDestinationLink] = useState("");
    const [dbName, setDbName] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);

    const submit = async(e: any) => {
        e.preventDefault();
        setIsEmpty(false);
        if (dbName && sourceLink || dbName && destinationLink) {
            
          try {
            const response = await axios.post("http://localhost:8000/updateDbLinks", {
                dbName,
                sourceLink,
                destinationLink,
            });
      
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
      <h2>Add a Database</h2>
      <label>
        Database Name:
        <input
          type="text"
          value={dbName}
          onChange={(e) => setDbName(e.target.value.toLowerCase())}
        />
      </label>
      <label>
        Source Link:
        <input
          type="text"
          value={sourceLink}
          onChange={(e) => setSourceLink(e.target.value)}
        />
      </label>
      <label>
        Destination Link:
        <input
          type="text"
          value={destinationLink}
          onChange={(e) => setDestinationLink(e.target.value)}
        />
      </label>
      {isEmpty ? <p style={{color:"red"}}>Source and Destination links cannot be both empty.</p>:""}
      <button className={styles.updateBtn} onClick={(e) => submit(e)}>
        Update
      </button>
    </div>
  </Modal>)
}

const RenderModal = ({setErrorServer, addDb, dbNames, isModalOpen, setModalOpen} :RenderModalProps) => {


    return (
        <>
        
        {!isModalOpen ? "" : addDb ? <RenderAddDatabaseModal setErrorServer={setErrorServer} setModalOpen={setModalOpen}  /> : <RenderViewDatabases setModalOpen={setModalOpen} dbNames={dbNames} />}
     
    
    </>
    )
        
       
       
}

const MyAccount = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [addDb, setAddDb] = useState(false);
  const [errorServer, setErrorServer] = useState(false);
  const [userData, setUserData] = useState({
    userName: '',
    databaseNames: [],
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
              <span className={styles.accountLabel}>Connected to Databases:</span>
              <span>{userData.databaseNames.length}</span>
            </div>
           
          </div>
        </div>
        <button className={styles.addDatabaseBtn} onClick={() => {setModalOpen(true); setAddDb(false)}}>
          View Databases
        </button>
        <button className={styles.addDatabaseBtn} onClick={() => {setModalOpen(true); setAddDb(true)}}>
          Add a Database
        </button>
      </div>
      <RenderModal setErrorServer={setErrorServer} dbNames={userData.databaseNames} addDb={addDb} isModalOpen={isModalOpen} setModalOpen={setModalOpen}  />
      </>
  }
      {errorServer ? <ServerErrorModal errorServer={errorServer} closeModal={closeServerErrorModal} /> : ""}
    </>
  );
};

export default MyAccount;
