import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./Layout";

const API_HOST = 'https://api.ticketseller.lat';
//const API_HOST = 'http://localhost:8000';


const AdminCheckMoney = () => {
  const { user } = useAuth0();
  const [walletData, setWalletData] = useState(null); // State to store wallet data
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        if (user?.sub?.trim() !== "auth0|6499edf47232ab62b7b2f38f") {
          alert("ERROR: User is not authorized to see this page");
          navigate("/"); // Redirect to the desired page
          return;
        }

        // Fetch wallet data
        const response = await fetch(`${API_HOST}/wallet_admin`);
        const data = await response.json();
        setWalletData(data);
      } catch (error) {
        console.error(error);
      }
    };

    checkAdmin();
  }, [user, navigate]);

  return (
    <Layout>
      {walletData && (
        <div>
          <h3>Wallet Data:</h3>
          <p>Group Id: {walletData.group_id}</p>
          <p>Balance: {walletData.balance}</p>
        </div>
      )}
    </Layout>
  );
};

export default AdminCheckMoney;
