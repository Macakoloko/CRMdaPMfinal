import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/styles/calendar-styles.css';

// Configurar o localizador para português do Brasil
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

// Componente customizado para eventos
const EventComponent = ({ event }) => {
  return (
    <div 
      className="custom-event-wrapper" 
      style={{ 
        borderLeftColor: event.color || '#3B82F6',
      }}
    >
      <div className="custom-event-content">
        <div className="custom-event-title">{event.title}</div>
        <div className="custom-event-time">
          {moment(event.start).format("HH:mm")} - {moment(event.end).format("HH:mm")}
        </div>
      </div>
    </div>
  );
};

// Componente customizado para a barra de ferramentas
const CustomToolbar = ({ date, onNavigate, onView, view, views }) => {
  const navigate = (action) => {
    onNavigate(action);
  };

  const viewNames = {
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda'
  };

  const getFormattedDate = () => {
    switch (view) {
      case 'month':
        return moment(date).format('MMMM YYYY');
      case 'week':
        const start = moment(date).startOf('week').format('D MMM');
        const end = moment(date).endOf('week').format('D MMM YYYY');
        return `${start} - ${end}`;
      case 'day':
        return moment(date).format('dddd, D [de] MMMM');
      default:
        return moment(date).format('MMMM YYYY');
    }
  };

  return (
    <div className="rbc-toolbar custom-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={() => navigate('PREV')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-chevron-left">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button type="button" onClick={() => navigate('TODAY')}>Hoje</button>
        <button type="button" onClick={() => navigate('NEXT')}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-chevron-right">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      <span className="rbc-toolbar-label">{getFormattedDate()}</span>
      
      <div className="rbc-btn-group">
        {views.map(name => (
          <button
            key={name}
            type="button"
            className={view === name ? 'rbc-active' : ''}
            onClick={() => onView(name)}
          >
            {viewNames[name]}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente customizado para os dias da semana
const CustomHeaderCell = ({ date }) => {
  const day = moment(date).format('ddd');
  return (
    <div className="custom-header-cell">
      {day.charAt(0).toUpperCase() + day.slice(1)}
    </div>
  );
};

const CalendarComponent = ({ eventos }) => {
  // Função para personalizar aparência dos eventos
  const eventPropGetter = (event) => ({
    style: {
      borderLeftColor: event.color || '#3B82F6',
    },
  });

  // Função para personalizar células de data no mês
  const dayPropGetter = (date) => {
    const isToday = moment(date).isSame(moment(), 'day');
    const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
    
    return {
      className: isWeekend ? 'weekend-day' : '',
      style: isToday ? { backgroundColor: '#F3F4F6' } : {}
    };
  };

  return (
    <Calendar
      localizer={localizer}
      events={eventos}
      startAccessor="start"
      endAccessor="end"
      style={{ height: '100%' }}
      messages={{
        next: "Próximo",
        previous: "Anterior",
        today: "Hoje",
        month: "Mês",
        week: "Semana",
        day: "Dia",
        agenda: "Agenda",
        date: "Data",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "Não há agendamentos neste período."
      }}
      views={['month', 'week', 'day', 'agenda']}
      defaultView='week'
      components={{
        event: EventComponent,
        toolbar: CustomToolbar,
        header: CustomHeaderCell
      }}
      eventPropGetter={eventPropGetter}
      dayPropGetter={dayPropGetter}
    />
  );
};

export default CalendarComponent; 