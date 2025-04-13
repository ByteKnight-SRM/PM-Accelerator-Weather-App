import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // ✅ Added useNavigate

export const UpdatePage = () => {
  const { id } = useParams(); // record_id from URL
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [responseMsg, setResponseMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch('http://localhost:5000/read');
        const data = await response.json();

        const selectedRecord = data.find(record => record._id === id);
        if (selectedRecord) {
          setLocation(selectedRecord.location || '');
          setStartDate(selectedRecord.start_date || '');
          setEndDate(selectedRecord.end_date || '');
        } else {
          setResponseMsg('Record not found.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching records:', error);
        setResponseMsg('Failed to load record.');
        setLoading(false);
      }
    };

    fetchRecord();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setResponseMsg(result.message || 'Update completed.');
        // ✅ Redirect to readpage after short delay
        setTimeout(() => {
          navigate('/readpage');
        }, 1000);
      } else {
        setResponseMsg(result.message || 'Update failed.');
      }
    } catch (error) {
      console.error('Update failed:', error);
      setResponseMsg('Failed to update the record.');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🛠️ Update Record</h2>
      <p>🛠️ Lets user select a new date range for a particular location get corresponding temperatures</p>
      {location ? (
        <>
          <p style={styles.location}>
            <strong>📍 Location:</strong> {location}
          </p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Start Date (YYYY-MM-DD)</label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>End Date (YYYY-MM-DD)</label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.button}>✅ Update</button>
          </form>
        </>
      ) : (
        <p style={styles.error}>{responseMsg}</p>
      )}

      {responseMsg && location && (
        <div style={styles.success}>{responseMsg}</div>
      )}
    </div>
  );
};

// 🎨 Styles
const styles = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '30px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    backgroundColor: '#fdfdfd',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '25px',
    color: '#4B0082',
  },
  location: {
    textAlign: 'center',
    fontSize: '18px',
    marginBottom: '20px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#4B0082',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    marginTop: '50px',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    marginTop: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
  }
};
