import React from "react";
import { RouterProvider, createBrowserRouter} from "react-router-dom";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

import auth0Config from "./auth0.json";
import './App.css';

import Login from './components/Login';
import Home from './components/Home';
import Signup from './components/Signup';
import Buy from './components/Buy';
import Map from './components/Map';
import UserProfile from './components/UserProfile';

import AdminCheckMoney from './components/AdminCheckMoney';
import AdminAuctionsStatus from "./components/AdminAuctionsStatus";
import AdminAuctions from "./components/AdminAuctions";
import AdminOffers from "./components/AdminOffers";
import AdminProposals from "./components/AdminProposal";
import AdminBuy from "./components/AdminBuy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/events",
    element: <Buy />
  },
  {
    path: "/events_map",
    element: <Map />
  },
  {
    path: "/profile",
    element: <UserProfile />
  },
  {
    path: "/admin_check_money",
    element: <AdminCheckMoney />
  },
  {
    path: "/admin_status",
    element: <AdminAuctionsStatus />
  },
  {
    path: "/admin_auction",
    element: <AdminAuctions />
  },
  {
    path: "/admin_offers",
    element: <AdminOffers />
  },
  {
    path: "/admin_proposals",
    element: <AdminProposals />
  },
  {
    path: "/admin_buy",
    element: <AdminBuy />
  }
])

const App = ()  => {

  const { isLoading, error } = useAuth0();

  console.log(isLoading);
  console.log(error);

  return (
      <Auth0Provider 
        domain={auth0Config.domain}
        clientId={auth0Config.clientId}
        authorizationParams={{
          audience: 'https://dev-zga30asjwpv4rtt1.us.auth0.com/api/v2/',
          redirect_uri: window.location.origin
        }}>
        <RouterProvider router={router} />
      </Auth0Provider>
  )
}

export default App;