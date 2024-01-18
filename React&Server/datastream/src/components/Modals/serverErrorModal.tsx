import styles from "./serverErrorModal.module.css"


const ServerErrorModal = ({errorServer, closeModal} : {errorServer:boolean, closeModal:() => void}) => {



    return (  <div className={styles.serverErrorModalOverlay} onClick={() => closeModal()}>
    <div className={styles.serverErrorModal} style={{backgroundColor: "#ff8585"}} onClick={(e) => e.stopPropagation()}>
    
        <h2 className={styles.serverErrorModalHeader}>Status</h2>
        <span className={styles.serverErrorModalCloseButton} onClick={closeModal}>
          &times;
        </span>
      <div className={styles.serverErrorModalContent}>
        <p>Something went wrong with the server. Try again later</p> 
      </div>
    </div>
  </div>)
}

export default ServerErrorModal;