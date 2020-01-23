import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useApplicationData(initial) {
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

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
}