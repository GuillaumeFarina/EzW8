import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Success = () => {
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (sessionId) {
      axios
        .get(`${import.meta.env.VITE_API_URL}api/payment/session/${sessionId}`)
        .then((response) => {
          setSessionData(response.data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des détails de la session :", error);
        });
    }
  }, [sessionId]);

  return (
    <div>
      <h2>Paiement réussi !</h2>
      <p>Merci pour votre paiement. Votre demande a été enregistrée.</p>
      {sessionData && (
        <div>
          <p>Montant payé : {sessionData.amount_total / 100} €</p>
          <p>Date du paiement : {new Date(sessionData.created * 1000).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default Success;
