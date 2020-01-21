import React from 'react';

import "./styles.scss";

import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";

export default function Appointment(props) {
  if (props.interview) {
    return (
      <article className="appointment">
        <Header 
          time={props.time}
        />
        <Show 
          student={props.interview.student}
          interviewer={props.interview.interviewer}
        />
      </article>
    )
  } else {
    return (
      <article className="appointment">
        <Header 
          time={props.time}
        />
        <Empty />
      </article>
    )
  }
};