import { combineReducers } from "redux";
import todoReducer from "#app/features/daily-tasks/slice";

export const rootReducer = combineReducers({
  tasks: todoReducer,
});
