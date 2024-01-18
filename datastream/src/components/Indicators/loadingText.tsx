import { TypeAnimation } from "react-type-animation";



const LoadingTextMigration = () => {

return (<TypeAnimation
    sequence={[
      
      'Migrating',
      1000,
      'Migrating.',
      1000,
      'Migrating..',
      1000,
      'Migrating...',
      1000,
      'Migrating....',
      1000,
    ]}
    speed={10}
    style={{ fontSize: '2.5rem' }}
    repeat={Infinity}
  />)

}

export default LoadingTextMigration;