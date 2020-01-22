export function getAppointmentsForDay(state, day) {
  const days = state.days;
  const appointments = state.appointments;
  const result = [];

  for (const d of days) {
    if (d.name === day) {
      for (const appointment of d.appointments) {
        result.push(appointments[appointment]);
      }
    } 
  }
  return result;
};

export function getInterview(state, interview) {
  const interviewers = state.interviewers;
  const result = {};

  if (!interview) {
    return null;
  }

  result["student"] = interview.student;
  result["interviewer"] = interviewers[interview.interviewer];

  return result;
};

export function getInterviewersForDay(state, day) {
  const days = state.days;
  const result = [];
  const interviewers = state.interviewers;

  for (const d of days) {
    if (d.name === day) {
      for (const i of d.interviewers) {
        result.push(interviewers[i]);
      }
    }
  }
  return result;
}