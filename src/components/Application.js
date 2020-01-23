import React, { useState, useEffect } from "react";
import axios from 'axios';

import "components/Application.scss";

import "components/DayList";
import DayList from "components/DayList";
import Appointment from "components/Appointment";
import {getAppointmentsForDay, getInterview, getInterviewersForDay} from "../helpers/selectors";

// const appointments = [
//   {
//     id: 1,
//     time: "12pm",
//   },
//   {
//     id: 2,
//     time: "1pm",
//     interview: {
//       student: "Lydia Miller-Jones",
//       interviewer: {
//         id: 1,
//         name: "Sylvia Palmer",
//         avatar: "https://i.imgur.com/LpaY82x.png",
//       }
//     }
//   }, 
//   {
//     id: 3,
//     time: "2pm",
//     interview: {
//       student: "edison",
//       interviewer: {
//         id: 1,
//         name: "Sylvia Palmer",
//         avatar: "https://i.imgur.com/T2WwVfS.png"
//       }
//     }
//   },
//   {
//     id: 4,
//     time: "3pm"
//   },
//   {
//     id: 5,
//     time: "4pm"
//   }
// ];

export default function Application(props) {
  // const [day, setDay] = useState("Monday");
  // const [days, setDays] = useState([]);

  const [state, setState] = useState({
    day: "Monday",
    days: [],
    appointments: {},
    interviewers: {}
  });

  const setDay = day => setState(prev => ({ ...prev, day}));

  useEffect(() => {
    const daysPromise = axios.get("http://localhost:8001/api/days");
    const appointmentsPromise = axios.get("http://localhost:8001/api/appointments");
    const interviewersPromise = axios.get("http://localhost:8001/api/interviewers");
    Promise.all([daysPromise, appointmentsPromise, interviewersPromise]).then((all) => {
      console.log(all[2].data);
      setState(prev => ({...prev, days: all[0].data, appointments: all[1].data, interviewers: all[2].data}));
    });
  }, []);

  function bookInterview(id, interview) {
    // console.log(id, interview);
    //copy the specific appointment object with id, as well as the interview object
    const appointment = {
      ...state.appointments[id],
      interview: { ...interview }
    };
    //Now we have a single appointment object, update this appointment in the appointments object
    const appointments = {
      ...state.appointments,
      [id]: appointment
    };
    //make request to save the appointment
    return axios.put(`http://localhost:8001/api/appointments/${id}`, {interview})
      .then(res => {
        setState({...state, appointments});
        return Promise.resolve(res);
      })
      .catch(err => {
        return Promise.reject(err);
      })
  }

  function cancelInterview(id) {
    //set appointment interview to null
    const appointment = {
      ...state.appointments[id],
      interview: null
    }
    const appointments = {
      ...state.appointments,
      [id]: appointment
    }
    return axios.delete(`http://localhost:8001/api/appointments/${id}`)
      .then(res => {
        setState({...state, appointments});
        return Promise.resolve();
      })
      .catch(err => {
        return Promise.reject(err);
      })
    
  }

  const appointments = getAppointmentsForDay(state, state.day);
  const interviewers = getInterviewersForDay(state, state.day);

  const appointmentsComponent = appointments.map((appointment) => {
    const interview = getInterview(state, appointment.interview);
    return (
    <Appointment
      key={appointment.id}
      id={appointment.id}
      time={appointment.time}
      interview={interview}
      interviewers={interviewers}
      bookInterview={bookInterview}
      cancelInterview={cancelInterview}
    />);
  });

  return (
    <main className="layout">
      <section className="sidebar">
        <img
          className="sidebar--centered"
          src="images/logo.png"
          alt="Interview Scheduler"
        />
        <hr className="sidebar__separator sidebar--centered" />
        <nav className="sidebar__menu">
          <DayList 
            days={state.days}
            day={state.day}
            setDay={setDay}
          />
        </nav>
        <img
          className="sidebar__lhl sidebar--centered"
          src="images/lhl.png"
          alt="Lighthouse Labs"
        />
      </section>
      <section className="schedule">
        {appointmentsComponent}
        <Appointment key="last" time="5pm" bookInterview={bookInterview}/>
      </section>
    </main>
  );
}
