import React, { useState, ChangeEvent, useEffect } from 'react';
import styles from './ProjectSetup.module.css';
import axios from 'axios';
import LoadingSpinner from '../../components/Indicators/loadingSpinner';
import LoadingTextMigration from '../../components/Indicators/loadingText';
import DbLink from '../../interfaces/schemas/dbLink';

const ProjectSetup = () => {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchDone, setIsFetchDone] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);
  const [dbConnections, setDbConnections] = useState<DbLink>({})
  const [isDatabaseEmpty, setIsDatabaseEmpty] = useState(false);
  const [selectedDBIsEmpty, setSelectedDBIsEmpty] = useState(false);
  const [sqlTables, setSqlTables] = useState<string[]>([]);
  const [sqlTablesFetching, setSqlTablesFetching] = useState(false);
  const [errorServer, setErrorServer] = useState(false);
  const [errorSqlFetching, setErrorSqlFetching] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    
    const fetchUserInfo = async() => {
      
      try {
   
         await axios.get("http://localhost:8000/fetchUser", {
          headers: { Authorization: token}, 
          params: { requests: ["databases"] },
        }).then((response) => {setDbConnections(response.data.databaseConnections);
         setIsDatabaseEmpty(Object.keys(response.data.databaseConnections).length < 1);
         
         }).finally(() => setIsFetchDone(true));
        
        
       
        
    } catch (error) {
      
      console.log(error);
      
      
    } 
  }
  
  
    fetchUserInfo();
  
  
  }, [])

  useEffect(() => {
    const [connectionNameSource, dbTypeSource] = selectedSource?.split(',') ?? [""];
    
    if (dbTypeSource == "sql"){
      setSqlTablesFetching(true);
      const fetchSqlTables = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/database/sqlTables?connectionName=${connectionNameSource}`, {
            headers: { Authorization: token}
          }).then().catch().finally(() => setSqlTablesFetching(false));
            if (response.data.tables != undefined) {
              setSqlTables([...response.data.tables])
            }
        } catch (error) {
          setErrorServer(true);
          setErrorSqlFetching(true);
          setSqlTables([]);
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
      const [connectionNameSource, dbTypeNameSource] = selectedSource?.split(',') ?? [""];
      const [connectionNameDestination, dbTypeNameDestination] = selectedDestination?.split(',') ?? [""];

      const response = await axios.get(`http://localhost:8000/database/transfer?srcDbTypeName=${dbTypeNameSource}&srcConName=${connectionNameSource}&dstDbTypeName=${dbTypeNameDestination}&dstConName=${connectionNameDestination}`, {
        headers: { Authorization: token}
      }).then().catch().finally(() => setLoading(false));
        
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
    setErrorSqlFetching(false);
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
             {isDatabaseEmpty ? "" : Object.keys(dbConnections).map((dbTypeName) => Object.keys(dbConnections[dbTypeName]).map((connectionName) =>  <option key={connectionName} value={`${connectionName},${dbTypeName}`} disabled={loading}>{connectionName} ({dbTypeName}:{dbConnections[dbTypeName][connectionName].server})</option>) ) }
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
             {isDatabaseEmpty ? "" : Object.keys(dbConnections).map((dbTypeName) => Object.keys(dbConnections[dbTypeName]).map((connectionName) =>  <option key={connectionName} value={`${connectionName},${dbTypeName}`} disabled={loading}>{connectionName} ({dbTypeName}:{dbConnections[dbTypeName][connectionName].server})</option>) ) }
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
              {migrationDone ? <p>Your migration has been completed successfully!</p> : errorSqlFetching && errorServer ? <p>The server could not fetch the SQL tables.</p> : <p>Something went wrong with the server or the API is offline. Try again later.</p> }
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
