import './styles/global.css';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import ProjectSetup from './pages/projectsetup/ProjectSetup';
import UserManagement from './pages/UserManagement/usermanagement';
import Navbar from './components//Home/navbar/Navbar';
import Footer from './components/Home/footer/Footer';
import Menu from './components/Home/menu/Menu';
import { useContext, useEffect, useState } from 'react';
import Login from './pages/account/Login';
import axios from 'axios';
import Registration from './pages/account/Registration';
import { UnauthorizedError } from 'express-jwt';
import Unauthorized from './pages/unauthorized/Unauthorized';
import MyAccount from './pages/account/MyAccount';
import ProcessOverview from './pages/processOverview/ProcessOverview';
import ApplicationManagement from './pages/applicationManagement/applicationManagement';



  const Root = () => {
   const [userName, setUserName] = useState("");

   const [checkDone, setCheckDone] = useState<boolean>(false);
      const navigate = useNavigate()
  
   const [loggedIn, setLoggedIn] = useState<boolean>(false);
   const token = localStorage.getItem("token");


   const verifyToken = async () => {
    try {
      const response = await axios.get("http://localhost:8000/checkToken", {
        headers: { Authorization: token },
      });
      console.log(response.data.token);
      
      if (response.status == 200) {
          if(response.data.token) {
            localStorage.setItem("token", response.data.token)
          }
        setLoggedIn(true);
 
      
      }
      
    } catch (error) {
      setLoggedIn(false);
      
      navigate("/account/login")
    } finally {
      setCheckDone(true);
      
    }
  };
  useEffect(() => {
    let ignore = false;
    if (!ignore) {
      verifyToken();

    }
    return () => {
      ignore = true;
    }
  }, [])



    const fetchUserName = async() => {
      
      try {
   
        const response = await axios.get("http://localhost:8000/fetchUser", {
          headers: { Authorization: token}, 
          params: { requests: ["name"] },
        });
      
      setUserName(response.data.userName);
     
      
      
      
    } catch (error) {
      
      
      
    } 
  }

  if (loggedIn) {
    fetchUserName();
  }
  

    
   
  return (
    <>
    {loggedIn ? <div className="main">
        <Navbar userName={userName} setLoggedIn={setLoggedIn}  />
        <div className="container">
          <div className="menuContainer">
            <Menu />
          </div>
          <div className='contentContainer'>
         
         < Outlet/>
          </div>
    
        </div>
        <Footer />
      </div> : ""}
    </>
   
    ) 
  }
  
  
    
    const App = () => {


        
  const router = createBrowserRouter([
    {
      path: "/",
      element:   <Root /> ,
      children: [
        {
          path: "",
          element: <Navigate to="/project-setup" />, 
        },
        {
          path: "/project-setup",
          element: <ProjectSetup />,
        },
        {
          path:"/process-overview",
          element:<ProcessOverview />
        },
        {
          path: "/user-management",
          element: <UserManagement />,
        },
        {
          path:"/application-management",
          element:<ApplicationManagement />
        },
        {
          path: "/account",
        element: <MyAccount />
      }
       
      ],
    },
    {
      path: '/account/login',
      element: <Login />
    },
    {
      path: '/account/register',
      element: <Registration />,
    },
    {
      path: '/unauthorized',
      element: <Unauthorized />,
    },
  ]);


  return (

    < RouterProvider router={router}/>

  );
}

export default App;