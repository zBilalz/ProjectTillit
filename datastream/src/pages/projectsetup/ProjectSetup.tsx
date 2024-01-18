import React, { useState, ChangeEvent, useEffect } from 'react';
import styles from './ProjectSetup.module.css';
import axios from 'axios';
import LoadingSpinner from '../../components/Indicators/loadingSpinner';
import LoadingTextMigration from '../../components/Indicators/loadingText';

const ProjectSetup = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchDone, setIsFetchDone] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);
  const [databaseNames, setDatabaseNames] = useState<string[]>([])
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [selectedDBIsEmpty, setSelectedDBIsEmpty] = useState(false);
  const [sqlTables, setSqlTables] = useState<string[]>([]);
  const [sqlTablesFetching, setSqlTablesFetching] = useState(false);
  const [errorServer, setErrorServer] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    
    const fetchUserInfo = async() => {
      
      try {
   
         await axios.get("http://localhost:8000/fetchUser", {
          headers: { Authorization: token}, 
          params: { requests: ["databases"] },
        }).then((response) => {setDatabaseNames([...response.data.databaseNames]);
         setIsDatabaseEmpty(response.data.databaseNames.length < 1); console.log(response.data.databaseNames);
         }).finally(() => setIsFetchDone(true));
        
        
       
        
    } catch (error) {
      
      console.log(error);
      
      
    } 
  }
  
  
    fetchUserInfo();
  
  
  }, [])

  useEffect(() => {

    if (selectedSource == "sql"){
      setSqlTablesFetching(true);
      const fetchSqlTables = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/database/sqlTables`, {
            headers: { Authorization: token}
          }).then().catch().finally(() => setSqlTablesFetching(false));
            if (response.data.tables != undefined) {
              setSqlTables([...response.data.tables])
            }
        } catch (error) {
          setErrorServer(true);
        }
      
      }
      fetchSqlTables();
      
    }
    else {
      setSqlTables([]);
    }
  
  }, [selectedSource])
  

  const beginMigration = async() => {
   
    
   if (selectedSource != null && selectedDestination != null) {
   
    setMigrationDone(false);
    setLoading(true);
    setSelectedDBIsEmpty(false)
    try {

      const response = await axios.get(`http://localhost:8000/database/transfer?srcDB=${selectedSource}&dstDB=${selectedDestination}`, {
        headers: { Authorization: token}
      }).then().catch().finally(() => setLoading(false));
        console.log(response.status);
        
      if (response.status == 200) {
        setMigrationDone(true);
      }
      
    
  } catch (e) {
    setErrorServer(true);

  }


   }
    else {
      setSelectedDBIsEmpty(true)
    }
    
  };
  const closeModal = () => {
    setMigrationDone(false);
    setErrorServer(false);
  };
  return (
    <>
    
      <div className={styles.projectSetup}>
        <div className={styles.projectSetupBox1}>
        {fetchDone ? <div className={styles.container}>
        <div className={styles.projectSetupSourceBox}>
            <p style={{margin:"10px 0 10px 0", fontSize:"20px"}}>Available databases</p>
            <select
              value={selectedSource || ''}
              onChange={(e) => setSelectedSource(e.target.value)}
              className={styles.projectSetupSourceSelect}
            >
              {isDatabaseEmpty  ? <option value="" disabled>
                No source available
              </option> : <option value="" disabled>
                Select a source
              </option>
              }
             {isDatabaseEmpty ? "" : databaseNames.map((dbName) => <option key={dbName} value={dbName} disabled={loading}>{dbName}</option>) }
            </select>

            {sqlTablesFetching ? <LoadingSpinner /> : sqlTables.length > 0 ?
            <>
            <p style={{margin:"10px 0 10px 0", fontSize:"20px"}}>Tables to migrate</p> <select 
            className={styles.projectSetupSourceSelect}>
              {sqlTables.map((tableName) => <option key={tableName} value={tableName}>{tableName}</option>)}

            </select>
            </> : "" }
       
           
          <br />
          <img style={{ width: '200px', height: 'auto' }} src="/source.png" alt="" />
          </div>
          <div className={styles.projectSetupDestinationBox}>

          
          <p style={{margin:"10px 0 10px 0", fontSize:"20px"}}>Available databases</p>
            <select
              value={selectedDestination || ''}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className={styles.projectSetupSourceSelect}
            >
              {isDatabaseEmpty  ? <option  value="" disabled>
                No destination available
              </option> : <option value="" disabled>
                Select a destination
              </option>
              }
             {isDatabaseEmpty ? "" : databaseNames.map((dbName) => <option key={dbName} value={dbName} disabled={loading}>{dbName}</option>) }
            </select>
            <br />
          <br />
          <img style={{ width: '200px', height: 'auto' }} src="/source.png" alt="" />
          <br />
          <br />
          {selectedDBIsEmpty ? <p style={{color:"red"}}>Select a source and a destination database</p> : ""}
          <br/>
          </div>
          {loading ? <button className={styles.buttonMigrationDisabled  } >
              Migration has started...
            </button> : <button className={ styles.buttonMigrationEnabled } onClick={() => beginMigration()}>
              Begin Migration
            </button>}
            </div>
          
         : <LoadingSpinner/> }
        </div>
        <div className={styles.projectSetupBox2}>
         
          {loading ? <div style={{display:"flex", flexDirection:"column", gap:40}}><LoadingSpinner /> <LoadingTextMigration /> </div>  : <p className={styles.migrate}>Ready to migrate...</p>}
          {migrationDone || errorServer ? 
        <div className={styles.migrationModalOverlay} onClick={() => closeModal()}>
          <div className={styles.migrationModal} style={{backgroundColor: migrationDone ? "rgb(162, 247, 35)" : "#ff8585"}} onClick={(e) => e.stopPropagation()}>
          
              <h2 className={styles.migrationModalHeader}>Status</h2>
              <span className={styles.migrationCloseButton} onClick={closeModal}>
                &times;
              </span>
            <div className={styles.migrationModalContent}>
              {migrationDone ? <p>Your migration has been completed successfully!</p> :<p>Something went wrong with the server. Try again later</p> }
            </div>
          </div>
        </div>
      : ""}
        </div>
      </div>
    </>
  );
};

export default ProjectSetup;
