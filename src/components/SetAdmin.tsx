import React, { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

const SetAdmin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSetAdmin = async () => {
    if (!email) {
      setMessage("Please enter an email address.");
      return;
    }
    try {
      const functions = getFunctions();
      const setAdmin = httpsCallable(functions, "setAdmin");
      const result = await setAdmin({ email });
      setMessage((result.data as any).message);
    } catch (error) {
      setMessage("An error occurred while setting the admin.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Set Admin</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email address"
      />
      <button onClick={handleSetAdmin}>Set Admin</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SetAdmin;
