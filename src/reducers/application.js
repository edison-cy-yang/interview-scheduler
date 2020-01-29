export const SET_DAY = "SET_DAY";
export const SET_APPLICATION_DATA = "SET_APPLICATION_DATA";
export const SET_INTERVIEW = "SET_INTERVIEW";
export const DELETE_INTERVIEW = "DELETE_INTERVIEW";

export default function reducer(state, action) {
  switch (action.type) {
    case SET_DAY:
      return { ...state, day: action.value };
    // Load all application data on initial app load
    case SET_APPLICATION_DATA:
      return {
        ...state,
        days: action.value.days,
        appointments: action.value.appointments,
        interviewers: action.value.interviewers
      };
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

      //if interview is null, then we are creating a new interview, update spot count
      //if not null, we are editing existing interview, dont update spot count
      if (state.appointments[action.value.id].interview) {
        return { ...state, appointments};
      } else {
        const days = updateCount(state.days, {
          type: SET_INTERVIEW,
          day: state.day
        });
        return { ...state, appointments, days };
      }
    }
    case DELETE_INTERVIEW: {
      //set appointment interview to null
      const appointment = {
        ...state.appointments[action.value.id],
        interview: null
      };

      const appointments = {
        ...state.appointments,
        [action.value.id]: appointment
      };

      const days = updateCount(state.days, {
        type: DELETE_INTERVIEW,
        day: state.day
      });

      return { ...state, appointments, days };
    }
    default:
      throw new Error(
        `Tried to reduce with unsupported action type: ${action.type}`
      );
  }
};

// Update count of spots left after interview is created/deleted
function updateCount(array, action) {
  return array.map((item, index) => {
    if (item.name !== action.day) {
      return item;
    } else {
      if (action.type === SET_INTERVIEW) {
        return {
          ...item,
          spots: item.spots - 1
        };
      } else if (action.type === DELETE_INTERVIEW) {
        return {
          ...item,
          spots: item.spots + 1
        };
      } else {
        return item;
      }
    }
  });
}