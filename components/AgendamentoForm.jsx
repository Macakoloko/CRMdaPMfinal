import React, { useState } from 'react';

const AgendamentoForm = () => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalEndTime = endTime;
    
    // Exemplo de um objeto de agendamento a ser enviado
    const appointment = {
      startTime,
      endTime: finalEndTime,
      // outros campos necessários
    };
    
    // Enviar para API, etc.
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="startTime">Horário de início</label>
        <input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="endTime">Horário de término</label>
        <input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      {/* ... rest of the form ... */}
    </form>
  );
};

export default AgendamentoForm; 