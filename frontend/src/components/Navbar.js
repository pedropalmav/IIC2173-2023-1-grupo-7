import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div>
      <Link to="/">Home</Link>&nbsp;&nbsp;
      {!isAuthenticated ? (
        <button onClick={() => loginWithRedirect()}>Login or Signup</button>
      ) : (
        <>
          &nbsp; <button onClick={() => logout()}>Logout</button> &nbsp;
          {user?.sub?.trim() === "auth0|6499edf47232ab62b7b2f38f" ? (
            <>
              &nbsp;<Link to="/admin_buy">Buy Tickets</Link>&nbsp;
              &nbsp;<Link to="/admin_check_money">Check Money</Link>&nbsp;
              &nbsp;<Link to="/admin_status">Auction Status</Link>&nbsp;
              &nbsp;<Link to="/admin_auction">Auction Tickets</Link>&nbsp;
              &nbsp;<Link to="/admin_offers">Offers</Link>&nbsp;
              &nbsp;<Link to="/admin_proposals">Proposals</Link>&nbsp;
            </>
          ) : (
            <>
            &nbsp;<Link to="/profile">Profile</Link>&nbsp;
            &nbsp;<Link to="/events">Buy Tickets</Link>&nbsp;
            </>
          )}
        </>
      )}
      &nbsp;<Link to="/events_map">Map</Link>&nbsp;
    </div>
  );
};

export default Navbar;
