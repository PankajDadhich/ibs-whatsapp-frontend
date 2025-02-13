import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import timeGridPlugin from "@fullcalendar/timegrid";
import { Badge, Col, Container, Row } from "react-bootstrap";
import EventEdit from "./EventEdit";
import WhatsAppAPI from "../api/WhatsAppAPI";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { isMobile } from "react-device-detect";

const Calendar = () => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [showEventModel, setShowEventModel] = useState(false);
  const calendarRef = useRef(null);
  const [event, setEvent] = useState({});

  const handleDateClick = (selectInfo) => {
    let curTime = selectInfo.date;
    curTime.setHours(new Date().getHours());
    curTime.setMinutes(new Date().getMinutes());
    setEvent({
      startdatetime: curTime,
      targetdate: curTime,
      enddatetime: selectInfo.date,
    });
    setShowEventModel(true);
  };

  const createEvent = (selectInfo) => {
    let title = prompt("Please enter a new title for your event");
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      const event = {
        id: Math.floor(Math.random() * 1000),
        title,
        start: new Date(), //selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      };

      calendarApi.addEvent(event);
    }
  };

  const handleEventClick = (arg) => {
    setEvent({
      title: arg.event.title,
      description: arg.event.extendedProps.description,
      id: arg.event.id,
      type: arg.event.extendedProps.type,
      priority: arg.event.extendedProps.priority,
      status: arg.event.extendedProps.status,
      startdatetime: arg.event.start,
      targetdate: arg.event.start,
      enddatetime: arg.event.end ? arg.event.end : arg.event.start,
      ownerid: arg.event.extendedProps.ownerid,
      ownername: arg.event.extendedProps.ownername,
    });
    setShowEventModel(true);
  };

  const submitEvents = (eventRec) => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.unselect(); // clear date selection
    if (calendarApi.getEventById(eventRec.id))
      calendarApi.getEventById(eventRec.id).remove();
    calendarApi.addEvent(eventRec);
    setShowEventModel(false);
  };

  const deleteEvents = (eventRec) => {
    let calendarApi = calendarRef.current.getApi();
    calendarApi.unselect(); // clear date selection

    calendarApi.getEventById(eventRec.id).remove();
    setShowEventModel(false);
  };

  const customEventContent = (eventInfo) => {
    return (
      <Row>
        <Col lg={12}>{eventInfo.event.title}</Col>
        <Col lg={12}>
          <span
            style={{
              display: "inline-block",
              marginRight: "1rem",
              fontSize: ".8rem",
              padding: "0 5px 0 5px",
              borderRadius: "5px",
              marginBottom: ".5rem",
              color: "#000",
              backgroundColor: "#b1c6e5",
            }}
          >
            {eventInfo.event.extendedProps.ownername}
          </span>
        </Col>
      </Row>
    );
  };

  useEffect(() => {
    if (isMobile) {
      calendarRef.current.getApi().changeView("timeGridWeek");
    } else {
      if (location?.pathname?.split("/").length > 2) {
        calendarRef.current.getApi().changeView("timeGridDay");
      }
    }

    taskList();
  }, []);

  const taskList = () => {
    async function init() {
      let tasks = await WhatsAppAPI.fetchTasksWithoutParent();

      let taskFilter = tasks.filter(
        (value, index, array) =>
          value.startdatetime != null || value.targetdate != null
      );

      let arrayOfTask = taskFilter.map((value, index, array) => {
        return {
          id: value.id,
          title: value.title,
          start: value.startdatetime || value.targetdate,
          end: value.enddatetime || value.targetdate,
          description: value.description,
          type: value.type,
          priority: value.priority,
          status: value.status,
          ownerid: value.ownerid,
          ownername: value.ownername,
          color:
            value.priority === "High"
              ? "tomato"
              : value.priority === "Normal"
              ? ""
              : "#7c8fa3",
        };
      });

      setEvents(arrayOfTask);
    }
    init();
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <div style={{ backgroundColor: "red" }}>
          <b>{eventInfo.event.title}</b>
          <p>{eventInfo.timeText}</p>
        </div>
      </>
    );
  };

  return (
    <Container className="pt-4">
      {showEventModel && (
        <EventEdit
          show={showEventModel}
          onHide={() => setShowEventModel(false)}
          parentid="abc"
          eventRec={event}
          table="user"
          submitEvents={submitEvents}
          deleteEvents={deleteEvents}
        />
      )}
      <FullCalendar
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          timeGridPlugin,
          momentTimezonePlugin,
        ]}
        initialView="dayGridMonth"
        events={events}
        timeZone="Asia/Kolkata"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        eventBackgroundColor="#0d6efd"
        eventBorderColor="#0d6efd"
        eventDisplay="block"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventContent={customEventContent}
        height={"auto"}
        // eventsSet={taskList}
        ref={calendarRef}
      />
    </Container>
  );
};

export default Calendar;
