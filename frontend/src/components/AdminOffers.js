import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Layout from "./Layout";
import axios from "axios";

const API_HOST = "https://api.ticketseller.lat";
//const API_HOST = "http://localhost:8000";

const AdminOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const fetchOffers = async () => {
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

      const response = await axios.get(`${API_HOST}/auctions/offers`, options);
      setOffers(response.data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user, navigate]);

  const handleAcceptProposal = async (auctionId, proposalId) => {
    try {
      const token = await getAccessTokenSilently();

      const options = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.post(
        `${API_HOST}/auctions/accept`,
        { auction_id: auctionId, proposal_id: proposalId },
        options
      );

      console.log("Acceptance response:", response.data);
      // Refresh the offer list
      fetchOffers();
    } catch (error) {
      console.error("Failed to accept offer:", error);
    }
  };

  const handleRejectProposal = async (auctionId, proposalId) => {
    try {
      const token = await getAccessTokenSilently();

      const options = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.post(
        `${API_HOST}/auctions/reject`,
        { auction_id: auctionId, proposal_id: proposalId },
        options
      );

      console.log("Rejection response:", response.data);
      // Refresh the offer list
      fetchOffers();
    } catch (error) {
      console.error("Failed to reject offer:", error);
    }
  };

  return (
    <Layout>
      <h2>Show Offers received</h2>
      {offers.length > 0 ? (
        <div>
          {offers.map((proposal) => (
            <div key={proposal.proposal_id} className="proposal-item">
              <h3>Event Name: {proposal.event.name}</h3>
              <p>Auction ID: {proposal.auction_id}</p>
              <p>Event ID: {proposal.event_id}</p>
              <p>Quantity: {proposal.quantity}</p>
              <p>Group ID: {proposal.group_id}</p>
              <p>Type: {proposal.type}</p>
              <p>Status: {proposal.status}</p>

              {proposal.status !== "done" && proposal.status !== "rejected" && (
                <>
                  <button
                    onClick={() =>
                      handleAcceptProposal(proposal.auction_id, proposal.proposal_id)
                    }
                  >
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRejectProposal(proposal.auction_id, proposal.proposal_id)
                    }
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No offers available</p>
      )}
    </Layout>
  );
};

export default AdminOffers;
