import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./Layout";
import axios from "axios";

const API_HOST = "https://api.ticketseller.lat";
//const API_HOST = "http://localhost:8000";

const AdminAuctionsStatus = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const { user, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        if (user?.sub?.trim() !== "auth0|6499edf47232ab62b7b2f38f") {
          alert("ERROR: User is not authorized to see this page");
          navigate("/"); // Redirect to the desired page
          return;
        }

        const token = await getAccessTokenSilently();
  
        const options = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const response = await axios.get(`${API_HOST}/auctions`, options);
        setAuctions(response.data);
      } catch (error) {
        console.error("Failed to fetch auctions:", error);
      }
    };

    fetchAuctions();
  }, [user, navigate]);

  
  return (
    <Layout>
      <h2>Show auctions you have published</h2>
      <div>
        {auctions.map((auction) => (
          <div key={auction.id} className="auction-item">
            <h4>Event Title: {auction.event.name}</h4>
            <p>Auction ID: {auction.auction_id}</p>
            <p>Event ID: {auction.event_id}</p>
            <p>Quantity: {auction.quantity}</p>
            <p>Group ID: {auction.group_id}</p>
            <p>Type: {auction.type}</p>
            <p>Status: {auction.status}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminAuctionsStatus;