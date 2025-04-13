import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const ReadPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/read")
      .then((response) => response.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error fetching records");
        setLoading(false);
      });
  }, []);

  const handleDelete = (recordId) => {
    fetch(`http://localhost:5000/delete/${recordId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        setRecords((prevRecords) =>
          prevRecords.filter((record) => record._id !== recordId)
        );
      })
      .catch((err) => {
        setError("Error deleting record");
        console.error(err);
      });
  };

  const handleUpdate = (recordId) => {
    navigate(`/update/${recordId}`);
  };

  if (loading) return <p>Loading records...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      {/* Back to Frontpage Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ 
          marginBottom: "1rem", 
          padding: "0.5rem 1rem", 
          cursor: "pointer", 
          backgroundColor: "#007BFF", 
          color: "white", 
          border: "none", 
          borderRadius: "5px" 
        }}
      >
        ⬅️ Back to Frontpage
      </button>

      <h2>📋 Stored Weather Records</h2>
      <p>Temperatures UNAVAILABLE as free-tier usage of OpenWeather API CANNOT access historical data</p>
      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Start Date</th>
              <th style={thStyle}>End Date</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Temperature</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) =>
              record.temperatures.map((temp, tempIndex) => (
                <tr key={`${index}-${tempIndex}`}>
                  {tempIndex === 0 && (
                    <>
                      <td rowSpan={record.temperatures.length} style={tdStyle}>
                        {record.location}
                      </td>
                      <td rowSpan={record.temperatures.length} style={tdStyle}>
                        {record.start_date}
                      </td>
                      <td rowSpan={record.temperatures.length} style={tdStyle}>
                        {record.end_date}
                      </td>
                    </>
                  )}
                  <td style={tdStyle}>{temp.date}</td>
                  <td style={tdStyle}>{temp.temperature}</td>
                  {tempIndex === 0 && (
                    <td rowSpan={record.temperatures.length} style={tdStyle}>
                      <button
                        onClick={() => handleUpdate(record._id)}
                        style={{ marginRight: "0.5rem" }}
                      >
                        Update
                      </button>
                      <button onClick={() => handleDelete(record._id)}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  padding: "0.5rem",
  backgroundColor: "#f2f2f2",
  textAlign: "left"
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "0.5rem"
};

