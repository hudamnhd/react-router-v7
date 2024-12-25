import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App.tsx";

export const QuranApp = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
};
