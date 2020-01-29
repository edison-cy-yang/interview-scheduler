import { useState, useEffect, useReducer } from "react";
import axios from "axios";
import reducer, { SET_DAY, SET_APPLICATION_DATA, SET_INTERVIEW, DELETE_INTERVIEW } from '../reducers/application';

export default function useApplicationData(initial) {
  const [state, dispatch] = useReducer(reducer, initial);

  const setDay = day => {
    dispatch({ type: SET_DAY, value: day });
  };

  function socketHandler() {
    const webSocket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);
    webSocket.onopen = function(event) {
      webSocket.send("ping");
    };
    webSocket.onmessage = function(event) {
      const response = JSON.parse(event.data);
      console.log(response);
      //TODO: socket sync to be implemented
      // if (response.type === SET_INTERVIEW) {
      //   //find the appointment with id
      //   if (response.interview) {
      //     dispatch({type: SET_INTERVIEW, value: { id: response.id, interview: response.interview}});
      //   } else {
      //     dispatch({type: DELETE_INTERVIEW, value: {id: response.id}});
      //   }
      // }
    };
  }

  useEffect(() => {
    socketHandler();
    const daysPromise = axios.get("/api/days");
    const appointmentsPromise = axios.get("/api/appointments");
    const interviewersPromise = axios.get("/api/interviewers");
    Promise.all([daysPromise, appointmentsPromise, interviewersPromise]).then(
      ([days, appointments, interviewers]) => {

        dispatch({
          type: SET_APPLICATION_DATA,
          value: {
            days: days.data,
            appointments: appointments.data,
            interviewers: interviewers.data
          }
        });
      }
    );
  }, []);

  function bookInterview(id, interview) {
    return axios
      .put(`/api/appointments/${id}`, { interview })
      .then(res => {
        dispatch({
          type: SET_INTERVIEW,
          value: { id, interview, sync: false }
        });
        return Promise.resolve(res);
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  function cancelInterview(id) {
    return axios
      .delete(`/api/appointments/${id}`)
      .then(res => {
        dispatch({ type: DELETE_INTERVIEW, value: { id, sync: false } });
        return Promise.resolve();
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  return {
    state,
    setDay,
    bookInterview,
    cancelInterview
  };
};
