import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./Layout";
import axios from "axios";

const API_HOST = "https://api.ticketseller.lat";
//const API_HOST = "http://localhost:8000";

const AdminProposals = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const fetchProposals = async () => {
    try {
      if (user?.sub?.trim() !== "auth0|6499edf47232ab62b7b2f38f") {
        alert("ERROR: User is not authorized to see this page");
        navigate("/"); // Redirect to the desired page
        return;
      }

      const token = await getAccessTokenSilently();

      const options = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_HOST}/auctions/proposals`, options);
      setProposals(response.data);
    } catch (error) {
      console.error("Failed to fetch proposals:", error);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user, navigate]);

  return (
    <Layout>
      <h2>Show Proposals</h2>
      <div>
        {proposals.map((proposal) => (
          <div key={proposal.proposal_id} className="proposal-item">
            <h3>Proposal ID: {proposal.proposal_id}</h3>
            <p>Auction ID: {proposal.auction_id}</p>
            <p>Event ID: {proposal.event_id}</p>
            <p>Quantity: {proposal.quantity}</p>
            <p>Group ID: {proposal.group_id}</p>
            <p>Type: {proposal.type}</p>
            <p>Status: {proposal.status}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default AdminProposals;
