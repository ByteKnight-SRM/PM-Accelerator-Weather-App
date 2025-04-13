import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CreatePage = () => {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [responseMsg, setResponseMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('location', location);
        formData.append('start_date', startDate);
        formData.append('end_date', endDate);

        try {
            const response = await fetch('http://localhost:5000/create', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const text = await response.text();
                setResponseMsg(`<span style="color:green;">✅ ${text}</span>`);
                setLocation('');
                setStartDate('');
                setEndDate('');

                // Redirect after success
                setTimeout(() => {
                    navigate('/readpage');
                }, 1000);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || "Unknown error occurred.");
            }

        } catch (error) {
            console.error('Error:', error);
            setResponseMsg(`<span style="color:red;">❌ Failed to create entry: ${error.message}</span>`);
        }
    };

    return (
        <div style={{
            padding: '40px',
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        }}>
            <h2 style={{ marginBottom: '30px', textAlign: 'center', color: '#333' }}>
                📅 Create Weather Entry ☁️
            </h2>

            <form onSubmit={handleSubmit}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    📍 Location:
                </label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Enter location..."
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        marginBottom: '20px',
                        fontSize: '16px',
                    }}
                />

                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    🕓 Start Date (YYYY-MM-DD):
                </label>
                <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    placeholder="2025-04-12"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        marginBottom: '20px',
                        fontSize: '16px',
                    }}
                />

                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                    🕓 End Date (YYYY-MM-DD):
                </label>
                <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    placeholder="2025-04-15"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        marginBottom: '30px',
                        fontSize: '16px',
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: '12px 25px',
                        backgroundColor: '#6f42c1',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5936a2'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6f42c1'}
                >
                    ✨ Create Entry
                </button>
            </form>

            <div
                style={{
                    marginTop: '25px',
                    textAlign: 'center',
                    fontSize: '16px',
                }}
                dangerouslySetInnerHTML={{ __html: responseMsg }}
            />
        </div>
    );
};
