import { useState, useEffect, useReducer } from 'react';
import axios from 'axios';

const SET_DAY = "SET_DAY";
const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
const SET_INTERVIEW = "SET_INTERVIEW";
const DELETE_INTERVIEW = "DELETE_INTERVIEW";

function reducer(state, action) {
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.value }
    case SET_APPLICATION_DATA:
      return {...state, days: action.value.days, appointments: action.value.appointments, interviewers: action.value.interviewers};
    case SET_INTERVIEW: {
      //copy the specific appointment object with id, as well as the interview object
      const appointment = {
        ...state.appointments[action.value.id],
        interview: { ...action.value.interview }
      };
      //Now we have a single appointment object, update this appointment in the appointments object
      const appointments = {
        ...state.appointments,
        [action.value.id]: appointment
      };

      const days = updateCount(state.days, {type: SET_INTERVIEW, day: state.day});

      return {...state, appointments, days}
    }
    case DELETE_INTERVIEW: {
      //set appointment interview to null
      const appointment = {
        ...state.appointments[action.value.id],
        interview: null
      }

      const appointments = {
        ...state.appointments,
        [action.value.id]: appointment
      }

      const days = updateCount(state.days, {type: DELETE_INTERVIEW, day: state.day});

      return {...state, appointments, days}
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
}

function updateCount(array, action) {
  return array.map((item, index) => {
    if (item.name !== action.day) {
      return item;
    } else {
      if (action.type === SET_INTERVIEW) {
        return {
          ...item,
          spots: item.spots - 1
        } 
      } else if (action.type === DELETE_INTERVIEW) {
        return {
          ...item,
          spots: item.spots + 1
        }
      } else {
        return item;
      }
    }
  });
}


export default function useApplicationData(initial) {
  const [state, dispatch] = useReducer(reducer, initial);

  const setDay = (day) => {
    dispatch({type: SET_DAY, value: day});
  }

  function socketHandler() {
    const webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    webSocket.onopen = function(event) {
      webSocket.send("ping");
    }
    webSocket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      console.log(response);
      if (response.type === SET_INTERVIEW) {
        //find the appointment with id
        if (response.interview) {
          dispatch({type: SET_INTERVIEW, value: { id: response.id, interview: response.interview}});
        } else {
          dispatch({type: DELETE_INTERVIEW, value: {id: response.id}});
        }
      }
    }
  }

  useEffect(() => {
    socketHandler();
    const daysPromise = axios.get("http://localhost:8001/api/days");
    const appointmentsPromise = axios.get("http://localhost:8001/api/appointments");
    const interviewersPromise = axios.get("http://localhost:8001/api/interviewers");
    Promise.all([daysPromise, appointmentsPromise, interviewersPromise]).then((all) => {
      console.log(state);
      
      dispatch({type: SET_APPLICATION_DATA, value: {days: all[0].data, appointments: all[1].data, interviewers: all[2].data}});
    });
  }, []);

  function bookInterview(id, interview) {
    return axios.put(`http://localhost:8001/api/appointments/${id}`, {interview})
      .then(res => {
        dispatch({type: SET_INTERVIEW, value: { id, interview}});
        return Promise.resolve(res);
      })
      .catch(err => {
        return Promise.reject(err);
      })
  }

  function cancelInterview(id) {
    return axios.delete(`http://localhost:8001/api/appointments/${id}`)
      .then(res => {
        dispatch({type: DELETE_INTERVIEW, value: {id}});
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