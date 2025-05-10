import { useSelector, useDispatch } from "react-redux";
import {
  login as loginAction,
  logout as logoutAction,
  fetchCurrentDriver,
} from "../redux/slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();
  const { currentDriver, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const login = async (email, password) => {
    try {
      const resultAction = await dispatch(loginAction({ email, password }));
      if (loginAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.error?.message || "Login failed");
      }
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await dispatch(logoutAction());
  };

  return {
    currentDriver,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };
};

export default useAuth;
