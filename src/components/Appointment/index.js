import React from "react";

import "./styles.scss";

import Header from "./Header";
import Show from "./Show";
import Empty from "./Empty";
import Status from "./Status";
import Confirm from "./Confirm";

import useVisualMode from "hooks/useVisualMode";
import Form from "./Form";

const EMPTY = "EMPTY";
const SHOW = "SHOW";
const CREATE = "CREATE";
const SAVING = "SAVING";
const DELETING = "DELETING";
const CONFIRM = "CONFIRM";

export default function Appointment(props) {
  const { mode, transition, back } = useVisualMode(
    props.interview ? SHOW : EMPTY
  );

  function save(name, interviewer) {
    const interview = {
      student: name,
      interviewer
    };   
    return () => {
      transition(SAVING);
      props.bookInterview(props.id, interview).then(() => {
        transition(SHOW);
      });
    };
  }

  function deleteInterview() {
    return () => {
      transition(DELETING);
      props.cancelInterview(props.id).then(() => {
        transition(EMPTY);
      })
    }
  }

  function confirmDelete() {
    return () => {
      transition(CONFIRM);
    };
  };

  return (
    <article className="appointment">
      <Header time={props.time} />
      {mode === EMPTY && <Empty onAdd={() => {transition(CREATE)}} />}
      {mode === SHOW && (
        <Show
          student={props.interview.student}
          interviewer={props.interview.interviewer}
          onDelete={confirmDelete}
      />
      )}
      {mode === CREATE && (
        <Form
          interviewers={props.interviewers}
          onSave={save}
          onCancel={() => {back()}}
        />
      )}  
      {mode === SAVING && <Status message={"saving"} />}    
      {mode === DELETING && <Status message="deleting" />}
      {mode === CONFIRM && <Confirm message="Are you sure you want to cancel the appointment?" onConfirm={deleteInterview} onCancel={() => back()}/>}
    </article>
  );
}
