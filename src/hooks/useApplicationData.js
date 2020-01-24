import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const DELETE_INTERVIEW = "DELETE_INTERVIEW";

function reducer(state, action) {
  console.log(action);
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.value }
    case SET_APPLICATION_DATA:
      return {...state, days: action.value.days, appointments: action.value.appointments, interviewers: action.value.interviewers};
    case SET_INTERVIEW: {
      return {...state, appointments: action.value.appointments, days: action.value.days}
    }
    case DELETE_INTERVIEW: {
      return {...state, appointments: action.value.appointments, days: action.value.days}
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

export default function useApplicationData(initial) {
  const [state, dispatch] = useReducer(reducer, initial);

  const setDay = (day) => {
    dispatch({type: SET_DAY, value: day});
  }

  useEffect(() => {
    const daysPromise = axios.get("http://localhost:8001/api/days");
    const appointmentsPromise = axios.get("http://localhost:8001/api/appointments");
    const interviewersPromise = axios.get("http://localhost:8001/api/interviewers");
    Promise.all([daysPromise, appointmentsPromise, interviewersPromise]).then((all) => {
      console.log(state);
      
      dispatch({type: SET_APPLICATION_DATA, value: {days: all[0].data, appointments: all[1].data, interviewers: all[2].data}});
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
        //Need to get state.days, find the day, and decrement one 
        const days = [...state.days];
        ///use the appointment ID to find which day this appointment exists in
        for (let i = 0; i < days.length; i++) {
          const appointmentsForDay = days[i].appointments;
          for (let j = 0; j < appointmentsForDay.length; j++) {
            if (appointmentsForDay[j] === id) {
              days[i].spots--;
            }
          }
        }

        dispatch({type: SET_INTERVIEW, value: {appointments, days}});
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
        //Need to get state.days, find the day, and decrement one 
        const days = [...state.days];
        ///use the appointment ID to find which day this appointment exists in
        for (let i = 0; i < days.length; i++) {
          const appointmentsForDay = days[i].appointments;
          for (let j = 0; j < appointmentsForDay.length; j++) {
            if (appointmentsForDay[j] === id) {
              days[i].spots++;
            }
          }
        }
        dispatch({type: DELETE_INTERVIEW, value: {appointments, days}});
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