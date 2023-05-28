import axios, { Axios } from "axios";
import { createStore, applyMiddleware, combineReducers } from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";

const history = [];

// action names
const inc = "account/increment";
const dec = "account/decrement";
const incByValue = "account/incrementByValue";
const getAccUsrPending = "account/getUser/pending";
const getAccUsrFulfilled = "account/getUser/fulfilled";
const getAccUsrRejected = "account/getUser/rejected";
const incBonus = "bonus/increaseBonus";

// reducer
const accountReducer = (state = { amount: 1 }, action) => {
  switch (action.type) {
    case inc:
      return { amount: state.amount + 1 };
    case dec:
      return { amount: state.amount - 1 };
    case incByValue:
      return { amount: state.amount + action.payload };
    case getAccUsrFulfilled:
      return { amount: action.payload };
    case getAccUsrPending:
      return { ...state, pending: true };
    case getAccUsrRejected:
      return { ...state, error: action.error };
    default:
      return state;
  }
};

const bonusReducer = (state = { points: 0 }, action) => {
  switch (action.type) {
    case incBonus:
      return { points: state.points + 1 };
    case incByValue:
      if (action.payload >= 100) {
        return { points: state.points + 1 };
      }
    default:
      return state;
  }
};

// store
const store = createStore(
  combineReducers({ account: accountReducer, bonus: bonusReducer }),
  applyMiddleware(thunk.default, logger.default)
);

// store.subscribe(() => {
//   // global state
//   history.push(store.getState());
//   console.log(history);
// });

// action creator
function getUserAccount(id) {
  return async (dispatch, getState) => {
    try {
      dispatch(getAccountUsrPending());
      const { data } = await axios.get(`http://localhost:3000/account/${id}`);
      dispatch(getAccountUsrFulfilled(data.amount));
    } catch (error) {
      dispatch(getAccountUsrRejected(error?.message));
    }
  };
}

function getAccountUsrFulfilled(value) {
  return { type: getAccUsrFulfilled, payload: value, pending: false };
}
function getAccountUsrPending() {
  return { type: getAccUsrPending };
}
function getAccountUsrRejected(value) {
  return { type: getAccUsrRejected, error: value, pending: false };
}

const increment = () => {
  return { type: inc };
};
const decremnt = () => {
  return { type: dec };
};
const incrementByAmount = (value) => {
  return { type: incByValue, payload: value };
};

function increaseBonus() {
  return { type: incBonus };
}

setInterval(() => {
  // action
  // store.dispatch(increment());
  //   store.dispatch(decremnt());
  // store.dispatch(incrementByAmount(200));
  store.dispatch(getUserAccount(3));
  // store.dispatch(increaseBonus());
}, 5000);
